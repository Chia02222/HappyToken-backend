const esc = (s) => String(s ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function buildTimeline(corp) {
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
export function buildAgreementHtml(corp) {
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
        <h4>3. Use of the Platform</h4>
        <p class="terms-content">The Client shall use the Services solely for its internal business purposes and shall not:</p>
        <ul>
          <li>Copy, resell, or license the platform or its features;</li>
          <li>Interfere with the performance or security of the system;</li>
          <li>Use the Services to conduct unlawful or unethical activities.</li>
        </ul>
      </div>
      
      <div class="terms-item">
        <h4>4. Fees and Payment</h4>
        <p class="terms-content">Fees, charges, credit terms, and payout details are specified in the Commercial Terms Schedule or Order Form. All invoices must be settled within the agreed credit term. The Company reserves the right to:</p>
        <ul>
          <li>Charge interest on late payments;</li>
          <li>Suspend or limit Services for overdue accounts;</li>
          <li>Withhold settlement payouts in case of breach.</li>
        </ul>
      </div>
      
      <div class="terms-item">
        <h4>5. Intellectual Property</h4>
        <p class="terms-content">All intellectual property rights in the Services, software, designs, and documentation shall remain the sole property of the Company. The Client is granted a limited, non-exclusive, non-transferable license to use the Services in accordance with this Agreement.</p>
      </div>
      
      <div class="terms-item">
        <h4>6. Client Data & Confidentiality</h4>
        <p class="terms-content">The Client retains ownership of its data. The Company will not disclose or use Client Data except as required to provide the Services or by law. Both parties agree to maintain the confidentiality of all non-public information exchanged during the course of this Agreement for a period of twelve (12) months after termination.</p>
      </div>
      
      <div class="terms-item">
        <h4>7. Data Protection</h4>
        <p class="terms-content">The Company shall take reasonable steps to comply with Malaysia's Personal Data Protection Act 2010 (PDPA) in handling personal data collected during the provision of Services.</p>
      </div>
      
      <div class="terms-item">
        <h4>8. Warranties and Disclaimers</h4>
        <p class="terms-content">The Company provides the Services "as is" and disclaims all warranties not expressly stated herein. The Company does not guarantee uninterrupted or error-free operation.</p>
      </div>
    </div>
    
    <h2 class="page-break">Commercial Terms & Conditions</h2>
    <div class="terms-section">
      <div class="terms-item">
        <h4>Commercial Agreement Confirmation</h4>
        <p class="terms-content">This confirms that <strong>${esc(corp.company_name || '[Client Company Name]')}</strong> (Company No: <strong>${esc(corp.reg_number || '[XXXXXXXX-X]')}</strong>), represented by <strong>${esc(((second?.first_name) || '') + ' ' + ((second?.last_name) || '[Full Name of Signatory]'))}</strong>, has successfully entered into a commercial agreement with:</p>
        <p class="terms-content"><strong>HT Voucher Trading Sdn Bhd (Company No: [Insert])</strong><br/>
        <strong>Trading As: HappieToken</strong><br/>
        <strong>Last Updated: [Insert Date]</strong></p>
        <p class="terms-content">These Standard Terms and Conditions ("Terms") govern the relationship between HT Voucher Trading Sdn Bhd (Company No. [Insert], trading as HappieToken, hereinafter referred to as the "Company") and any party ("Client") who enters into a commercial arrangement with the Company for the use of its products or services, whether by signing an order form, accepting a quotation, or registering via an online form. These Terms are legally binding and apply to all Clients unless otherwise agreed in writing.</p>
      </div>
      
      <div class="terms-item">
        <h4>1. Definitions</h4>
        <p class="terms-content">"Agreement" means the binding contract between the Company and the Client, consisting of these Terms and any applicable Order Form or Commercial Terms Schedule.</p>
        <p class="terms-content">"Services" means the platform access, features, tools, APIs, or solutions provided by the Company.</p>
        <p class="terms-content">"Client Data" means any information, material, or content uploaded, submitted, or shared by the Client through the Services.</p>
        <p class="terms-content">"Effective Date" means the date on which the Client first accepts or is deemed to accept these Terms.</p>
      </div>
      
      <div class="terms-item">
        <h4>2. Provision of Services</h4>
        <p class="terms-content">The Company shall provide the Services described in the relevant Commercial Terms Schedule or online order form. The Company reserves the right to improve, modify, or discontinue any part of the Services with reasonable notice.</p>
      </div>
      
      <div class="terms-item">
        <h4>3. Use of the Platform</h4>
        <p class="terms-content">The Client shall use the Services solely for its internal business purposes and shall not:</p>
        <ul>
          <li>Copy, resell, or license the platform or its features;</li>
          <li>Interfere with the performance or security of the system;</li>
          <li>Use the Services to conduct unlawful or unethical activities.</li>
        </ul>
      </div>
      
      <div class="terms-item">
        <h4>4. Fees and Payment</h4>
        <p class="terms-content">Fees, charges, credit terms, and payout details are specified in the Commercial Terms Schedule or Order Form. All invoices must be settled within the agreed credit term. The Company reserves the right to:</p>
        <ul>
          <li>Charge interest on late payments;</li>
          <li>Suspend or limit Services for overdue accounts;</li>
          <li>Withhold settlement payouts in case of breach.</li>
        </ul>
      </div>
      
      <div class="terms-item">
        <h4>5. Intellectual Property</h4>
        <p class="terms-content">All intellectual property rights in the Services, software, designs, and documentation shall remain the sole property of the Company. The Client is granted a limited, non-exclusive, non-transferable license to use the Services in accordance with this Agreement.</p>
      </div>
      
      <div class="terms-item">
        <h4>6. Client Data & Confidentiality</h4>
        <p class="terms-content">The Client retains ownership of its data. The Company will not disclose or use Client Data except as required to provide the Services or by law. Both parties agree to maintain the confidentiality of all non-public information exchanged during the course of this Agreement for a period of twelve (12) months after termination.</p>
      </div>
      
      <div class="terms-item">
        <h4>7. Data Protection</h4>
        <p class="terms-content">The Company shall take reasonable steps to comply with Malaysia's Personal Data Protection Act 2010 (PDPA) in handling personal data collected during the provision of Services.</p>
      </div>
      
      <div class="terms-item">
        <h4>8. Warranties and Disclaimers</h4>
        <p class="terms-content">The Company provides the Services "as is" and disclaims all warranties not expressly stated herein. The Company does not guarantee uninterrupted or error-free operation.</p>
      </div>
      
      <div class="terms-item">
        <h4>9. Limitation of Liability</h4>
        <p class="terms-content">The Company's total liability under this Agreement shall not exceed the amount paid by the Client for Services in the preceding six (6) months. The Company shall not be liable for indirect, incidental, or consequential losses.</p>
      </div>
      
      <div class="terms-item">
        <h4>10. Indemnity</h4>
        <p class="terms-content">The Client agrees to indemnify and hold harmless the Company from any third-party claims, damages, or liabilities arising from the Client's breach of this Agreement or misuse of the Services.</p>
      </div>
      
      <div class="terms-item">
        <h4>11. Termination</h4>
        <p class="terms-content">Either party may terminate this Agreement by giving thirty (30) days' written notice. The Company may terminate immediately in the event of:</p>
        <ul>
          <li>Breach of terms by the Client;</li>
          <li>Fraud, abuse, or illegal activity;</li>
          <li>Insolvency or cessation of business by either party.</li>
        </ul>
      </div>
      
      <div class="terms-item">
        <h4>12. Force Majeure</h4>
        <p class="terms-content">Neither party shall be held liable for failure to perform obligations due to events beyond its reasonable control, including but not limited to natural disasters, war, government restrictions, or Internet disruptions.</p>
      </div>
      
      <div class="terms-item">
        <h4>13. Governing Law and Jurisdiction</h4>
        <p class="terms-content">This Agreement shall be governed by the laws of Malaysia, and any disputes shall be subject to the exclusive jurisdiction of the courts of Kuala Lumpur.</p>
      </div>
      
      <div class="terms-item">
        <h4>14. Dispute Resolution</h4>
        <p class="terms-content">Parties shall attempt to resolve disputes through good faith negotiations. If unresolved, the dispute shall proceed to mediation and, if necessary, to arbitration administered by the Asian International Arbitration Centre (AIAC) under its applicable rules.</p>
      </div>
      
      <div class="terms-item">
        <h4>15. Notices</h4>
        <p class="terms-content">All notices shall be in writing and sent by email or registered post to the addresses provided by the Parties in the relevant Order Form or registration record.</p>
      </div>
      
      <div class="terms-item">
        <h4>16. Entire Agreement</h4>
        <p class="terms-content">This Agreement, including any referenced schedules or forms, constitutes the entire agreement between the Parties and supersedes all prior agreements, representations, or communications.</p>
      </div>
      
      <div class="terms-item">
        <h4>17. Amendments</h4>
        <p class="terms-content">These Terms may be updated by the Company from time to time. Continued use of the Services after such updates constitutes acceptance of the revised Terms.</p>
      </div>
      
      <div class="terms-item">
        <h4>18. Severability</h4>
        <p class="terms-content">If any provision of this Agreement is held to be invalid or unenforceable, the remainder shall remain in full force and effect.</p>
      </div>
      
      <div class="terms-item">
        <h4>19. Waiver</h4>
        <p class="terms-content">No failure or delay by either Party in exercising any right shall constitute a waiver of that right.</p>
      </div>
      
      <div class="terms-item">
        <h4>Agreement Acceptance</h4>
        <p class="terms-content">By proceeding to use the Company's Services or confirming your agreement via an online form or signed order, you acknowledge and accept these Standard Terms and Conditions.</p>
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