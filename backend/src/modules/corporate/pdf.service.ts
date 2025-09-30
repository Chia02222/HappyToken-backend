import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfService {
  async renderAgreementPdf(html: string): Promise<Uint8Array> {
    // Lazy-import Puppeteer to avoid ESM/CJS interop issues
    const puppeteer = (await import('puppeteer')).default;
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfData = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' } });
      return pdfData;
    } finally {
      await browser.close();
    }
  }
}


