import { PDFParse } from 'pdf-parse';
import fs from 'fs/promises';
import { BadRequestError, InternalServerError } from '../utils/errors';

export class PDFService {
  async extractText(filePath: string): Promise<string> {
    let parser: PDFParse | null = null;
    try {
      const dataBuffer = await fs.readFile(filePath);
      parser = new PDFParse({ data: dataBuffer });

      const result = await parser.getText();
      return this.cleanText(result.text);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new BadRequestError('PDF file not found');
      }
      throw new InternalServerError(`Failed to extract text from PDF: ${error.message}`);
    } finally {
      if (parser) {
        await parser.destroy();
      }
    }
  }

  async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    let parser: PDFParse | null = null;
    try {
      parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return this.cleanText(result.text);
    } catch (error: any) {
      throw new BadRequestError(`Invalid PDF file: ${error.message}`);
    } finally {
      if (parser) {
        await parser.destroy();
      }
    }
  }

  cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
  }
}

export default new PDFService();
