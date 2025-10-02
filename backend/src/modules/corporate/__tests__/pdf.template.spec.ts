import { buildAgreementHtml, buildTimeline } from '../pdf.template';

describe('pdf.template', () => {
  const baseCorp: any = {
    company_name: 'Acme Sdn Bhd',
    reg_number: '1234567-A',
    office_address1: '1 Jalan Test',
    city: 'Kuala Lumpur',
    state: 'WP Kuala Lumpur',
    postcode: '50000',
    country: 'Malaysia',
    agreement_from: '2025-01-01',
    agreement_to: '2025-12-31',
    transaction_fee: '2.5',
    late_payment_interest: '1.5',
    contacts: [
      { first_name: 'John', last_name: 'Doe', company_role: 'CEO', email: 'john@example.com' },
    ],
    investigation_log: [],
  };

  it('buildAgreementHtml should include company name and sections', () => {
    const html = buildAgreementHtml(baseCorp);
    expect(html).toContain('Acme Sdn Bhd');
    expect(html).toContain('Corporate Summary');
    expect(html).toContain('Commercial Terms');
    expect(html).toContain('Approvers');
    expect(html).toContain('Appendix: Process Timeline');
  });

  it('buildTimeline consolidates rejection and formats amendment requested', () => {
    const corp = {
      ...baseCorp,
      investigation_log: [
        { timestamp: '2025-09-30T02:00:00Z', from_status: 'Pending 1st Approval', to_status: 'Amendment Requested', note: 'Amendment Request Submitted|Requested Changes: x|Reason: y|Submitted by: John Doe (CEO)' },
        { timestamp: '2025-09-30T03:00:00Z', from_status: 'Amendment Requested', to_status: 'Pending 1st Approval', note: 'Amendment approved by CRT; reverting' },
        { timestamp: '2025-09-30T04:00:00Z', from_status: 'Amendment Requested', to_status: 'Rejected', note: 'Amendment rejected by CRT: invalid' },
      ],
    };
    const timeline = buildTimeline(corp);
    // Should include at least one Amendment Requested and a consolidated Amendment Rejected
    expect(timeline.find(t => t.action === 'Amendment Requested')).toBeTruthy();
    expect(timeline.find(t => t.action === 'Amendment Rejected')).toBeTruthy();
  });
});







