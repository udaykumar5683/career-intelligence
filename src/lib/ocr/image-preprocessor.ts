import sharp from 'sharp';

/**
 * Service for preprocessing images to improve OCR accuracy.
 */
export class ImagePreprocessor {
  /**
   * Preprocesses an image buffer for better OCR results.
   */
  static async preprocess(buffer: Buffer): Promise<Buffer> {
    try {
      let image = sharp(buffer);

      // Get image metadata to decide on resizing
      const metadata = await image.metadata();

      // Grayscale conversion
      image = image.grayscale();

      // Contrast enhancement (using linear adjustment)
      image = image.linear(1.5, -0.2); // Increase contrast

      // Noise reduction (using median filter or blur/threshold)
      image = image.median(1);

      // Resizing: ensure a minimum density/size for OCR
      // Tesseract works best when characters are ~30-50 pixels tall
      if (metadata.width && metadata.width < 1500) {
        const scaleFactor = 1500 / metadata.width;
        image = image.resize({
          width: 1500,
          fit: 'contain',
        });
      }

      // Thresholding (binary image) can also help OCR
      image = image.threshold(180);

      return await image.toBuffer();
    } catch (error) {
      console.error('[ImagePreprocessor] Preprocessing failed:', error);
      // If preprocessing fails, return original buffer as fallback
      return buffer;
    }
  }
}
