'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCorporateById, getAmendmentRequestsByCorporate } from '@/services/api';
import type { CorporateDetails, Contact } from '@/types';

interface LogEntry {
  timestamp: string;
  action: string;
  details: string;
}

const PrintCorporateAgreementPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const corporateId = params.id as string;

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<CorporateDetails | null>(null);
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [amendmentOriginal, setAmendmentOriginal] = React.useState<any | null>(null);
  const [amendmentAmended, setAmendmentAmended] = React.useState<any | null>(null);

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kuala_Lumpur'
    });
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const corp = await getCorporateById(String(corporateId));
        setData(corp as any);

        // Build simplified timeline similar to ECommercialTermsForm
        const out: LogEntry[] = [];
        const now = new Date();
        out.push({
          timestamp: corp?.created_at ? formatDateTime(new Date(corp.created_at as string)) : formatDateTime(now),
          action: 'Agreement Created',
          details: 'Initial draft prepared and submitted for review\nSubmitted by: CRT Team',
        });

        const inv = (corp as any)?.investigation_log || [];
        const sorted = Array.isArray(inv)
          ? [...inv].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          : [];

        const primary = (corp?.contacts || [])[0] as Contact | undefined;
        const primaryName = primary ? `${primary.first_name || ''} ${primary.last_name || ''}`.trim() : '';
        const primaryRole = primary?.company_role || 'First Approver';

        const getSubmitterLine = (note?: string) => {
          if (!note) return '';
          const m = note.match(/Submitted by:\s*([^\n<,]+)/i);
          if (m) return `Submitted by: ${m[1].trim()}`;
          return primaryName ? `Submitted by: ${primaryName} (${primaryRole})` : '';
        };

        sorted.forEach((log: any) => {
          if (log.to_status === 'Amendment Requested' || /amendment/i.test(log.note || '')) {
            const changed = `Status changed from ${log.from_status || ''} to ${log.to_status || 'Amendment Requested'}`;
            const submitter = getSubmitterLine(log.note || '');
            out.push({
              timestamp: formatDateTime(new Date(log.timestamp)),
              action: 'Amendment Requested',
              details: [changed, submitter].filter(Boolean).join('\n'),
            });
          } else if (log.to_status === 'Rejected' || /reject/i.test(log.note || '')) {
            // Consolidated rejection
            const reason = (() => {
              const m = (log.note || '').match(/Review\s*Notes:\s*([^|\n]+)/i) || (log.note || '').match(/rejected\s+by\s+[^:]+:\s*([^\n]+)/i);
              return m ? m[1].trim() : 'Amendment rejected.';
            })();
            const reviewer = (() => {
              const m = (log.note || '').match(/Reviewed\s*by:\s*([^|\n]+)/i) || (log.note || '').match(/rejected\s+by\s+([^:]+):/i);
              return (m ? m[1].trim() : 'CRT Team');
            })();
            const submitter = getSubmitterLine(log.note || '');
            out.push({
              timestamp: formatDateTime(new Date(log.timestamp)),
              action: 'Amendment Rejected',
              details: [`Reason:  ${reason}`, `Rejected by: ${reviewer}`, submitter].filter(Boolean).join('\n'),
            });
          } else if (
            (log.note && /amendment\s+approved\s+by\s+crt/i.test(log.note)) ||
            (log.from_status === 'Amendment Requested' && (log.to_status === 'Pending 1st Approval' || log.to_status === 'Pending 2nd Approval'))
          ) {
            const target = log.to_status;
            out.push({
              timestamp: formatDateTime(new Date(log.timestamp)),
              action: 'Amendment Approved',
              details: [`Reverted to: ${target}`, `Notified: ${target === 'Pending 2nd Approval' ? 'Second Approver' : 'First Approver'}`].join('\n'),
            });
          }
        });

        setLogs(out);

        // Amendment comparison (if any pending or latest with data)
        try {
          const list = await getAmendmentRequestsByCorporate(String(corporateId));
          const arr = Array.isArray(list) ? list : [];
          const withData = arr.filter((x: any) => {
            const data = (x && (x.amendment_data || x.amendmentData || x.amended_data || null));
            return data && typeof data === 'object' && Object.keys(data).length > 0;
          });
          if (withData.length) {
            const preferred = withData.find((x: any) => x.to_status === 'Amendment Requested');
            const latest = preferred || [...withData].sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];
            const amendData = latest?.amendment_data || latest?.amendmentData || latest?.amended_data || null;
            // Build pair like other pages
            const original = corp || {};
            const delta = (amendData?.changed_fields && Object.keys(amendData.changed_fields || {}).length > 0)
              ? amendData.changed_fields
              : (amendData?.amendedData && typeof amendData.amendedData === 'object')
                ? amendData.amendedData
                : (amendData?.amended_data && typeof amendData.amended_data === 'object')
                  ? amendData.amended_data
                  : null;
            const legacyOriginal = amendData?.original_data || null;
            const legacyAmended = amendData?.amended_data || null;
            const hasLegacy = legacyOriginal && typeof legacyOriginal === 'object' && Object.keys(legacyOriginal).length > 0;
            const deepMerge = (base: any, patch: any): any => {
              if (Array.isArray(base) && Array.isArray(patch)) return patch;
              if (base && typeof base === 'object' && patch && typeof patch === 'object') {
                const out: any = Array.isArray(base) ? [...base] : { ...base };
                Object.entries(patch).forEach(([key, value]) => {
                  if (value && typeof value === 'object' && !Array.isArray(value)) {
                    (out as any)[key] = deepMerge((base as any)[key], value);
                  } else {
                    (out as any)[key] = value as any;
                  }
                });
                return out;
              }
              return patch ?? base;
            };
            if (hasLegacy) {
              setAmendmentOriginal(legacyOriginal);
              setAmendmentAmended(legacyAmended || legacyOriginal);
            } else if (delta && typeof delta === 'object') {
              setAmendmentOriginal(original);
              setAmendmentAmended(deepMerge(original, delta));
            }
          }
        } catch {}
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load corporate');
      } finally {
        setLoading(false);
      }
    };
    if (corporateId) fetchData();
  }, [corporateId]);

  React.useEffect(() => {
    if (!data) return;
    const originalTitle = document.title;
    const safeName = (data.company_name || 'Corporate').replace(/[\/\\:*?"<>|]/g, '-');
    document.title = `${safeName} - Happy Token`;
    const t = setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 300);
    return () => clearTimeout(t);
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">Generating PDF…</div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-red-700">{error || 'Not found'}</div>
    );
  }

  return (
    <div id="print-root" className="p-6">
      <h1 className="text-center text-xl font-bold mb-2">e-Commercial Agreement</h1>
      <div className="text-center text-xs text-gray-600 mb-4">HT Voucher Trading Sdn Bhd (Company No: 202401035271 (1581118A)) — HappieToken</div>

      <h2 className="text-sm font-semibold mt-4 mb-2">Corporate Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div><span className="font-medium">Company Name:</span> {data.company_name}</div>
        <div><span className="font-medium">Registration No.:</span> {data.reg_number}</div>
        <div className="md:col-span-2"><span className="font-medium">Office Address:</span> {`${data.office_address1 || ''}${data.office_address2 ? `, ${data.office_address2}` : ''}`}</div>
        <div><span className="font-medium">City:</span> {data.city}</div>
        <div><span className="font-medium">State:</span> {data.state}</div>
        <div><span className="font-medium">Postcode:</span> {data.postcode}</div>
        <div><span className="font-medium">Country:</span> {data.country}</div>
        <div><span className="font-medium">Website:</span> {data.website}</div>
        <div className="md:col-span-2"><span className="font-medium">Account Note:</span> {data.account_note}</div>
      </div>

      <h2 className="text-sm font-semibold mt-4 mb-2">Commercial Terms</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div><span className="font-medium">Agreement From:</span> {data.agreement_from}</div>
        <div><span className="font-medium">Agreement To:</span> {data.agreement_to}</div>
        <div><span className="font-medium">Credit Limit:</span> {data.credit_limit}</div>
        <div><span className="font-medium">Credit Terms:</span> {data.credit_terms}</div>
        <div><span className="font-medium">Transaction Fee:</span> {data.transaction_fee}%</div>
        <div><span className="font-medium">Late Payment Interest:</span> {data.late_payment_interest}%</div>
        <div><span className="font-medium">White Labeling Fee:</span> {data.white_labeling_fee || 'N/A'}</div>
        <div><span className="font-medium">Custom Feature Fee:</span> {data.custom_feature_fee}</div>
      </div>

      <h2 className="text-sm font-semibold mt-4 mb-2">Generic Terms & Conditions</h2>
      <div className="text-sm whitespace-pre-line">
        These Standard Terms and Conditions ("Terms") govern the relationship between HT Voucher Trading Sdn Bhd (trading as HappieToken) and the Client. These Terms apply to all Clients unless otherwise agreed in writing.
        \nProvision of Services: The Company shall provide the Services described in the relevant Commercial Terms or online order form.
        \nClient Obligations: The Client agrees to use the Services in accordance with these Terms and applicable laws.
        \nPayment Terms: Payment terms are as specified in the Commercial Terms. The Client agrees to pay all fees as scheduled.
        \nLimitation of Liability: The Company’s liability is limited as permitted by law. No indirect or consequential damages.
        \nTermination: Either party may terminate with written notice as specified in the Commercial Terms.
        \nGoverning Law: These Terms are governed by the laws of Malaysia.
      </div>

      <h2 className="text-sm font-semibold mt-4 mb-2">Commercial Terms & Conditions</h2>
      <div className="text-sm whitespace-pre-line">
        Transaction Fees: Percentage applied per transaction and non-refundable. Credit Terms: Invoices due per agreed days; late interest applies. Additional service fees apply only upon request.
        \nConfidentiality: All commercial terms are confidential. Payment Processing: Payments must use designated channels.
        \nDispute Resolution: Disputes resolved via arbitration under Malaysian law. SLAs: Service availability and performance per specifications.
      </div>

      <h2 className="text-sm font-semibold mt-4 mb-2">Approvers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div>
          <div className="font-medium mb-1">First Approver</div>
          <div><span className="font-medium">Name:</span> {(data.contacts?.[0]?.first_name || '') + ' ' + (data.contacts?.[0]?.last_name || '')}</div>
          <div><span className="font-medium">Company Role:</span> {data.contacts?.[0]?.company_role || ''}</div>
          <div><span className="font-medium">Email:</span> {data.contacts?.[0]?.email || ''}</div>
          <div><span className="font-medium">Contact:</span> {(data.contacts?.[0]?.contact_prefix || '+60') + ' ' + (data.contacts?.[0]?.contact_number || '')}</div>
        </div>
        <div>
          <div className="font-medium mb-1">Second Approver</div>
          <div><span className="font-medium">Name:</span> {(((data as any).secondary_approver || {}) as any).first_name || ''} {(((data as any).secondary_approver || {}) as any).last_name || ''}</div>
          <div><span className="font-medium">Company Role:</span> {(((data as any).secondary_approver || {}) as any).company_role || ''}</div>
          <div><span className="font-medium">Email:</span> {(((data as any).secondary_approver || {}) as any).email || ''}</div>
          <div><span className="font-medium">Contact:</span> {((((data as any).secondary_approver || {}) as any).contact_prefix || '+60') + ' ' + ((((data as any).secondary_approver || {}) as any).contact_number || '')}</div>
        </div>
      </div>

      {amendmentOriginal && amendmentAmended && (
        <>
          <h2 className="text-sm font-semibold mt-6 mb-2">Amendment Comparison</h2>
          <div className="text-xs text-gray-600 mb-2">Left: Original • Right: Changes</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="font-medium mb-1">Original</div>
              <div className="space-y-1">
                <div><span className="font-medium">Company Name:</span> {amendmentOriginal?.company_name}</div>
                <div><span className="font-medium">Reg No:</span> {amendmentOriginal?.reg_number}</div>
                <div><span className="font-medium">Website:</span> {amendmentOriginal?.website}</div>
                <div><span className="font-medium">Address 1:</span> {amendmentOriginal?.office_address1}</div>
                <div><span className="font-medium">Address 2:</span> {amendmentOriginal?.office_address2}</div>
                <div><span className="font-medium">Postcode:</span> {amendmentOriginal?.postcode}</div>
                <div><span className="font-medium">City:</span> {amendmentOriginal?.city}</div>
                <div><span className="font-medium">State:</span> {amendmentOriginal?.state}</div>
                <div><span className="font-medium">Country:</span> {amendmentOriginal?.country}</div>
                <div><span className="font-medium">Credit Limit:</span> {amendmentOriginal?.credit_limit}</div>
                <div><span className="font-medium">Credit Terms:</span> {amendmentOriginal?.credit_terms}</div>
                <div><span className="font-medium">Transaction Fee:</span> {amendmentOriginal?.transaction_fee}</div>
              </div>
            </div>
            <div>
              <div className="font-medium mb-1">Amended</div>
              <div className="space-y-1">
                <div><span className="font-medium">Company Name:</span> {amendmentAmended?.company_name}</div>
                <div><span className="font-medium">Reg No:</span> {amendmentAmended?.reg_number}</div>
                <div><span className="font-medium">Website:</span> {amendmentAmended?.website}</div>
                <div><span className="font-medium">Address 1:</span> {amendmentAmended?.office_address1}</div>
                <div><span className="font-medium">Address 2:</span> {amendmentAmended?.office_address2}</div>
                <div><span className="font-medium">Postcode:</span> {amendmentAmended?.postcode}</div>
                <div><span className="font-medium">City:</span> {amendmentAmended?.city}</div>
                <div><span className="font-medium">State:</span> {amendmentAmended?.state}</div>
                <div><span className="font-medium">Country:</span> {amendmentAmended?.country}</div>
                <div><span className="font-medium">Credit Limit:</span> {amendmentAmended?.credit_limit}</div>
                <div><span className="font-medium">Credit Terms:</span> {amendmentAmended?.credit_terms}</div>
                <div><span className="font-medium">Transaction Fee:</span> {amendmentAmended?.transaction_fee}</div>
              </div>
            </div>
          </div>
        </>
      )}

      <h2 className="text-sm font-semibold mt-4 mb-2">Appendix: Process Timeline</h2>
      <div className="text-sm">
        {logs.map((l, i) => (
          <div key={i} className="mb-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{l.action}</div>
              <div className="text-xs text-gray-500">{l.timestamp}</div>
            </div>
            <div className="whitespace-pre-line">{l.details}</div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-root, #print-root * { visibility: visible !important; }
          #print-root { display: block !important; position: static !important; inset: auto !important; }
          a { text-decoration: none !important; color: inherit !important; }
          @page { size: A4; margin: 12mm; }
        }
      `}</style>
    </div>
  );
};

export default PrintCorporateAgreementPage;


