import { createWorker, Worker } from 'tesseract.js';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';
import { ImagePreprocessor } from './image-preprocessor';
import { TextCleaner } from './text-cleaner';

// Set up worker for pdfjs in Node.js environment
if (typeof window === 'undefined') {
  // Polyfills for Node.js if needed by pdfjs legacy
  if (typeof (global as any).DOMMatrix === 'undefined') {
    (global as any).DOMMatrix = class DOMMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      constructor() {}
    };
  }
}

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';

/**
 * Service for performing OCR on images and scanned PDFs.
 */
export class OcrService {
  private static worker: Worker | null = null;

  /**
   * Initializes the Tesseract worker.
   */
  private static async getWorker(): Promise<Worker> {
    if (!this.worker) {
      this.worker = await createWorker('eng');
    }
    return this.worker;
  }

  /**
   * Performs OCR on an image buffer.
   */
  static async processImage(
    buffer: Buffer,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      console.log('[OcrService] Preprocessing image...');
      const preprocessedBuffer = await ImagePreprocessor.preprocess(buffer);

      console.log('[OcrService] Starting OCR...');
      const worker = await this.getWorker();
      
      const { data: { text } } = await worker.recognize(preprocessedBuffer);

      console.log('[OcrService] OCR completed. Cleaning text...');
      return TextCleaner.clean(text);
    } catch (error) {
      console.error('[OcrService] Image OCR failed:', error);
      throw new Error('Failed to extract text from image.');
    }
  }

  /**
   * Performs OCR on a scanned PDF.
   * Renders each page to an image and then runs OCR.
   */
  static async processScannedPdf(
    buffer: Buffer,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      console.log('[OcrService] Processing scanned PDF...');
      
      // Convert buffer to Uint8Array for pdfjs
      const uint8Array = new Uint8Array(buffer);
      const loadingTask = pdfjs.getDocument({ data: uint8Array });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      const totalPages = pdf.numPages;

      for (let i = 1; i <= totalPages; i++) {
        console.log(`[OcrService] Processing PDF page ${i}/${totalPages}...`);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
        
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        
        await page.render({
          canvasContext: context as any,
          viewport: viewport
        }).promise;

        const imageBuffer = canvas.toBuffer('image/png');
        const pageText = await this.processImage(imageBuffer);
        
        fullText += pageText + '\n\n';

        if (onProgress) {
          onProgress((i / totalPages) * 100);
        }
      }

      return fullText.trim();
    } catch (error) {
      console.error('[OcrService] Scanned PDF OCR failed:', error);
      throw new Error('Failed to extract text from scanned PDF.');
    }
  }

  /**
   * Terminates the worker when no longer needed.
   */
  static async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
