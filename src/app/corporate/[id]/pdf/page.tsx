'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCorporateById, getAmendmentRequestsByCorporate } from '@/services/api';
import type { CorporateDetails, Contact } from '@/types';
import { logError, logInfo } from '@/utils/logger';
import { errorHandler } from '@/utils/errorHandler';

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
  const [amendmentComparisons, setAmendmentComparisons] = React.useState<Array<{
    id: string;
    timestamp: string;
    status: string;
    original: any;
    amended: any;
    note: string;
    decision: string;
  }>>([]);

  // Helpers for Amendment Comparison
  const cmpVal = (v: any) => (v == null ? '' : String(v).trim());
  const changed = (orig: any, amended: any, key: string) => cmpVal(orig?.[key]) !== cmpVal(amended?.[key]);
  const fields: Array<{ key: string; label: string; format?: (v: any) => string }> = [
    { key: 'company_name', label: 'Company Name' },
    { key: 'reg_number', label: 'Registration No.' },
    { key: 'website', label: 'Website' },
    { key: 'office_address1', label: 'Address 1' },
    { key: 'office_address2', label: 'Address 2' },
    { key: 'postcode', label: 'Postcode' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
    { key: 'agreement_from', label: 'Agreement From', format: (v) => (v ? String(v).split('T')[0] : '') },
    { key: 'agreement_to', label: 'Agreement To', format: (v) => (v ? String(v).split('T')[0] : '') },
    { key: 'credit_limit', label: 'Credit Limit' },
    { key: 'credit_terms', label: 'Credit Terms' },
    { key: 'transaction_fee', label: 'Transaction Fee' },
    { key: 'late_payment_interest', label: 'Late Payment Interest' },
    { key: 'white_labeling_fee', label: 'White Labeling Fee' },
    { key: 'custom_feature_fee', label: 'Custom Feature Fee' },
  ];
  const fmt = (v: any, f?: (v: any) => string) => (f ? f(v) : cmpVal(v)) || '';

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

  // Comprehensive timeline generation function (copied from ECommercialTermsForm)
  const generateTimestampLog = (corp: any): LogEntry[] => {
    const logs: LogEntry[] = [];
    const now = new Date();

    // Process logs based on current status
    if (corp.created_at) {
      // Try to get submitter info from the first investigation log or form data
      let submitterInfo = '';
      if (corp.investigation_log && corp.investigation_log.length > 0) {
        const firstLog = corp.investigation_log[0];
        if (firstLog.note) {
          const submitterMatch = firstLog.note.match(/Submitted by:\s*([^<\n,]+)/i);
          if (submitterMatch) {
            const name = submitterMatch[1].trim();
            const roleMatch = firstLog.note.match(/company_role[:\s]*([^<\n,]+)/i);
            if (roleMatch) {
              const role = roleMatch[1].trim();
              submitterInfo = ` • Submitted by: ${name} (${role})`;
            } else {
              submitterInfo = ` • Submitted by: ${name}`;
            }
          }
        }
      }
      
      // For Agreement Created, always show CRT Team as the actor
      if (!submitterInfo) {
        submitterInfo = 'Submitted by: CRT Team';
      }
      
      logs.push({
        timestamp: formatDateTime(new Date(corp.created_at)),
        action: 'Agreement Created',
        details: 'Initial draft prepared and submitted for review',
      });
    }

    // Process all status changes from investigation log
    if (corp.investigation_log) {
      // Sort investigation logs by timestamp (oldest first, most recent at bottom)
      const sortedLogs = [...corp.investigation_log].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Capture the latest rejection to avoid duplicates and enforce formatting
      let latestRejection: {
        timestamp: Date;
        reason: string;
        reviewer: string;
        submittedByName: string;
        submittedByRole: string;
      } | null = null;

      const contactsList = (corp.contacts || []) as Contact[];
      const buildName = (first?: string, last?: string, email?: string | null) => {
        const name = [first || '', last || ''].join(' ').trim();
        return name || (email || '');
      };

      const deriveSubmitterFromPrevStatus = (prevStatus?: string | null): { name: string; role: string } => {
        if (prevStatus === 'Pending 2nd Approval') {
          const byRole = contactsList.find(c => c.system_role === 'secondary_approver');
          const byId = contactsList.find(c => String(c.id) === String(corp.secondary_approver_id));
          const chosen = byRole || byId;
          if (chosen) return { name: buildName(chosen.first_name, chosen.last_name, chosen.email), role: chosen.company_role || 'Secondary Approver' };
          const sa: any = corp.secondary_approver;
          if (sa) return { name: buildName(sa.first_name, sa.last_name, sa.email), role: sa.company_role || 'Secondary Approver' };
          return { name: '', role: 'Secondary Approver' };
        }
        const primary = contactsList[0];
        if (primary) return { name: buildName(primary.first_name, primary.last_name, primary.email), role: primary.company_role || 'First Approver' };
        return { name: '', role: 'First Approver' };
      };

      sortedLogs.forEach(log => {
        // Extract submitter information from log note
        const getSubmitterInfo = (note: string): string => {
          if (!note) return '';
          
          // Try multiple patterns to find submitter information
          let submitterInfo = '';
          let companyRole = '';
          
          // Pattern 1: "Submitted by: Name (Role)"
          const submitterWithRoleMatch = note.match(/Submitted by:\s*([^(]+)\s*\(([^)]+)\)/i);
          if (submitterWithRoleMatch) {
            submitterInfo = submitterWithRoleMatch[1].trim();
            companyRole = submitterWithRoleMatch[2].trim();
            return `Submitted by: ${submitterInfo} (${companyRole})`;
          }
          
          // Pattern 2: "Submitted by: Name" with separate role extraction
          const submitterMatch = note.match(/Submitted by:\s*([^<\n,]+)/i);
          if (submitterMatch) {
            submitterInfo = submitterMatch[1].trim();
            
            // Try to find company role in the same note
            const rolePatterns = [
              /company_role[:\s]*([^<\n,]+)/i,
              /role[:\s]*([^<\n,]+)/i,
              /position[:\s]*([^<\n,]+)/i,
              /title[:\s]*([^<\n,]+)/i
            ];
            
            for (const pattern of rolePatterns) {
              const roleMatch = note.match(pattern);
              if (roleMatch) {
                companyRole = roleMatch[1].trim();
                break;
              }
            }
            
            if (companyRole) {
              return `Submitted by: ${submitterInfo} (${companyRole})`;
            } else {
              return `Submitted by: ${submitterInfo}`;
            }
          }
          
          // Pattern 3: Look for name and role in separate parts of the note
          const nameMatch = note.match(/(?:Name|Submitted by|User)[:\s]*([^<\n,]+)/i);
          const roleMatch = note.match(/(?:Role|Position|Title|Company Role)[:\s]*([^<\n,]+)/i);
          
          if (nameMatch && roleMatch) {
            submitterInfo = nameMatch[1].trim();
            companyRole = roleMatch[1].trim();
            return `Submitted by: ${submitterInfo} (${companyRole})`;
          }
          
          // If no submitter info found in the note, try to use primary contact as fallback
          const primaryContact = contactsList[0];
          if (!submitterInfo && primaryContact?.first_name && primaryContact?.last_name) {
            const fullName = `${primaryContact.first_name} ${primaryContact.last_name}`.trim();
            const role = primaryContact.company_role || 'Contact';
            return `Submitted by: ${fullName} (${role})`;
          }
          
          return '';
        };

        // Helper to transform "Submitted by:" -> "Approved by:" when used for approval events
        const toApprovedBy = (info: string): string => {
          if (!info) return '';
          return info.replace(/Submitted by:/i, 'Approved by:');
        };

        // Amendment Approved by CRT -> revert to previous status
        if (
          (log.note && /amendment\s+approved\s+by\s+crt\s+team/i.test(log.note)) ||
          (log.from_status === 'Amendment Requested' && (log.to_status === 'Pending 1st Approval' || log.to_status === 'Pending 2nd Approval') && log.note && /approved/i.test(log.note))
        ) {
          const target = log.to_status;
          const notified = target === 'Pending 2nd Approval' ? 'Second Approver' : 'First Approver';
          const details = [
            `Reverted to: ${target}`,
            `Notified: ${notified}`,
            `Submitted by: CRT Team`,
          ].filter(Boolean).join('\n');
          logs.push({
            timestamp: formatDateTime(new Date(log.timestamp)),
            action: 'Amendment Approved',
            details,
          });
        } else if (log.to_status === 'Rejected' || (log.note && log.note.toLowerCase().includes('reject'))) {
          // Parse reason and reviewer from various note formats
          const note = log.note || '';
          let reason = '';
          let reviewer = '';
          const isPreferred = /rejected\s+by/i.test(note);
          
          // Pattern: "Amendment Rejected|Reviewed by: CRT Team|Review Notes: nononono"
          const reviewNotesMatch = note.match(/Review\s*Notes:\s*([^|\n]+)/i);
          if (reviewNotesMatch) {
            reason = reviewNotesMatch[1].trim();
          }
          const reviewedByMatch = note.match(/Reviewed\s*by:\s*([^|\n]+)/i);
          if (reviewedByMatch) {
            reviewer = reviewedByMatch[1].trim();
          }
          
          // Pattern: "Amendment declined by CRT Team (Reason: XXXX)"
          if (!reason) {
            const crtTeamMatch = note.match(/amendment\s+declined\s+by\s+crt\s+team\s*\(reason:\s*([^)]+)\)/i);
            if (crtTeamMatch) reason = crtTeamMatch[1].trim();
          }
          
          // Pattern: "Amendment rejected by CRT: nononono" (legacy format)
          if (!reason) {
            const crtMatch = note.match(/rejected\s+by\s+[^:]+:\s*([^\n]+)/i);
            if (crtMatch) reason = crtMatch[1].trim();
          }
          
          // Pattern: General rejection note (for corporate rejection)
          if (!reason && note.trim()) {
            reason = note.trim();
          }
          
          if (!reviewer) {
            const reviewerGeneric = note.match(/rejected\s+by\s+([^:]+):/i);
            if (reviewerGeneric) reviewer = reviewerGeneric[1].trim();
          }
          if (!reviewer) reviewer = 'CRT Team';
          if (!reason) reason = 'Corporate rejected.';

          const submitter = deriveSubmitterFromPrevStatus(log.from_status);
          // Prefer entries that explicitly contain "rejected by" in the note
          if (!latestRejection || isPreferred) {
            latestRejection = {
              timestamp: new Date(log.timestamp),
              reason,
              reviewer,
              submittedByName: submitter.name,
              submittedByRole: submitter.role,
            };
          }
        } else if (log.to_status === 'Pending 1st Approval') {
          const base = (log.note || 'Registration link sent to 1st approver');
          const submitterInfo = getSubmitterInfo(log.note || '');
          const details = base + (submitterInfo ? '\n' + submitterInfo : '');
          logs.push({
            timestamp: formatDateTime(new Date(log.timestamp)),
            action: 'Registration Link Sent',
            details,
          });
        } else if (log.to_status === 'Pending 2nd Approval' && log.note && log.note.toLowerCase().includes('registration link sent to 2nd approver')) {
          const base = (log.note || 'Registration link sent to 2nd approver');
          const submitterInfo = getSubmitterInfo(log.note || '');
          const details = base + (submitterInfo ? '\n' + submitterInfo : '');
          logs.push({
            timestamp: formatDateTime(new Date(log.timestamp)),
            action: 'Registration Link Sent',
            details,
          });
        } else if (log.to_status === 'Pending 2nd Approval' || (log.note && log.note.toLowerCase().includes('first approval'))) {
          // Only show Submitted by for First Approval Granted
          const base = (log.note || 'First approval completed');
          // Check if the log note already contains submitter information to avoid duplication
          const alreadyHasSubmitterInfo = /Submitted by:/i.test(base);
          const submitterInfo = alreadyHasSubmitterInfo ? '' : getSubmitterInfo(log.note || '');
          const details = base + (submitterInfo ? '\n' + submitterInfo : '');
          logs.push({
            timestamp: formatDateTime(new Date(log.timestamp)),
            action: 'First Approval Granted',
            details,
          });
        } else if (log.to_status === 'Cooling Period' || (log.note && log.note.toLowerCase().includes('second approval'))) {
          // For Second Approval Granted, show Submitted by (not Approved by)
          const base = (log.note || 'Second approval completed');
          // Check if the log note already contains submitter information to avoid duplication
          const alreadyHasSubmitterInfo = /Submitted by:/i.test(base);
          const submitterInfo = alreadyHasSubmitterInfo ? '' : getSubmitterInfo(log.note || '');
          const details = base + (submitterInfo ? '\n' + submitterInfo : '');
          logs.push({
            timestamp: formatDateTime(new Date(log.timestamp)),
            action: 'Second Approval Granted',
            details,
          });
        } else if (log.to_status === 'Amendment Requested') {
          // Enforce standard format for amendment entries
          const prevStatus = log.from_status;
          const contactsList = (corp.contacts || []) as Contact[];
          const buildName = (first?: string, last?: string, email?: string | null) => {
            const name = [first || '', last || ''].join(' ').trim();
            return name || (email || '')
          };
          let name = '';
          let role = '';
          if (prevStatus === 'Pending 2nd Approval') {
            const byRole = contactsList.find(c => c.system_role === 'secondary_approver');
            const byId = contactsList.find(c => String(c.id) === String(corp.secondary_approver_id));
            const chosen = byRole || byId;
            if (chosen) {
              name = buildName(chosen.first_name, chosen.last_name, chosen.email);
              role = chosen.company_role || 'Secondary Approver';
            } else if (corp.secondary_approver) {
              const sa: any = corp.secondary_approver;
              name = buildName(sa.first_name, sa.last_name, sa.email);
              role = sa.company_role || 'Secondary Approver';
            }
          } else {
            const primary = contactsList[0];
            if (primary) {
              name = buildName(primary.first_name, primary.last_name, primary.email);
              role = primary.company_role || 'First Approver';
            }
          }
          const submittedLine = name ? `submitted by: ${name}${role ? ` (${role})` : ''}` : '';
          const details = submittedLine;

          logs.push({
            timestamp: formatDateTime(new Date(log.timestamp)),
            action: 'Amendment Requested',
            details,
          });
        }
      });

      // Append a single consolidated rejection entry if we captured one
      if (latestRejection) {
        const lr = latestRejection as {
          timestamp: Date;
          reason: string;
          reviewer: string;
          submittedByName: string;
          submittedByRole: string;
        };
        const details = [
          `Reason: ${lr.reason}`,
          `Submitted by: CRT Team`,
        ].join('\n');
        
        // Determine if this is an amendment rejection or general corporate rejection
        const isAmendmentRejection = lr.reason.includes('Amendment') || lr.reason.includes('amendment');
        const actionName = isAmendmentRejection ? 'Amendment Declined' : 'Corporate Rejected';
        
        logs.push({
          timestamp: formatDateTime(lr.timestamp),
          action: actionName,
          details,
        });
      }
    }

    // Add high-level milestones based on current status
    if (corp.status === 'Cooling Period') {
      logs.push({
        timestamp: formatDateTime(new Date(corp.updated_at || now)),
        action: 'Sent for Finalization',
        details: 'Cooling Period initiated.\nSubmitted by: CRT Team',
      });
    }

    if (corp.status === 'Approved') {
      logs.push({
        timestamp: formatDateTime(new Date(corp.updated_at || now)),
        action: 'Account Created',
        details: 'Account created successfully.\nConfirmation email sent with attached full-form PDF.\nSubmitted by: CRT Team',
      });
    }

    // Sort all logs by timestamp (oldest first, most recent at bottom)
    const sortedLogs = logs.sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    return sortedLogs;
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const corp = await getCorporateById(String(corporateId));
        setData(corp as any);

        // Use comprehensive timeline generation
        const timelineLogs = generateTimestampLog(corp);
        setLogs(timelineLogs);

        // Get all amendment comparisons with timestamps
        try {
          const list = await getAmendmentRequestsByCorporate(String(corporateId));
          const arr = Array.isArray(list) ? list : [];
          const withData = arr.filter((x: any) => {
            const data = (x && (x.amendment_data || x.amendmentData || x.amended_data || null));
            return data && typeof data === 'object' && Object.keys(data).length > 0;
          });
          
          // Get all investigation logs to check for amendment decisions
          const allLogs = corp?.investigation_log || [];
          
          if (withData.length) {
            const comparisons = withData.map((amendment: any) => {
              const amendData = amendment.amendment_data || amendment.amendmentData || amendment.amended_data || null;
              const original = corp || {};
              
              logInfo('Processing amendment', {
                id: amendment.id,
                note: amendment.note,
                to_status: amendment.to_status,
                amendmentData: amendData
              });
              
              // Try to get stored snapshots first
              const legacyOriginal = amendData?.original_data || null;
              const legacyAmended = amendData?.amended_data || null;
              const hasLegacy = legacyOriginal && typeof legacyOriginal === 'object' && Object.keys(legacyOriginal).length > 0;
              
              let finalOriginal = original;
              let finalAmended = original;
              
              if (hasLegacy) {
                finalOriginal = legacyOriginal;
                finalAmended = legacyAmended || legacyOriginal;
              } else {
                // Fallback: reconstruct from current data + changes
                const delta = (amendData?.changed_fields && Object.keys(amendData.changed_fields || {}).length > 0)
                  ? amendData.changed_fields
                  : (amendData?.amendedData && typeof amendData.amendedData === 'object')
                    ? amendData.amendedData
                    : (amendData?.amended_data && typeof amendData.amended_data === 'object')
                      ? amendData.amended_data
                      : null;
                
                if (delta && typeof delta === 'object') {
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
                  finalAmended = deepMerge(original, delta);
                }
              }
              
              // Enhanced status detection - check multiple sources for THIS specific amendment
              let amendmentStatus = 'pending';
              
              // 1. Check amendment data status first
              if (amendData?.status) {
                amendmentStatus = amendData.status;
              }
              
              // 2. Check amendment data decision field
              if (amendData?.decision) {
                amendmentStatus = amendData.decision;
              }
              
              // 3. Check review notes for status keywords
              if (amendData?.review_notes) {
                const reviewNote = amendData.review_notes.toLowerCase();
                if (reviewNote.includes('approved') || reviewNote.includes('approval')) {
                  amendmentStatus = 'approved';
                } else if (reviewNote.includes('declined') || reviewNote.includes('rejected')) {
                  amendmentStatus = 'declined';
                }
              }
              
              // 4. Check note content for status keywords
              if (amendment.note) {
                const note = amendment.note.toLowerCase();
                if (note.includes('approved') || note.includes('approval') || note.includes('approve')) {
                  amendmentStatus = 'approved';
                } else if (note.includes('declined') || note.includes('rejected') || note.includes('decline') || note.includes('reject')) {
                  amendmentStatus = 'declined';
                }
              }
              
              // 5. Check investigation logs for amendment decisions
              if (amendmentStatus === 'pending') {
                // Look for follow-up logs that show the amendment decision
                const amendmentTimestamp = new Date(amendment.timestamp || amendment.created_at).getTime();
                
                // Find logs that occurred after this amendment request but before the next amendment
                const nextAmendmentIndex = withData.findIndex((nextAmendment: any) => {
                  const nextTimestamp = new Date(nextAmendment.timestamp || nextAmendment.created_at).getTime();
                  return nextTimestamp > amendmentTimestamp;
                });
                
                let followUpLogs;
                if (nextAmendmentIndex !== -1) {
                  // There's a next amendment, only check logs between this and next amendment
                  const nextAmendmentTimestamp = new Date(withData[nextAmendmentIndex].timestamp || withData[nextAmendmentIndex].created_at).getTime();
                  followUpLogs = allLogs.filter((log: any) => {
                    const logTime = new Date(log.timestamp || log.created_at).getTime();
                    return logTime > amendmentTimestamp && logTime < nextAmendmentTimestamp;
                  });
                } else {
                  // This is the latest amendment, check all logs after it
                  followUpLogs = allLogs.filter((log: any) => {
                    const logTime = new Date(log.timestamp || log.created_at).getTime();
                    return logTime > amendmentTimestamp;
                  });
                }
                
                // Check for approval/decline keywords in follow-up logs
                for (const log of followUpLogs) {
                  const note = (log.note || '').toLowerCase();
                  if (note.includes('amendment approved') || note.includes('approved by crt')) {
                    amendmentStatus = 'approved';
                    break;
                  } else if (note.includes('amendment declined') || note.includes('declined by crt') || note.includes('amendment rejected')) {
                    amendmentStatus = 'declined';
                    break;
                  }
                }
              }
              
              return {
                id: amendment.id || amendment.uuid || String(amendment.created_at),
                timestamp: amendment.timestamp || amendment.created_at,
                status: amendmentStatus,
                original: finalOriginal,
                amended: finalAmended,
                note: amendment.note || 'Amendment request',
                decision: amendmentStatus === 'approved' ? 'Approved by CRT Team' : 
                         amendmentStatus === 'declined' || amendmentStatus === 'rejected' ? 'Declined by CRT Team' : 
                         'Pending Review'
              };
            });
            
            // Sort by timestamp (latest first)
          const sortedComparisons = comparisons.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            
            setAmendmentComparisons(sortedComparisons);
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
    document.title = `${safeName} — Happie Token`;
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

      {/* Contacts Section */}
      <h2 className="text-sm font-semibold mt-4 mb-2">Contacts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {data.contacts && data.contacts.length > 0 ? (
          // Filter out duplicates and show unique contacts
          data.contacts
            .filter((contact: Contact, index: number, self: Contact[]) => 
              self.findIndex(c => c.id === contact.id) === index
            )
            .map((contact: Contact, index: number) => (
            <div key={contact.id || index} className="border border-gray-200 rounded p-3">
              <div className="font-medium text-gray-900 mb-2">
                {contact.system_role === 'secondary_approver' ? 'Secondary Approver' : 
                 index === 0 ? 'Primary Contact' : `Contact ${index + 1}`}
              </div>
              <div className="space-y-1">
                <div><span className="font-medium">Name:</span> {`${contact.first_name || ''} ${contact.last_name || ''}`.trim()}</div>
                <div><span className="font-medium">Role:</span> {contact.company_role || ''}</div>
                <div><span className="font-medium">Email:</span> {contact.email || ''}</div>
                <div><span className="font-medium">Phone:</span> {`${contact.contact_prefix || '+60'} ${contact.contact_number || ''}`}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 italic">No contacts available.</div>
        )}
      </div>

      {/* Subsidiaries Section */}
      <h2 className="text-sm font-semibold mt-4 mb-2">Subsidiaries</h2>
      <div className="text-sm">
        {data.subsidiaries && data.subsidiaries.length > 0 ? (
          <div className="space-y-3">
            {data.subsidiaries.map((subsidiary: any, index: number) => (
              <div key={subsidiary.id || index} className="border border-gray-200 rounded p-3">
                <div className="font-medium text-gray-900 mb-2">Subsidiary {index + 1}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div><span className="font-medium">Company Name:</span> {subsidiary.company_name || ''}</div>
                  <div><span className="font-medium">Registration No.:</span> {subsidiary.reg_number || ''}</div>
                  <div className="md:col-span-2"><span className="font-medium">Address:</span> {`${subsidiary.address1 || ''}${subsidiary.address2 ? `, ${subsidiary.address2}` : ''}`}</div>
                  <div><span className="font-medium">City:</span> {subsidiary.city || ''}</div>
                  <div><span className="font-medium">State:</span> {subsidiary.state || ''}</div>
                  <div><span className="font-medium">Postcode:</span> {subsidiary.postcode || ''}</div>
                  <div><span className="font-medium">Country:</span> {subsidiary.country || ''}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">No subsidiaries available.</div>
        )}
      </div>

      <h2 className="text-sm font-semibold mt-4 mb-2 page-break-before">Commercial Terms</h2>
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


      

      <h2 className="text-sm font-semibold mt-4 mb-2 page-break-before">Generic Terms & Conditions</h2>
      <div className="text-sm leading-relaxed space-y-4">
        <p className="text-xs text-gray-500 mb-4">Last Updated: [Insert Date]</p>
        <p>
          These Standard Terms and Conditions ("Terms") govern the relationship between HT Voucher Trading Sdn Bhd (Company No. [Insert], trading as HappieToken, hereinafter referred to as the "Company") and any party ("Client") who enters into a commercial arrangement with the Company for the use of its products or services, whether by signing an order form, accepting a quotation, or registering via an online form. These Terms are legally binding and apply to all Clients unless otherwise agreed in writing.
        </p>
          <div>
            <h4 className="font-semibold">1. Definitions</h4>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>"Agreement" means the binding contract between the Company and the Client, consisting of these Terms and any applicable Order Form or Commercial Terms Schedule.</li>
              <li>"Services" means the platform access, features, tools, APIs, or solutions provided by the Company.</li>
              <li>"Client Data" means any information, material, or content uploaded, submitted, or shared by the Client through the Services.</li>
              <li>"Effective Date" means the date on which the Client first accepts or is deemed to accept these Terms.</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold">2. Provision of Services</h4>
            <p className="mt-2">The Company shall provide the Services described in the relevant Commercial Terms Schedule or online order form. The Company reserves the right to improve, modify, or discontinue any part of the Services with reasonable notice.</p>
          </div>
          
          <div>
            <h4 className="font-semibold">3. Client Obligations</h4>
            <p className="mt-2">The Client agrees to use the Services in accordance with these Terms and any applicable laws and regulations. The Client is responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.</p>
          </div>
          
          <div>
            <h4 className="font-semibold">4. Payment Terms</h4>
            <p className="mt-2">Payment terms are as specified in the Commercial Terms Schedule. The Client agrees to pay all fees and charges in accordance with the agreed payment schedule.</p>
          </div>
          
          <div>
            <h4 className="font-semibold">5. Limitation of Liability</h4>
            <p className="mt-2">The Company's liability is limited to the maximum extent permitted by law. The Company shall not be liable for any indirect, incidental, special, or consequential damages.</p>
          </div>
          
          <div>
            <h4 className="font-semibold">6. Termination</h4>
            <p className="mt-2">Either party may terminate this Agreement with written notice as specified in the Commercial Terms Schedule. Upon termination, the Client's access to the Services will be discontinued.</p>
          </div>
          
          <div>
            <h4 className="font-semibold">7. Governing Law</h4>
            <p className="mt-2">This Agreement shall be governed by and construed in accordance with the laws of Malaysia. Any disputes shall be subject to the exclusive jurisdiction of the Malaysian courts.</p>
          </div>
          
          <div>
            <h4 className="font-semibold">8. Intellectual Property</h4>
            <p className="mt-2">All intellectual property rights in the Services remain with the Company. The Client may not copy, modify, or distribute any part of the Services without prior written consent.</p>
          </div>
          
          <div>
            <h4 className="font-semibold">9. Data Protection</h4>
            <p className="mt-2">The Company will handle Client Data in accordance with applicable data protection laws and the Company's Privacy Policy. The Client consents to the collection, use, and processing of their data as described in the Privacy Policy.</p>
          </div>
          
          <div>
            <h4 className="font-semibold">10. Force Majeure</h4>
            <p className="mt-2">The Company shall not be liable for any failure or delay in performance due to circumstances beyond its reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, or government actions.</p>
          </div>
      </div>

      <h2 className="text-sm font-semibold mt-4 mb-2">Commercial Terms & Conditions</h2>
      <div className="text-sm leading-relaxed space-y-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Commercial Agreement Terms</h4>
            <p className="mt-2">By proceeding, the Client acknowledges and agrees to the commercial terms specified herein, including but not limited to the agreed-upon fees, credit limits, and payment schedules. These terms form a legally binding part of the service agreement between the Client and HT Voucher Trading Sdn Bhd.</p>
          </div>
          
          <div>
            <h4 className="font-semibold">Transaction Fees</h4>
            <p className="mt-2">The specified percentage will be applied to the total value of each transaction processed through the platform. This fee structure is designed to cover operational costs and platform maintenance. Transaction fees are calculated on a per-transaction basis and are non-refundable.</p>
          </div>
          
          <div>
            <h4 className="font-semibold">Credit Terms</h4>
            <p className="mt-2">Invoices are due within the number of days specified from the invoice date. Late payments will incur interest as per the agreed rate. The Company reserves the right to suspend services for overdue accounts. Credit terms may be subject to review and adjustment based on payment history.</p>
          </div>
          
          <div>
            <h4 className="font-semibold">Service Fees</h4>
            <p className="mt-2">Additional fees for services like White Labeling or Custom Feature Requests are applicable only upon request and will be billed separately as incurred. These services require separate agreements and pricing structures. All custom development work is subject to additional terms and conditions.</p>
          </div>
          
          <div>
            <h4 className="font-semibold">Confidentiality</h4>
            <p className="mt-2">All commercial terms, including pricing and fee structures, are confidential and shall not be disclosed to any third party without prior written consent from both parties. This confidentiality extends to all business discussions and negotiations. Breach of confidentiality may result in immediate termination of the agreement.</p>
          </div>
          
          <div>
            <h4 className="font-semibold">Payment Processing</h4>
            <p className="mt-2">All payments must be processed through the designated payment channels. The Company reserves the right to implement additional security measures for payment processing as deemed necessary. Payment methods may be restricted based on risk assessment and compliance requirements.</p>
          </div>
          
          <div>
            <h4 className="font-semibold">Dispute Resolution</h4>
            <p className="mt-2">Any disputes arising from commercial terms shall be resolved through good faith negotiations. If negotiations fail, disputes shall be subject to binding arbitration in accordance with Malaysian law. The arbitration process shall be conducted in English and the decision shall be final and binding.</p>
          </div>
          
          <div>
            <h4 className="font-semibold">Service Level Agreements</h4>
            <p className="mt-2">The Company will provide services in accordance with the agreed service level agreements. Service availability targets and performance metrics are outlined in the technical specifications. The Client acknowledges that service interruptions may occur due to maintenance, upgrades, or unforeseen circumstances.</p>
      </div>

        <div>
            <h4 className="font-semibold">Compliance and Regulatory</h4>
            <p className="mt-2">Both parties agree to comply with all applicable laws and regulations. The Client is responsible for ensuring their use of the services complies with local and international regulations. The Company reserves the right to modify services to ensure regulatory compliance.</p>
        </div>
          
        <div>
            <h4 className="font-semibold">Termination and Suspension</h4>
            <p className="mt-2">Either party may terminate this agreement with written notice as specified in the terms. The Company reserves the right to suspend or terminate services immediately in case of breach of terms, non-payment, or regulatory requirements. Upon termination, all outstanding fees become immediately due.</p>
          </div>
        </div>
      </div>

      <h2 className="text-sm font-semibold mt-4 mb-2 page-break-before">Approvers</h2>
      {(() => {
        const contacts = (data?.contacts || []) as Contact[];
        const primary = contacts[0] as any;
        const byRole = contacts.find(c => (c as any).system_role === 'secondary_approver') as any;
        const byId = contacts.find(c => String((c as any).id) === String((data as any)?.secondary_approver_id)) as any;
        const fallback = (data as any)?.secondary_approver as any;
        const second = byRole || byId || fallback || {};
        return (
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="border-r border-gray-300 pr-4">
              <div className="font-semibold text-base mb-3 text-gray-900">First Approver</div>
              <div className="space-y-2">
                <div><span className="font-medium">Name:</span> {((primary?.first_name || '') + ' ' + (primary?.last_name || '')).trim()}</div>
                <div><span className="font-medium">Company Role:</span> {primary?.company_role || ''}</div>
                <div><span className="font-medium">Email:</span> {primary?.email || ''}</div>
                <div><span className="font-medium">Contact:</span> {(primary?.contact_prefix || '+60') + ' ' + (primary?.contact_number || '')}</div>
              </div>
            </div>
            <div className="pl-4">
              <div className="font-semibold text-base mb-3 text-gray-900">Second Approver</div>
              <div className="space-y-2">
                <div><span className="font-medium">Name:</span> {(((second?.first_name) || '') + ' ' + ((second?.last_name) || '')).trim()}</div>
                <div><span className="font-medium">Company Role:</span> {second?.company_role || ''}</div>
                <div><span className="font-medium">Email:</span> {second?.email || ''}</div>
                <div><span className="font-medium">Contact:</span> {(second?.contact_prefix || '+60') + ' ' + (second?.contact_number || '')}</div>
              </div>
            </div>
          </div>
        );
      })()}


      <h2 className="text-sm font-semibold mt-4 mb-2 page-break-before">Appendix: Process Timeline</h2>
      <div className="text-sm space-y-4">
        {logs.length > 0 ? (
          logs.map((l, i) => {
            // Count amendment requests up to this point
            const amendmentCount = logs.slice(0, i + 1).filter(log => log.action === 'Amendment Requested').length;
            const displayAction = l.action === 'Amendment Requested' 
              ? `Amendment Requested #${amendmentCount}`
              : l.action;
            
            return (
              <div key={i} className="border-l-2 border-gray-200 pl-4 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold text-gray-900">{displayAction}</div>
                  <div className="text-xs text-gray-500 ml-4 flex-shrink-0">{l.timestamp}</div>
                </div>
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">{l.details}</div>
              </div>
            );
          })
        ) : (
          <div className="text-gray-500 italic">No timeline entries available.</div>
        )}
      </div>

      {/* All Amendment Comparisons with Timestamps (moved under Appendix: Process Timeline) */}
      {amendmentComparisons.length > 0 && (
        <>
          <h2 className="text-sm font-semibold mt-4 mb-1 page-break-before">Amendment History</h2>
          <div className="text-xs text-gray-600 mb-4">All amendment requests with timestamps (oldest first)</div>
          {amendmentComparisons.map((comparison, index) => (
            <div key={comparison.id} className="mb-8 border border-gray-300 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Amendment #{index + 1}</h3>
                  <div className="text-xs text-gray-600 mt-1">
                    <div><strong>Timestamp:</strong> {formatDateTime(new Date(comparison.timestamp))}</div>
                    <div><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${comparison.status === 'approved' ? 'bg-green-100 text-green-800' : comparison.status === 'rejected' || comparison.status === 'declined' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{comparison.status === 'rejected' ? 'declined' : comparison.status}</span></div>
                    <div><strong>Decision:</strong> <span className="font-medium">{comparison.decision}</span></div>
                    <div><strong>Note:</strong> {comparison.note}</div>
                  </div>
                </div>
              </div>

              {/* Basic Corporate Information */}
              <div className="grid grid-cols-2 gap-8 text-sm mb-6">
                {/* Left (Original) */}
                <div className="pr-4 border-r border-gray-300">
                  <div className="font-medium mb-1">Original</div>
                  <div className="space-y-1">
                    {fields.map(f => (
                      <div key={f.key}>
                        <span className="font-medium">{f.label}:</span> {fmt(comparison.original?.[f.key], f.format)}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Right (Amended) */}
                <div className="pl-4">
                  <div className="font-medium mb-1">Amended</div>
                  <div className="space-y-1">
                    {fields.map(f => (
                      <div key={f.key}>
                        <span className="font-medium">{f.label}:</span> <span className={changed(comparison.original, comparison.amended, f.key) ? 'font-bold text-red-600' : ''}>{fmt(comparison.amended?.[f.key], f.format)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contacts Comparison */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-2">Contacts Comparison</h4>
                <div className="grid grid-cols-2 gap-8 text-sm">
                  <div className="pr-4 border-r border-gray-300">
                    <div className="font-medium mb-2">Original Contacts</div>
                    <div className="space-y-2">
                      {comparison.original?.contacts?.map((contact: any, contactIndex: number) => (
                        <div key={contactIndex} className="border border-gray-200 rounded p-2">
                          <div className="font-medium text-xs">
                            {contact.system_role === 'secondary_approver' ? 'Secondary Approver' : contactIndex === 0 ? 'Primary Contact' : `Contact ${contactIndex + 1}`}
                          </div>
                          <div className="text-xs space-y-1">
                            <div><span className="font-medium">Name:</span> {`${contact.first_name || ''} ${contact.last_name || ''}`.trim()}</div>
                            <div><span className="font-medium">Role:</span> {contact.company_role || ''}</div>
                            <div><span className="font-medium">Email:</span> {contact.email || ''}</div>
                          </div>
                        </div>
                      )) || <div className="text-gray-500 italic text-xs">No contacts</div>}
                    </div>
                  </div>
                  <div className="pl-4">
                    <div className="font-medium mb-2">Amended Contacts</div>
                    <div className="space-y-2">
                      {comparison.amended?.contacts?.map((contact: any, contactIndex: number) => {
                        const originalContact = comparison.original?.contacts?.[contactIndex];
                        const hasFirstNameChange = originalContact && originalContact.first_name !== contact.first_name;
                        const hasLastNameChange = originalContact && originalContact.last_name !== contact.last_name;
                        const hasRoleChange = originalContact && originalContact.company_role !== contact.company_role;
                        const hasEmailChange = originalContact && originalContact.email !== contact.email;

                        return (
                          <div key={contactIndex} className="border border-gray-200 rounded p-2">
                            <div className="font-medium text-xs">
                              {contact.system_role === 'secondary_approver' ? 'Secondary Approver' : contactIndex === 0 ? 'Primary Contact' : `Contact ${contactIndex + 1}`}
                            </div>
                            <div className="text-xs space-y-1">
                              <div>
                                <span className="font-medium">Name:</span>
                                <span className={hasFirstNameChange ? 'font-bold text-red-600' : ''}>{contact.first_name || ''}</span>
                                <span> </span>
                                <span className={hasLastNameChange ? 'font-bold text-red-600' : ''}>{contact.last_name || ''}</span>
                              </div>
                              <div><span className="font-medium">Role:</span> <span className={hasRoleChange ? 'font-bold text-red-600' : ''}>{contact.company_role || ''}</span></div>
                              <div><span className="font-medium">Email:</span> <span className={hasEmailChange ? 'font-bold text-red-600' : ''}>{contact.email || ''}</span></div>
                            </div>
                          </div>
                        );
                      }) || <div className="text-gray-500 italic text-xs">No contacts</div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subsidiaries Comparison */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-2">Subsidiaries Comparison</h4>
                <div className="grid grid-cols-2 gap-8 text-sm">
                  <div className="pr-4 border-r border-gray-300">
                    <div className="font-medium mb-2">Original Subsidiaries</div>
                    <div className="space-y-2">
                      {comparison.original?.subsidiaries?.map((subsidiary: any, subIndex: number) => (
                        <div key={subIndex} className="border border-gray-200 rounded p-2">
                          <div className="font-medium text-xs">Subsidiary {subIndex + 1}</div>
                          <div className="text-xs space-y-1">
                            <div><span className="font-medium">Name:</span> {subsidiary.company_name || ''}</div>
                            <div><span className="font-medium">Reg No:</span> {subsidiary.reg_number || ''}</div>
                            <div><span className="font-medium">Address:</span> {`${subsidiary.address1 || ''}${subsidiary.address2 ? `, ${subsidiary.address2}` : ''}`}</div>
                          </div>
                        </div>
                      )) || <div className="text-gray-500 italic text-xs">No subsidiaries</div>}
                    </div>
                  </div>
                  <div className="pl-4">
                    <div className="font-medium mb-2">Amended Subsidiaries</div>
                    <div className="space-y-2">
                      {comparison.amended?.subsidiaries?.map((subsidiary: any, subIndex: number) => {
                        const originalSubsidiary = comparison.original?.subsidiaries?.[subIndex];
                        const hasNameChange = originalSubsidiary && originalSubsidiary.company_name !== subsidiary.company_name;
                        const hasRegChange = originalSubsidiary && originalSubsidiary.reg_number !== subsidiary.reg_number;
                        const hasAddress1Change = originalSubsidiary && originalSubsidiary.address1 !== subsidiary.address1;
                        const hasAddress2Change = originalSubsidiary && originalSubsidiary.address2 !== subsidiary.address2;
                        const hasCityChange = originalSubsidiary && originalSubsidiary.city !== subsidiary.city;
                        const hasStateChange = originalSubsidiary && originalSubsidiary.state !== subsidiary.state;
                        const hasPostcodeChange = originalSubsidiary && originalSubsidiary.postcode !== subsidiary.postcode;
                        const hasCountryChange = originalSubsidiary && originalSubsidiary.country !== subsidiary.country;

                        return (
                          <div key={subIndex} className="border border-gray-200 rounded p-2">
                            <div className="font-medium text-xs">Subsidiary {subIndex + 1}</div>
                            <div className="text-xs space-y-1">
                              <div><span className="font-medium">Name:</span> <span className={hasNameChange ? 'font-bold text-red-600' : ''}>{subsidiary.company_name || ''}</span></div>
                              <div><span className="font-medium">Reg No:</span> <span className={hasRegChange ? 'font-bold text-red-600' : ''}>{subsidiary.reg_number || ''}</span></div>
                              <div>
                                <span className="font-medium">Address:</span>
                                <span className={hasAddress1Change ? 'font-bold text-red-600' : ''}>{subsidiary.address1 || ''}</span>
                                {subsidiary.address2 && (
                                  <>
                                    <span>, </span>
                                    <span className={hasAddress2Change ? 'font-bold text-red-600' : ''}>{subsidiary.address2}</span>
                                  </>
                                )}
                              </div>
                              <div>
                                <span className="font-medium">City:</span> <span className={hasCityChange ? 'font-bold text-red-600' : ''}>{subsidiary.city || ''}</span>
                                <span> </span>
                                <span className="font-medium">State:</span> <span className={hasStateChange ? 'font-bold text-red-600' : ''}>{subsidiary.state || ''}</span>
                              </div>
                              <div>
                                <span className="font-medium">Postcode:</span> <span className={hasPostcodeChange ? 'font-bold text-red-600' : ''}>{subsidiary.postcode || ''}</span>
                                <span> </span>
                                <span className="font-medium">Country:</span> <span className={hasCountryChange ? 'font-bold text-red-600' : ''}>{subsidiary.country || ''}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }) || <div className="text-gray-500 italic text-xs">No subsidiaries</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-root, #print-root * { visibility: visible !important; }
          #print-root { 
            display: block !important; 
            position: static !important; 
            inset: auto !important;
            page-break-inside: avoid;
          }
          a { text-decoration: none !important; color: inherit !important; }
          h1, h2 { page-break-after: avoid; }
          .space-y-4 > * { page-break-inside: avoid; }
          .page-break-before { page-break-before: always; }
          @page { 
            size: A4; 
            margin: 15mm 12mm; 
          }
          @page :first {
            margin-top: 12mm;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintCorporateAgreementPage;


