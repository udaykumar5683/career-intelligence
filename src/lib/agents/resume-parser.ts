import type { ResumeProfile, ResumeExperience, ResumeEducation, AnalysisStage } from '@/types/analysis';
import { createRequire } from 'module';
import { ScannedPdfDetector } from '../ocr/scanned-pdf-detector';
import { OcrService } from '../ocr/ocr-service';
import { db } from '../db';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse-fork');
const mammoth = require('mammoth');

/**
 * Progress callback type
 */
export type ResumeProgressCallback = (
  stage: AnalysisStage,
  progress: number,
  message: string
) => void;

/**
 * Cleans LLM JSON responses by removing markdown code fences if present
 */
export function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

/**
 * Default empty profile for fallback
 */
const EMPTY_PROFILE: ResumeProfile = {
  name: '',
  email: '',
  phone: '',
  location: '',
  summary: 'Resume could not be fully parsed. Partial analysis available.',
  skills: [],
  education: [],
  experience: [],
  certifications: [],
  languages: [],
  projects: [],
};

const PARSING_PROMPT = `You are an expert resume parser. Analyze the following resume text and extract ALL relevant information into a structured JSON format.

Return ONLY a valid JSON object with this exact structure (no markdown, no code fences, no extra text):
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number or empty string",
  "location": "City, State/Country or empty string",
  "summary": "Professional summary or objective from the resume, or empty string if none",
  "skills": ["skill1", "skill2", "skill3"],
  "education": [
    {
      "degree": "Degree name with field",
      "institution": "School/University name",
      "year": "Graduation year or timeframe",
      "gpa": "GPA if mentioned, otherwise omit this field"
    }
  ],
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "duration": "Time period",
      "description": "Brief description of responsibilities and achievements"
    }
  ],
  "certifications": ["certification1", "certification2"],
  "languages": ["language1", "language2"],
  "projects": ["project1 description", "project2 description"]
}

IMPORTANT RULES:
- Extract ALL skills mentioned in the resume, including technical skills, soft skills, tools, and technologies
- For education, include all degrees and institutions mentioned
- For experience, include all work experiences with as much detail as possible
- For projects, provide brief descriptions of each project mentioned
- If a field is not found in the resume, use an empty string for strings or empty array for arrays
- Do NOT fabricate information that is not in the resume
- Return ONLY the JSON, no additional text or markdown formatting`;

/**
 * Parses the LLM response text into a ResumeProfile object
 */
