export class PdfService {
    async renderAgreementPdfFromUrl(frontendBaseUrl, corporateId) {
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
        }
        finally {
            await browser.close();
        }
    }
    async renderAgreementPdf(html) {
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
        }
        finally {
            await browser.close();
        }
    }
}
//# sourceMappingURL=pdf.service.js.map