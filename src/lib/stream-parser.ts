/**
 * Utility to safely parse and clean AI stream content.
 * Handles partial chunks, SSE prefixes, and JSON metadata.
 */

export interface StreamParserOptions {
  onContent: (content: string) => void;
  onDone?: () => void;
  onError?: (error: any) => void;
}

/**
 * Robustly extracts text content from various AI provider JSON formats.
 */
export function extractContentFromJSON(json: any): string {
  if (!json || typeof json !== 'object') return '';
  
  // Standard OpenAI-like structure: choices[0].delta.content or choices[0].text
  const delta = json.choices?.[0]?.delta;
  if (delta?.content) return delta.content;
  
  if (json.choices?.[0]?.text) return json.choices[0].text;
  
  // Alternative structure: { content: "..." }
  if (typeof json.content === 'string') return json.content;
  
  return '';
}

/**
 * Creates a stream parser that handles buffering and line-by-line parsing.
 */
export function createSSEParser(options: StreamParserOptions) {
  let buffer = '';

  return {
    /**
     * Process a new chunk of data (string or Uint8Array)
     */
    processChunk(chunk: string | Uint8Array) {
      const text = typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk, { stream: true });
      buffer += text;

      const lines = buffer.split('\n');
      // Keep the last partial line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Handle SSE data prefix
        let data = trimmed;
        if (trimmed.startsWith('data: ')) {
          data = trimmed.slice(6).trim();
        }

        if (data === '[DONE]') {
          options.onDone?.();
          continue;
        }

        // Try to parse as JSON
        if (data.startsWith('{') && data.endsWith('}')) {
          try {
            const parsed = JSON.parse(data);
            const content = extractContentFromJSON(parsed);
            if (content) options.onContent(content);
          } catch (e) {
            // If it looks like JSON but fails to parse, it might be a partial line 
            // that split across chunks. We should technically put it back in the buffer.
            buffer = line + (buffer ? '\n' + buffer : '');
            break; 
          }
        } else {
          // If it's not JSON, it might be raw text content
          // but we filter out common JSON artifacts just in case
          if (!trimmed.includes('"choices"') && !trimmed.includes('"delta"')) {
            options.onContent(trimmed);
          }
        }
      }
    },
    
    /**
     * Call this when the stream is finished to process any remaining buffer
     */
    flush() {
      if (buffer.trim()) {
        this.processChunk('\n'); // Trigger processing of the last line
      }
      buffer = '';
    }
  };
}
