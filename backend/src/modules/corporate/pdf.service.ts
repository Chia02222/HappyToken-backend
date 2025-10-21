export class PdfService {
  async renderAgreementPdfFromUrl(frontendBaseUrl: string, corporateId: string): Promise<Uint8Array> {
    const puppeteer = (await import('puppeteer')).default;
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    try {
      const page = await browser.newPage();
      const url = `${frontendBaseUrl.replace(/\/$/, '')}/corporate/${corporateId}/pdf?embed=1`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
      const pdfData = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', right: '12mm', bottom: '15mm', left: '12mm' },
        displayHeaderFooter: false,
      });
      return pdfData;
    } finally {
      await browser.close();
    }
  }

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
      const pdfData = await page.pdf({ 
        format: 'A4', 
        printBackground: true, 
        margin: { top: '15mm', right: '12mm', bottom: '15mm', left: '12mm' },
        displayHeaderFooter: false
      });
      return pdfData;
    } finally {
      await browser.close();
    }
  }
}


