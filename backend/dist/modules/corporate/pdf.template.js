"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTimeline = buildTimeline;
exports.buildAgreementHtml = buildAgreementHtml;
const esc = (s) => String(s ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function buildTimeline(corp) {
    const out = [];
    const logs = Array.isArray(corp?.investigation_log) ? [...corp.investigation_log] : [];
    logs.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
    let latestRejection = null;
    const contacts = Array.isArray(corp?.contacts) ? corp.contacts : [];
    const primary = contacts[0];
    const nameOf = (c) => ((c?.first_name || '') + ' ' + (c?.last_name || '')).trim();
    const roleOf = (c) => c?.company_role || '';
    const deriveSubmitter = (fromStatus) => {
        if (fromStatus === 'Pending 2nd Approval') {
            const byRole = contacts.find(c => c.system_role === 'secondary_approver');
            return `${nameOf(byRole)}${roleOf(byRole) ? ` (${roleOf(byRole)})` : ''}`.trim();
        }
        return `${nameOf(primary)}${roleOf(primary) ? ` (${roleOf(primary)})` : ''}`.trim();
    };
    for (const log of logs) {
        const ts = String(log.timestamp || '');
        const note = String(log.note || '');
        if (log.to_status === 'Amendment Requested') {
            const submitted = deriveSubmitter(log.from_status);
            const details = submitted ? `submitted by: ${esc(submitted)}` : '';
            out.push({ action: 'Amendment Requested', timestamp: ts, details });
        }
        else if (log.to_status === 'Rejected' || /reject/i.test(note)) {
            let reason = (note.match(/Review\s*Notes:\s*([^|\n]+)/i)?.[1] || note.match(/amendment\s+declined\s+by\s+crt\s+team\s*\(reason:\s*([^)]+)\)/i)?.[1] || note.match(/rejected\s+by\s+[^:]+:\s*([^\n]+)/i)?.[1] || '').trim();
            if (!reason && note.trim()) {
                reason = note.trim();
            }
            if (!reason)
                reason = 'Corporate rejected.';
            const reviewer = (note.match(/Reviewed\s*by:\s*([^|\n]+)/i)?.[1] || note.match(/rejected\s+by\s+([^:]+):/i)?.[1] || 'CRT Team').trim();
            const submitter = deriveSubmitter(log.from_status);
            latestRejection = { ts, reason, reviewer, submitter };
        }
        else if ((note && /amendment\s+approved\s+by\s+crt\s+team/i.test(note)) ||
            (log.from_status === 'Amendment Requested' && (log.to_status === 'Pending 1st Approval' || log.to_status === 'Pending 2nd Approval') && note && /approved/i.test(note))) {
            const target = String(log.to_status || '');
            const notified = target === 'Pending 2nd Approval' ? 'Second Approver' : 'First Approver';
            const details = [`Reverted to: ${esc(target)}`, `Notified: ${esc(notified)}`, `Submitted by: CRT Team`].filter(Boolean).join('\n');
            out.push({ action: 'Amendment Approved', timestamp: ts, details });
        }
        else if (log.to_status === 'Pending 2nd Approval' || /first approval/i.test(note)) {
            out.push({ action: 'First Approval Granted', timestamp: ts, details: esc(note || 'First approval completed') });
        }
        else if (log.to_status === 'Cooling Period' || /second approval/i.test(note)) {
            out.push({ action: 'Second Approval Granted', timestamp: ts, details: esc(note || 'Second approval completed') });
        }
    }
    if (latestRejection) {
        const details = [`Reason: ${esc(latestRejection.reason)}`, `Submitted by: CRT Team`].join('\n');
        const isAmendmentRejection = latestRejection.reason.includes('Amendment') || latestRejection.reason.includes('amendment');
        const actionName = isAmendmentRejection ? 'Amendment Declined' : 'Corporate Rejected';
        out.push({ action: actionName, timestamp: latestRejection.ts, details });
    }
    return out;
}
function buildAgreementHtml(corp) {
    const title = 'e-Commercial Agreement';
    const header = `<h1 style="font-family:Arial,sans-serif;font-size:18px;margin:0 0 8px 0;text-align:center;">${title}</h1>`;
    const sub = `<div style=\"font-family:Arial,sans-serif;font-size:12px;color:#444;margin-bottom:10px;text-align:center;\">HT Voucher Trading Sdn Bhd (Company No: 202401035271 (1581118A)) — HappieToken</div>`;
    const contacts = Array.isArray(corp?.contacts) ? corp.contacts : [];
    const primary = contacts[0];
    const second = corp.secondary_approver;
    const timeline = buildTimeline(corp);
    return `
  <html><head><meta charset=\"utf-8\" /><style>
  body { font-family: Arial, sans-serif; font-size: 12px; color:#111; line-height: 1.4; }
  h2 { font-size: 14px; margin: 16px 0 8px; font-weight: bold; }
  h4 { font-size: 13px; margin: 12px 0 6px; font-weight: bold; }
  .grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .muted{ color:#555; }
  .row{ margin-bottom:8px; }
  .timeline-item{ margin-bottom:10px; }
  .flex{ display:flex; justify-content:space-between; }
  .page-break{ page-break-before: always; }
  .approvers-grid{ display:grid; grid-template-columns:1fr 1fr; gap:32px; }
  .approver-section{ border-right: 1px solid #ccc; padding-right: 16px; }
  .approver-section:last-child{ border-right: none; padding-right: 0; padding-left: 16px; }
  .terms-section{ margin-bottom: 20px; }
  .terms-item{ margin-bottom: 12px; }
  .terms-content{ margin-left: 16px; margin-top: 4px; }
  ul{ margin: 8px 0; padding-left: 24px; }
  li{ margin-bottom: 4px; }
  </style></head><body>
    ${header}${sub}
    
    <h2 class="page-break">Corporate Summary</h2>
    <div class=\"grid\">
      <div class=\"row\"><b>Company Name:</b> ${esc(corp.company_name)}</div>
      <div class=\"row\"><b>Registration No.:</b> ${esc(corp.reg_number)}</div>
      <div class=\"row\" style=\"grid-column:1 / span 2\"><b>Office Address:</b> ${esc(corp.office_address1 || '')}${corp.office_address2 ? `, ${esc(corp.office_address2)}` : ''}</div>
      <div class=\"row\"><b>City:</b> ${esc(corp.city || '')}</div>
      <div class=\"row\"><b>State:</b> ${esc(corp.state || '')}</div>
      <div class=\"row\"><b>Postcode:</b> ${esc(corp.postcode || '')}</div>
      <div class=\"row\"><b>Country:</b> ${esc(corp.country || '')}</div>
      <div class=\"row\"><b>Website:</b> ${esc(corp.website || '')}</div>
      <div class=\"row\" style=\"grid-column:1 / span 2\"><b>Account Note:</b> ${esc(corp.account_note || '')}</div>
    </div>
    
    <h2>Commercial Terms</h2>
    <div class=\"grid\">
      <div class=\"row\"><b>Agreement From:</b> ${esc(corp.agreement_from || '')}</div>
      <div class=\"row\"><b>Agreement To:</b> ${esc(corp.agreement_to || '')}</div>
      <div class=\"row\"><b>Credit Limit:</b> ${esc(corp.credit_limit || '')}</div>
      <div class=\"row\"><b>Credit Terms:</b> ${esc(corp.credit_terms || '')}</div>
      <div class=\"row\"><b>Transaction Fee:</b> ${esc(corp.transaction_fee || '')}%</div>
      <div class=\"row\"><b>Late Payment Interest:</b> ${esc(corp.late_payment_interest || '')}%</div>
      <div class=\"row\"><b>White Labeling Fee:</b> ${esc(corp.white_labeling_fee || 'N/A')}</div>
      <div class=\"row\"><b>Custom Feature Fee:</b> ${esc(corp.custom_feature_fee || '')}</div>
    </div>
    
    <h2 class="page-break">Generic Terms & Conditions</h2>
    <div class="terms-section">
      <p style="font-size: 10px; color: #666; margin-bottom: 16px;">Last Updated: [Insert Date]</p>
      <p>These Standard Terms and Conditions ("Terms") govern the relationship between HT Voucher Trading Sdn Bhd (Company No. [Insert], trading as HappieToken, hereinafter referred to as the "Company") and any party ("Client") who enters into a commercial arrangement with the Company for the use of its products or services, whether by signing an order form, accepting a quotation, or registering via an online form. These Terms are legally binding and apply to all Clients unless otherwise agreed in writing.</p>
      
      <div class="terms-item">
        <h4>1. Definitions</h4>
        <ul>
          <li>"Agreement" means the binding contract between the Company and the Client, consisting of these Terms and any applicable Order Form or Commercial Terms Schedule.</li>
          <li>"Services" means the platform access, features, tools, APIs, or solutions provided by the Company.</li>
          <li>"Client Data" means any information, material, or content uploaded, submitted, or shared by the Client through the Services.</li>
          <li>"Effective Date" means the date on which the Client first accepts or is deemed to accept these Terms.</li>
        </ul>
      </div>
      
      <div class="terms-item">
        <h4>2. Provision of Services</h4>
        <p class="terms-content">The Company shall provide the Services described in the relevant Commercial Terms Schedule or online order form. The Company reserves the right to improve, modify, or discontinue any part of the Services with reasonable notice.</p>
      </div>
      
      <div class="terms-item">
        <h4>3. Client Obligations</h4>
        <p class="terms-content">The Client agrees to use the Services in accordance with these Terms and any applicable laws and regulations. The Client is responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.</p>
      </div>
      
      <div class="terms-item">
        <h4>4. Payment Terms</h4>
        <p class="terms-content">Payment terms are as specified in the Commercial Terms Schedule. The Client agrees to pay all fees and charges in accordance with the agreed payment schedule.</p>
      </div>
      
      <div class="terms-item">
        <h4>5. Limitation of Liability</h4>
        <p class="terms-content">The Company's liability is limited to the maximum extent permitted by law. The Company shall not be liable for any indirect, incidental, special, or consequential damages.</p>
      </div>
      
      <div class="terms-item">
        <h4>6. Termination</h4>
        <p class="terms-content">Either party may terminate this Agreement with written notice as specified in the Commercial Terms Schedule. Upon termination, the Client's access to the Services will be discontinued.</p>
      </div>
      
      <div class="terms-item">
        <h4>7. Governing Law</h4>
        <p class="terms-content">This Agreement shall be governed by and construed in accordance with the laws of Malaysia. Any disputes shall be subject to the exclusive jurisdiction of the Malaysian courts.</p>
      </div>
      
      <div class="terms-item">
        <h4>8. Intellectual Property</h4>
        <p class="terms-content">All intellectual property rights in the Services remain with the Company. The Client may not copy, modify, or distribute any part of the Services without prior written consent.</p>
      </div>
      
      <div class="terms-item">
        <h4>9. Data Protection</h4>
        <p class="terms-content">The Company will handle Client Data in accordance with applicable data protection laws and the Company's Privacy Policy. The Client consents to the collection, use, and processing of their data as described in the Privacy Policy.</p>
      </div>
      
      <div class="terms-item">
        <h4>10. Force Majeure</h4>
        <p class="terms-content">The Company shall not be liable for any failure or delay in performance due to circumstances beyond its reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, or government actions.</p>
      </div>
    </div>
    
    <h2 class="page-break">Commercial Terms & Conditions</h2>
    <div class="terms-section">
      <div class="terms-item">
        <h4>Commercial Agreement Terms</h4>
        <p class="terms-content">By proceeding, the Client acknowledges and agrees to the commercial terms specified herein, including but not limited to the agreed-upon fees, credit limits, and payment schedules. These terms form a legally binding part of the service agreement between the Client and HT Voucher Trading Sdn Bhd.</p>
      </div>
      
      <div class="terms-item">
        <h4>Transaction Fees</h4>
        <p class="terms-content">The specified percentage will be applied to the total value of each transaction processed through the platform. This fee structure is designed to cover operational costs and platform maintenance. Transaction fees are calculated on a per-transaction basis and are non-refundable.</p>
      </div>
      
      <div class="terms-item">
        <h4>Credit Terms</h4>
        <p class="terms-content">Invoices are due within the number of days specified from the invoice date. Late payments will incur interest as per the agreed rate. The Company reserves the right to suspend services for overdue accounts. Credit terms may be subject to review and adjustment based on payment history.</p>
      </div>
      
      <div class="terms-item">
        <h4>Service Fees</h4>
        <p class="terms-content">Additional fees for services like White Labeling or Custom Feature Requests are applicable only upon request and will be billed separately as incurred. These services require separate agreements and pricing structures. All custom development work is subject to additional terms and conditions.</p>
      </div>
      
      <div class="terms-item">
        <h4>Confidentiality</h4>
        <p class="terms-content">All commercial terms, including pricing and fee structures, are confidential and shall not be disclosed to any third party without prior written consent from both parties. This confidentiality extends to all business discussions and negotiations. Breach of confidentiality may result in immediate termination of the agreement.</p>
      </div>
      
      <div class="terms-item">
        <h4>Payment Processing</h4>
        <p class="terms-content">All payments must be processed through the designated payment channels. The Company reserves the right to implement additional security measures for payment processing as deemed necessary. Payment methods may be restricted based on risk assessment and compliance requirements.</p>
      </div>
      
      <div class="terms-item">
        <h4>Dispute Resolution</h4>
        <p class="terms-content">Any disputes arising from commercial terms shall be resolved through good faith negotiations. If negotiations fail, disputes shall be subject to binding arbitration in accordance with Malaysian law. The arbitration process shall be conducted in English and the decision shall be final and binding.</p>
      </div>
      
      <div class="terms-item">
        <h4>Service Level Agreements</h4>
        <p class="terms-content">The Company will provide services in accordance with the agreed service level agreements. Service availability targets and performance metrics are outlined in the technical specifications. The Client acknowledges that service interruptions may occur due to maintenance, upgrades, or unforeseen circumstances.</p>
      </div>
      
      <div class="terms-item">
        <h4>Compliance and Regulatory</h4>
        <p class="terms-content">Both parties agree to comply with all applicable laws and regulations. The Client is responsible for ensuring their use of the services complies with local and international regulations. The Company reserves the right to modify services to ensure regulatory compliance.</p>
      </div>
      
      <div class="terms-item">
        <h4>Termination and Suspension</h4>
        <p class="terms-content">Either party may terminate this agreement with written notice as specified in the terms. The Company reserves the right to suspend or terminate services immediately in case of breach of terms, non-payment, or regulatory requirements. Upon termination, all outstanding fees become immediately due.</p>
      </div>
    </div>
    
    <h2 class="page-break">Approvers</h2>
    <div class=\"approvers-grid\">
      <div class=\"approver-section\">
        <h4>First Approver</h4>
        <div><b>Name:</b> ${esc(((primary?.first_name) || '') + ' ' + ((primary?.last_name) || ''))}</div>
        <div><b>Company Role:</b> ${esc(primary?.company_role || '')}</div>
        <div><b>Email:</b> ${esc(primary?.email || '')}</div>
        <div><b>Contact:</b> ${esc((primary?.contact_prefix || '+60') + ' ' + (primary?.contact_number || ''))}</div>
      </div>
      <div class=\"approver-section\">
        <h4>Second Approver</h4>
        <div><b>Name:</b> ${esc(((second?.first_name) || '') + ' ' + ((second?.last_name) || ''))}</div>
        <div><b>Company Role:</b> ${esc(second?.company_role || '')}</div>
        <div><b>Email:</b> ${esc(second?.email || '')}</div>
        <div><b>Contact:</b> ${esc((second?.contact_prefix || '+60') + ' ' + (second?.contact_number || ''))}</div>
      </div>
    </div>
    
    <h2 class="page-break">Appendix: Process Timeline</h2>
    <div>
      ${timeline.map(l => `
        <div class=\"timeline-item\">
          <div class=\"flex\"><div><b>${esc(l.action)}</b></div><div class=\"muted\">${esc(l.timestamp)}</div></div>
          <div>${esc(l.details).replace(/\n/g, '<br/>')}</div>
        </div>
      `).join('')}
    </div>
  </body></html>`;
}
//# sourceMappingURL=pdf.template.js.map