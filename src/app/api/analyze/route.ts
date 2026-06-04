import { NextRequest } from 'next/server';
import { runAnalysis } from '@/lib/analysis-engine';
import type { AnalysisStage } from '@/types/analysis';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

// Allowed MIME types for resume uploads
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.webp'];

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Extracts the file extension from a filename
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot >= 0 ? filename.slice(lastDot).toLowerCase() : '';
}

/**
 * POST /api/analyze
 * 
 * Accepts a resume file via FormData and returns SSE stream with:
 * - Progress events: data: {type: "progress", stage, progress}\n\n
 * - Complete event: data: {type: "complete", results}\n\n
 * - Error event: data: {type: "error", message}\n\n
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Please sign in to analyze resumes.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Upsert user into database to ensure they exist
    try {
      console.log(`[api/analyze] Syncing user ${user.id} to database...`);
      await db.user.upsert({
        where: { email: user.email! },
        update: { name: user.user_metadata?.full_name || user.email?.split('@')[0] },
        create: {
          id: user.id, // Use Supabase ID as Prisma ID for consistency
          email: user.email!,
          name: user.user_metadata?.full_name || user.email?.split('@')[0],
        },
      });
      console.log(`[api/analyze] User synced successfully`);
    } catch (dbError) {
      console.error('[api/analyze] Failed to sync user to database:', dbError);
      // We continue analysis even if DB sync fails, though reports won't be saved
      // This ensures the user still gets their analysis results in the UI
    }

    // Parse the FormData
    const formData = await request.formData();
    const file = formData.get('resume');

    // Validate file exists
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No resume file provided. Please upload a file.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate it's a File object (not a string)
    if (!(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file provided.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file extension
    const extension = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return new Response(
        JSON.stringify({
          error: `Invalid file type "${extension}". Please upload a PDF, DOCX, TXT, or Image file (PNG, JPG, WEBP).`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate MIME type (allow empty string as some browsers don't report it)
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error: `Invalid file type. Please upload a PDF, DOCX, TXT, or Image file (PNG, JPG, WEBP).`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          error: `File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 5MB.`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file is not empty
    if (file.size === 0) {
      return new Response(
        JSON.stringify({ error: 'File is empty. Please upload a valid resume.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Determine MIME type (use file.type or infer from extension)
    let mimeType = file.type;
    if (!mimeType) {
      switch (extension) {
        case '.pdf':
          mimeType = 'application/pdf';
          break;
        case '.docx':
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case '.txt':
          mimeType = 'text/plain';
          break;
        case '.png':
          mimeType = 'image/png';
          break;
        case '.jpg':
        case '.jpeg':
          mimeType = 'image/jpeg';
          break;
        case '.webp':
          mimeType = 'image/webp';
          break;
        default:
          mimeType = 'application/octet-stream';
      }
    }

    // Read the file buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Helper to send SSE events
        const sendEvent = (data: Record<string, unknown>) => {
          try {
            const message = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(message));
          } catch (encodeError) {
            console.error('Failed to encode SSE event:', encodeError);
          }
        };

        // Progress callback that sends SSE events
        const onProgress = (stage: AnalysisStage, progress: number, message: string) => {
          sendEvent({ type: 'progress', stage, progress, message });
        };

        try {
          // Send initial progress
          sendEvent({ type: 'progress', stage: 'uploading', progress: 5, message: 'Resume uploaded successfully' });

          // Run the full analysis pipeline
          const results = await runAnalysis(fileBuffer, file.name, mimeType, onProgress, user.id);

          // Send the complete results
          sendEvent({ type: 'complete', results });

          // Send done signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (analysisError) {
          console.error('Analysis error in stream:', analysisError);

          const errorMessage =
            analysisError instanceof Error
              ? analysisError.message
              : 'An unexpected error occurred during analysis';

          sendEvent({ type: 'error', message: errorMessage });

          try {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch {
            // Controller may already be closed
          }
        }
      },

      cancel() {
        // Client disconnected
        console.log('SSE stream cancelled by client');
      },
    });

    // Return the streaming response with SSE headers
    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (requestError) {
    console.error('Request processing error:', requestError);

    return new Response(
      JSON.stringify({
        error: 'Failed to process request. Please try again.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Reject non-POST methods
 */
export async function GET() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed. Use POST to upload a resume.' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function PUT() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed. Use POST to upload a resume.' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function DELETE() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed. Use POST to upload a resume.' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}
