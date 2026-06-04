/**
 * Service for cleaning and normalizing text extracted via OCR.
 */
export class TextCleaner {
  /**
   * Cleans and normalizes extracted text.
   */
  static clean(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // Remove artifacts (e.g., non-printable characters)
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

    // Normalize whitespace (fix spacing)
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Normalize newlines (keep some structure but fix broken lines)
    cleaned = cleaned.replace(/(\r\n|\n|\r)/g, '\n');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Clean broken words (common in OCR, e.g., "res- ume" -> "resume")
    // This is a simple heuristic: if a word is hyphenated at the end of a line, join it.
    cleaned = cleaned.replace(/(\w+)-\s+(\w+)/g, '$1$2');

    // Remove multiple spaces again after joins
    cleaned = cleaned.replace(/[ ]{2,}/g, ' ');

    // Normalize common resume headers if they look broken
    const commonHeaders = [
      'EXPERIENCE',
      'EDUCATION',
      'SKILLS',
      'PROJECTS',
      'CERTIFICATIONS',
      'SUMMARY',
      'CONTACT',
    ];

    for (const header of commonHeaders) {
      const regex = new RegExp(`\\b${header.split('').join('\\s*')}\\b`, 'gi');
      cleaned = cleaned.replace(regex, header);
    }

    return cleaned.trim();
  }
}
