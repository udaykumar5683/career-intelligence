import pdf from 'pdf-parse-fork';

/**
 * Service for detecting if a PDF contains selectable text or is likely scanned.
 */
export class ScannedPdfDetector {
  /**
   * Detects if a PDF is likely a scanned document.
   * Returns true if the PDF has very little text relative to its size/pages.
   */
  static async isScanned(buffer: Buffer): Promise<boolean> {
    try {
      const data = await pdf(buffer);
      
      // If there's absolutely no text, it's definitely scanned or image-only
      if (!data.text || data.text.trim().length === 0) {
        return true;
      }

      // Heuristic: Check text length per page
      // A typical resume page has at least 500-1000 characters.
      // If it has less than 100 characters per page on average, it's likely scanned.
      const charCount = data.text.trim().length;
      const pageCount = data.numpages || 1;
      const charsPerPage = charCount / pageCount;

      console.log(`[ScannedPdfDetector] PDF info: ${charCount} chars, ${pageCount} pages (${charsPerPage.toFixed(1)} chars/page)`);

      if (charsPerPage < 100) {
        return true;
      }

      // Another check: Look for common resume keywords
      // If it's a "real" resume PDF, it should have some common words
      const commonWords = ['experience', 'education', 'skills', 'projects', 'summary', 'contact'];
      const lowercaseText = data.text.toLowerCase();
      const wordMatchCount = commonWords.filter(word => lowercaseText.includes(word)).length;

      if (wordMatchCount === 0 && charCount < 300) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('[ScannedPdfDetector] Detection failed:', error);
      // If we can't parse it as a normal PDF, assume we might need OCR
      return true;
    }
  }
}
