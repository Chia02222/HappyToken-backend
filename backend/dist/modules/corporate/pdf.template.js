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
        if (log.to_status === 'Amendment Requested' || /amendment/i.test(note)) {
            const statusChanged = `Status changed from ${esc(log.from_status || '')} to ${esc(log.to_status || 'Amendment Requested')}`;
            const submitted = deriveSubmitter(log.from_status);
            const details = [statusChanged, submitted ? `Amendment Request Submitted by: ${esc(submitted)}` : ''].filter(Boolean).join('\n');
            out.push({ action: 'Amendment Requested', timestamp: ts, details });
        }
        else if (log.to_status === 'Rejected' || /reject/i.test(note)) {
            const reason = (note.match(/Review\s*Notes:\s*([^|\n]+)/i)?.[1] || note.match(/rejected\s+by\s+[^:]+:\s*([^\n]+)/i)?.[1] || 'Amendment rejected.').trim();
            const reviewer = (note.match(/Reviewed\s*by:\s*([^|\n]+)/i)?.[1] || note.match(/rejected\s+by\s+([^:]+):/i)?.[1] || 'CRT Team').trim();
            const submitter = deriveSubmitter(log.from_status);
            latestRejection = { ts, reason, reviewer, submitter };
        }
        else if ((note && /amendment\s+approved\s+by\s+crt/i.test(note)) ||
            (log.from_status === 'Amendment Requested' && (log.to_status === 'Pending 1st Approval' || log.to_status === 'Pending 2nd Approval'))) {
            const target = String(log.to_status || '');
            const notified = target === 'Pending 2nd Approval' ? 'Second Approver' : 'First Approver';
            const submitter = deriveSubmitter(target);
            const details = [`Reverted to: ${esc(target)}`, `Notified: ${esc(notified)}`, submitter ? `Submitted by: ${esc(submitter)}` : ''].filter(Boolean).join('\n');
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
        const details = [`Reason:  ${esc(latestRejection.reason)}`, `Rejected by: ${esc(latestRejection.reviewer)}`, latestRejection.submitter ? `Submitted by: ${esc(latestRejection.submitter)}` : ''].join('\n');
        out.push({ action: 'Amendment Rejected', timestamp: latestRejection.ts, details });
    }
    return out;
}
function buildAgreementHtml(corp) {
    const title = 'e-Commercial Agreement';
    const header = `<h1 style="font-family:Arial,sans-serif;font-size:18px;margin:0 0 8px 0;">${title}</h1>`;
    const sub = `<div style=\"font-family:Arial,sans-serif;font-size:12px;color:#444;margin-bottom:10px;\">HT Voucher Trading Sdn Bhd (Company No: 202401035271 (1581118A)) — HappieToken</div>`;
    const contacts = Array.isArray(corp?.contacts) ? corp.contacts : [];
    const primary = contacts[0];
    const second = corp.secondary_approver;
    const timeline = buildTimeline(corp);
    return `
  <html><head><meta charset=\"utf-8\" /><style>
  body { font-family: Arial, sans-serif; font-size: 12px; color:#111; }
  h2 { font-size: 14px; margin: 16px 0 8px; }
  .grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .muted{ color:#555; }
  .row{ margin-bottom:8px; }
  .timeline-item{ margin-bottom:10px; }
  .flex{ display:flex; justify-content:space-between; }
  </style></head><body>
    ${header}${sub}
    <h2>Corporate Summary</h2>
    <div class=\"grid\">
      <div class=\"row\"><b>Company Name:</b> ${esc(corp.company_name)}</div>
      <div class=\"row\"><b>Registration No.:</b> ${esc(corp.reg_number)}</div>
      <div class=\"row\" style=\"grid-column:1 / span 2\"><b>Office Address:</b> ${esc(corp.office_address1 || '')}${corp.office_address2 ? `, ${esc(corp.office_address2)}` : ''}</div>
      <div class=\"row\"><b>City:</b> ${esc(corp.city || '')}</div>
      <div class=\"row\"><b>State:</b> ${esc(corp.state || '')}</div>
      <div class=\"row\"><b>Postcode:</b> ${esc(corp.postcode || '')}</div>
      <div class=\"row\"><b>Country:</b> ${esc(corp.country || '')}</div>
      <div class=\"row\"><b>Website:</b> ${esc(corp.website || '')}</div>
    </div>
    <h2>Commercial Terms</h2>
    <div class=\"grid\">
      <div class=\"row\"><b>Agreement From:</b> ${esc(corp.agreement_from || '')}</div>
      <div class=\"row\"><b>Agreement To:</b> ${esc(corp.agreement_to || '')}</div>
      <div class=\"row\"><b>Credit Limit:</b> ${esc(corp.credit_limit || '')}</div>
      <div class=\"row\"><b>Credit Terms:</b> ${esc(corp.credit_terms || '')}</div>
      <div class=\"row\"><b>Transaction Fee:</b> ${esc(corp.transaction_fee || '')}%</div>
      <div class=\"row\"><b>Late Payment Interest:</b> ${esc(corp.late_payment_interest || '')}%</div>
    </div>
    <h2>Approvers</h2>
    <div class=\"grid\">
      <div class=\"row\"><b>First Approver:</b> ${esc(((primary?.first_name) || '') + ' ' + ((primary?.last_name) || ''))} ${primary?.company_role ? `(${esc(primary.company_role)})` : ''}</div>
      <div class=\"row\"><b>Second Approver:</b> ${esc(((second?.first_name) || '') + ' ' + ((second?.last_name) || ''))} ${second?.company_role ? `(${esc(second.company_role)})` : ''}</div>
    </div>
    <h2>Appendix: Process Timeline</h2>
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