export function parseProfileResponse(responseText: string): ResumeProfile {
  const cleanedJson = cleanJsonResponse(responseText);

  try {
    const parsed = JSON.parse(cleanedJson) as ResumeProfile;

    return {
      name: parsed.name || '',
      email: parsed.email || '',
      phone: parsed.phone || '',
      location: parsed.location || '',
      summary: parsed.summary || '',
      skills: Array.isArray(parsed.skills) ? parsed.skills.map(String) : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications.map(String) : [],
      languages: Array.isArray(parsed.languages) ? parsed.languages.map(String) : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects.map(String) : [],
    };
  } catch (parseError) {
    console.error('Failed to parse LLM response as JSON:', parseError);
    console.error('Cleaned response:', cleanedJson.slice(0, 500));
    return EMPTY_PROFILE;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper function to call GROQ API
 */
async function callGROQ(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>): Promise<string> {
  console.log('8. Final prompt sent to GROQ (resume parser):', JSON.stringify(messages, null, 2));
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[resume-parser] GROQ API error:', response.status, errorText);
    throw new Error(`GROQ API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response content from GROQ');
  }

  console.log('9. GROQ response (resume parser):', content);
  return content;
}

/**
 * Uses regular LLM (GROQ) to parse resume text content
 */
async function parseWithLLM(textContent: string, storedResumesContext: string = '', retries = 2): Promise<ResumeProfile> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const responseText = await callGROQ([
        { role: 'system', content: PARSING_PROMPT + storedResumesContext },
        {
          role: 'user',
          content: `Here is the resume text to analyze:\n\n${textContent}`,
        },
      ]);

      return parseProfileResponse(responseText);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`LLM parse attempt ${attempt}/${retries} failed:`, lastError.message);
      if (attempt < retries) {
        await sleep(2000 * attempt);
      }
    }
  }

  throw lastError || new Error('LLM parsing failed after retries');
}

/**
 * Uses VLM approach - since GROQ doesn't support vision yet, fall back to text-only
 */
async function parseWithVLM(
  fileBuffer: Buffer,
  mimeType: string,
  storedResumesContext: string = '',
  retries = 2
): Promise<ResumeProfile> {
  // Fallback to text-based parsing since GROQ doesn't support vision
  console.warn('[resume-parser] Vision-based parsing not available with GROQ, falling back to text-only');
  let extractedText = '';
  const isPdf = mimeType === 'application/pdf';
  const isDocx = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  
  try {
    if (isPdf) {
      const pdf = require('pdf-parse-fork');
      const data = await pdf(fileBuffer);
      extractedText = data.text;
    } else if (isDocx) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value;
    } else {
      extractedText = fileBuffer.toString('utf-8');
    }
  } catch (e) {
    // Ignore and use empty text
  }
  
  if (extractedText && extractedText.trim().length > 20) {
    return parseWithLLM(extractedText, storedResumesContext, retries);
  }
  
  throw new Error('Could not extract enough text for parsing');
}

/**
 * Checks if a string contains binary content (null bytes or high ratio of
 * unprintable characters). Returns true if the content appears to be binary.
 */
function isBinaryContent(text: string): boolean {
  // Check for null bytes — definitive sign of binary content
  if (text.includes('\0')) {
    return true;
  }

  // Check ratio of unprintable characters (excluding common whitespace)
  const sampleSize = Math.min(text.length, 8000);
  const sample = text.slice(0, sampleSize);
  let unprintableCount = 0;
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    // Allow newlines, tabs, carriage returns, and normal printable chars
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
      unprintableCount++;
    }
  }

  // If more than 5% of characters are unprintable, treat as binary
  const ratio = unprintableCount / sampleSize;
  return ratio > 0.05;
}

/**
 * Main resume parsing function.
 */
export async function parseResume(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  onProgress?: ResumeProgressCallback,
  userId?: string
): Promise<ResumeProfile> {
  console.log(`[resume-parser] Processing ${fileName} (${mimeType}, ${(fileBuffer.length / 1024).toFixed(1)}KB)`);

  // Fetch all stored resumes for context if userId is provided
  let storedResumesContext = '';
  if (userId) {
    try {
      const storedResumes = await db.resume.findMany({
        where: { userId },
        orderBy: { version: 'desc' },
        include: { report: true }
      });
      
      if (storedResumes.length > 0) {
        storedResumesContext = `\n\n--- PREVIOUSLY STORED RESUMES FOR CONTEXT ---\n`;
        storedResumes.forEach((resume, index) => {
          storedResumesContext += `\nResume v${resume.version} (${resume.fileName}):\n`;
          if (resume.report?.resumeData) {
            const profile = resume.report.resumeData as any;
            storedResumesContext += `  - Name: ${profile.name || 'Unknown'}\n`;
            storedResumesContext += `  - Summary: ${profile.summary || 'N/A'}\n`;
            storedResumesContext += `  - Skills: ${(profile.skills || []).join(', ')}\n`;
            storedResumesContext += `  - Experience: ${(profile.experience || []).map((e: any) => `${e.title} at ${e.company}`).join(', ')}\n`;
          }
        });
        storedResumesContext += `\n--- END OF PREVIOUS RESUMES ---\n\n`;
        console.log(`[resume-parser] Found ${storedResumes.length} stored resumes for context`);
      }
    } catch (e) {
      console.error('[resume-parser] Failed to fetch stored resumes:', e);
    }
  }

  let extractedText = '';
  const isImage = mimeType.startsWith('image/') || 
                  /\.(png|jpe?g|webp)$/i.test(fileName);
  const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

  try {
    if (isPdf) {
      console.log('[resume-parser] Detecting if PDF is scanned...');
      const isScanned = await ScannedPdfDetector.isScanned(fileBuffer);
      
      if (isScanned) {
        console.log('[resume-parser] PDF appears to be scanned. Using OCR...');
        if (onProgress) onProgress('ocr', 0.1, 'Converting scanned PDF to images...');
        extractedText = await OcrService.processScannedPdf(fileBuffer, (progress) => {
          if (onProgress) onProgress('ocr', progress / 100, `OCR Scanning PDF... ${Math.round(progress)}%`);
        });
      } else {
        console.log('[resume-parser] Extracting text from searchable PDF...');
        const data = await pdf(fileBuffer);
        extractedText = data.text;
      }
    } else if (isImage) {
      console.log('[resume-parser] Processing image with OCR...');
      if (onProgress) onProgress('ocr', 0.1, 'Preprocessing image...');
      extractedText = await OcrService.processImage(fileBuffer, (progress) => {
        if (onProgress) onProgress('ocr', progress / 100, `OCR Scanning image... ${Math.round(progress)}%`);
      });
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.toLowerCase().endsWith('.docx')
    ) {
      console.log('[resume-parser] Extracting text from DOCX...');
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value;
    } else {
      // Default to text extraction for TXT or other text-like files
      extractedText = fileBuffer.toString('utf-8');
    }

    if (extractedText && extractedText.trim().length > 20) {
      console.log(`[resume-parser] Text extracted successfully (${extractedText.length} chars), using LLM parser`);
      return await parseWithLLM(extractedText, storedResumesContext);
    }
  } catch (extractError) {
    console.warn('[resume-parser] Text extraction/OCR failed, falling back to VLM:', extractError);
  }

  // Fallback to VLM if text extraction failed or returned nothing
  try {
    return await parseWithVLM(fileBuffer, mimeType, storedResumesContext);
  } catch (vlmError) {
    console.error('[resume-parser] VLM parsing failed after retries, trying LLM fallback:', vlmError);

    // Last resort: Try to extract what we can with LLM using file metadata and whatever text we have
    try {
      const fallbackPrompt = `You are an expert career advisor. A resume file (${fileName}) was uploaded but could not be fully parsed.
Please create a generic but plausible profile based ONLY on the filename and size.
DO NOT use "John Smith" or any other placeholder name unless the filename suggests it.
If the filename is generic (e.g., "resume.pdf"), use "Unknown Candidate".

Return a valid JSON object with the ResumeProfile structure.`;

      const responseText = await callGROQ([
        { role: 'system', content: fallbackPrompt },
        {
          role: 'user',
          content: `Resume file: ${fileName} (${(fileBuffer.length / 1024).toFixed(1)}KB). ${extractedText ? `Partial text: ${extractedText.slice(0, 500)}` : ''}`,
        },
      ]);
      if (responseText) {
        return parseProfileResponse(responseText);
      }
    } catch (finalError) {
      console.error('[resume-parser] Final fallback failed:', finalError);
    }

    return EMPTY_PROFILE;
  }
}
