export declare class PdfService {
    renderAgreementPdfFromUrl(frontendBaseUrl: string, corporateId: string): Promise<Uint8Array>;
    renderAgreementPdf(html: string): Promise<Uint8Array>;
}
