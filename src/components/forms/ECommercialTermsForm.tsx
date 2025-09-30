"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { useRouter } from 'next/navigation';
import DisplayField from '../common/DisplayField';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import ContentSection from '../common/ContentSection';
import ErrorMessageModal from '../modals/ErrorMessageModal';
import ChangeStatusModal from '../modals/ChangeStatusModal';
import GenericTermsModal from '../modals/GenericTermsModal';
import CommercialTermsModal from '../modals/CommercialTermsModal';
import SuccessModal from '../modals/SuccessModal';

import { CorporateDetails, Contact, CorporateStatus } from '../../types';
import { getAmendmentRequestsByCorporate } from '../../services/api';
import { countries, getStatesWithNA, getStateFieldLabel, getUniqueCallingCodes } from '../../data/countries';

// Timestamp Log Data Structures
interface LogEntry {
    timestamp: string;
    action: string;
    details: string;
    status: 'completed' | 'pending' | 'rejected' | 'draft';
}

interface AgreementDetails {
    title: string;
    executionDate: string;
    effectiveDate: string;
    referenceId: string;
    digitalSignatureStatus: string;
}

interface TimestampLogData {
    agreementDetails: AgreementDetails;
    logs: LogEntry[];
}

interface ECommercialTermsFormProps {
    onCloseForm: () => void;
    setFormStep: (step: number) => void;
    formData: CorporateDetails;
    setFormData: (dataUpdater: (prevData: CorporateDetails) => CorporateDetails) => void;
    onSaveCorporate: (formData: CorporateDetails, action: 'submit' | 'sent' | 'save') => void;
    formMode: 'new' | 'edit' | 'approve' | 'approve-second';
    updateStatus: (id: string, status: CorporateStatus, note?: string) => Promise<void>;
}

const ECommercialTermsForm: React.FC<ECommercialTermsFormProps> = ({ onCloseForm, setFormStep, formData, setFormData, onSaveCorporate, formMode, updateStatus }) => {
    const router = useRouter();
    const printRef = React.useRef<HTMLDivElement>(null);
    const [showValidationError, setShowValidationError] = React.useState(false);
    const [validationErrorMessage, setValidationErrorMessage] = React.useState('');
    const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
    const [isGenericTermsModalOpen, setIsGenericTermsModalOpen] = React.useState(false);
    const [isCommercialTermsModalOpen, setIsCommercialTermsModalOpen] = React.useState(false);
    const [isApproving, setIsApproving] = React.useState(false);
    const [isSendingToApprover, setIsSendingToApprover] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isTermsConditionsExpanded, setIsTermsConditionsExpanded] = React.useState(false);
    const [isTimelineOpen, setIsTimelineOpen] = React.useState(false);
    const [isRejecting, setIsRejecting] = React.useState(false);
    const [isRejectSuccessModalOpen, setIsRejectSuccessModalOpen] = React.useState(false);
    const [latestAmendmentId, setLatestAmendmentId] = React.useState<string | null>(null);

    const handlePrint = () => {
        try {
            if (formData?.id && formData.id !== 'new') {
                router.push(`/corporate/${formData.id}/pdf`);
                return;
            }
            const originalTitle = document.title;
            const safeName = (formData.company_name || 'Corporate').replace(/[/\\:*?"<>|]/g, '-');
            document.title = `${safeName} - Happy Token`;
            window.print();
            setTimeout(() => { document.title = originalTitle; }, 0);
        } catch (e) {
            console.error('Print failed:', e);
        }
    };

    // Form read-only logic - make form read-only in edit mode, cooling period, or approved/rejected status
    const isCoolingPeriod = formData.status === 'Cooling Period';
    const isApprovedOrRejected = formData.status === 'Approved' || formData.status === 'Rejected';
    const isEditMode = formMode === 'edit';
    const isReadOnly = isEditMode || isCoolingPeriod || isApprovedOrRejected;
    
    // Logic to determine when to show display-only fields
    const shouldShowDisplayOnly = isCoolingPeriod || isApprovedOrRejected;

    const primaryContact = formData.contacts?.[0] || {};
    const otherContacts = formData.contacts?.slice(1) || [];

    // Resolve latest amendment request id for this corporate (with data)
    React.useEffect(() => {
        const fetchLatestAmendment = async () => {
            try {
                if (!formData?.id) return;
                const list = await getAmendmentRequestsByCorporate(String(formData.id));
                const arr = Array.isArray(list) ? list : [];
                const withData = arr.filter((x: any) => {
                    const data = (x && (x.amendment_data || x.amendmentData || null));
                    if (!data || typeof data !== 'object') return false;
                    return Object.keys(data).length > 0;
                });
                if (!withData.length) { setLatestAmendmentId(null); return; }
                const preferred = withData.find((x: any) => x.to_status === 'Amendment Requested');
                const latest = preferred || [...withData].sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];
                setLatestAmendmentId(latest?.id ? String(latest.id) : null);
            } catch {
                setLatestAmendmentId(null);
            }
        };
        fetchLatestAmendment();
    }, [formData?.id, formData?.status]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = 'checked' in e.target ? e.target.checked : false;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSecondaryApproverChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = 'checked' in e.target ? e.target.checked : false;
        const sanitizedValue = typeof value === 'string' ? value.replace(/'/g, '') : value; // Remove single quotes
        console.log('handleSecondaryApproverChange - name:', name, 'value:', sanitizedValue, 'checked:', checked);
        setFormData(prev => ({
            ...prev,
            secondary_approver: {
                ...prev.secondary_approver,
                [name]: type === 'checkbox' ? checked : sanitizedValue
            }
        }));
    };
    
    const handleSecondaryContactSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const contactId = e.target.value;
        const selectedContact = formData.contacts.find((c: Contact) => c.id?.toString() === contactId);
        
        setFormData(prev => ({
            ...prev,
            secondary_approver_id: contactId || null,
            secondary_approver: {
                ...prev.secondary_approver,
                selected_contact_id: contactId,
                salutation: selectedContact ? selectedContact.salutation : 'Mr',
                first_name: selectedContact ? selectedContact.first_name : '',
                last_name: selectedContact ? selectedContact.last_name : '',
                company_role: selectedContact ? selectedContact.company_role : '',
                system_role: 'secondary_approver',
                email: selectedContact ? selectedContact.email : '',
                contact_number: selectedContact ? selectedContact.contact_number : '',
            }
        }));
    };
    
    const { secondary_approver: secondaryApproverFromData } = formData;
    const derivedFromId = React.useMemo(() => {
        if (!formData.secondary_approver_id) return undefined;
        const c = formData.contacts?.find(c => c.id === formData.secondary_approver_id);
        if (!c) return undefined;
        return {
            use_existing_contact: true,
            selected_contact_id: c.id!,
            salutation: c.salutation,
            first_name: c.first_name,
            last_name: c.last_name,
            company_role: c.company_role,
            system_role: c.system_role || 'secondary_approver',
            email: c.email,
            contact_number: c.contact_number,
            contact_prefix: c.contact_prefix,
        };
    }, [formData.secondary_approver_id, formData.contacts]);

    const secondary_approver = secondaryApproverFromData || derivedFromId || {
        use_existing_contact: false,
        selected_contact_id: '',
        salutation: 'Mr',
        first_name: '',
        last_name: '',
        company_role: '',
        system_role: 'secondary_approver',
        email: '',
        contact_number: '',
        contact_prefix: '+60',
    };
    const isSecondaryFromList = secondary_approver.use_existing_contact;
    const validateSecondaryApprover = (): boolean => {
        if (!(formMode === 'approve' || formMode === 'approve-second')) {
            // No validation required in new/edit modes
            return true;
        }
        // Use resolved secondary approver (may come from existing contact selection)
        const s = secondary_approver;
        if (!s) {
            setValidationErrorMessage("Secondary approver details are missing.");
            return false;
        }

        if (s.use_existing_contact) {
            if (!s.selected_contact_id) {
                setValidationErrorMessage("Please select an existing contact for secondary approval.");
                return false;
            }
        } else {
            const trim = (v?: string | null) => (typeof v === 'string' ? v.trim() : '');
            const missing: string[] = [];
            if (!trim(s.first_name)) missing.push('First Name');
            if (!trim(s.last_name)) missing.push('Last Name');
            if (!trim(s.company_role)) missing.push('Company Role');
            if (!trim(s.email)) missing.push('Email');
            if (!trim(s.contact_number)) missing.push('Contact Number');
            if (missing.length) {
                setValidationErrorMessage(`Please fill in: ${missing.join(', ')}.`);
                return false;
            }
        }
        setValidationErrorMessage(''); // Clear error message if validation passes
        return true;
    };

    const validateFirstApproval = (): boolean => {
        if (!formData.first_approval_confirmation) {
            setValidationErrorMessage('Please confirm first approval.');
            return false;
        }
        if (!validateSecondaryApprover()) {
            // validateSecondaryApprover sets message
            return false;
        }
        setValidationErrorMessage('');
        return true;
    };

    // Date formatting utility
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

    // Get digital signature status based on current form state
    const getDigitalSignatureStatus = (): string => {
        if (formData.second_approval_confirmation) return 'Fully Executed';
        if (formData.first_approval_confirmation) return 'Pending 2nd Approval';
        if (formData.status === 'Pending 1st Approval') return 'Pending 1st Approval';
        return 'Draft';
    };

    // Generate timestamp log entries based on form data and status
    const generateTimestampLog = (): TimestampLogData => {
        const logs: LogEntry[] = [];
        const now = new Date();

        // Agreement details
        const agreementDetails: AgreementDetails = {
            title: "Commercial Services Agreement",
            executionDate: formatDateTime(now),
            effectiveDate: formData.agreement_from ? formatDateTime(new Date(formData.agreement_from)) : 'TBD',
            referenceId: (formData.id ? `HT-${String(formData.id)}` : (formData.created_at ? `HT-${new Date(formData.created_at as string).getTime()}` : 'HT-PENDING')),
            digitalSignatureStatus: getDigitalSignatureStatus()
        };

        // Process logs based on current status
        if (formData.created_at) {
            // Try to get submitter info from the first investigation log or form data
            let submitterInfo = '';
            if (formData.investigation_log && formData.investigation_log.length > 0) {
                const firstLog = formData.investigation_log[0];
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
                timestamp: formatDateTime(new Date(formData.created_at)),
                action: 'Agreement Created',
                details: 'Initial draft prepared and submitted for review\n' + submitterInfo,
                status: 'completed'
            });
        }

        if (formData.status === 'Pending 1st Approval' || formData.status === 'Approved' || formData.status === 'Rejected') {
            // For Sent for Approval, always show CRT Team as the actor
            const approvalSubmitterInfo = 'Submitted by: CRT Team';
            
            logs.push({
                timestamp: formatDateTime(new Date(formData.updated_at || now)),
                action: 'Sent for Approval',
                details: 'Agreement submitted to first approver for review\n' + approvalSubmitterInfo,
                status: 'completed'
            });
        }


        // Process all status changes from investigation log
        if (formData.investigation_log) {
            // Sort investigation logs by timestamp (oldest first, most recent at bottom)
            const sortedLogs = [...formData.investigation_log].sort((a, b) => 
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

            const contactsList = (formData.contacts || []) as Contact[];
            const buildName = (first?: string, last?: string, email?: string | null) => {
                const name = [first || '', last || ''].join(' ').trim();
                return name || (email || '');
            };

            const deriveSubmitterFromPrevStatus = (prevStatus?: string | null): { name: string; role: string } => {
                if (prevStatus === 'Pending 2nd Approval') {
                    const byRole = contactsList.find(c => c.system_role === 'secondary_approver');
                    const byId = contactsList.find(c => String(c.id) === String(formData.secondary_approver_id));
                    const chosen = byRole || byId;
                    if (chosen) return { name: buildName(chosen.first_name, chosen.last_name, chosen.email), role: chosen.company_role || 'Secondary Approver' };
                    const sa: any = formData.secondary_approver;
                    if (sa) return { name: buildName(sa.first_name, sa.last_name, sa.email), role: sa.company_role || 'Secondary Approver' };
                    return { name: '', role: 'Secondary Approver' };
                }
                const primary = contactsList[0];
                if (primary) return { name: buildName(primary.first_name, primary.last_name, primary.email), role: primary.company_role || 'First Approver' };
                return { name: '', role: 'First Approver' };
            };

            sortedLogs.forEach(log => {
                // Debug: Log the actual data we're working with
                console.log('Processing log:', {
                    timestamp: log.timestamp,
                    to_status: log.to_status,
                    note: log.note,
                    from_status: log.from_status
                });
                
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
                    if (!submitterInfo && primaryContact.first_name && primaryContact.last_name) {
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
                    (log.note && /amendment\s+approved\s+by\s+crt/i.test(log.note)) ||
                    (log.from_status === 'Amendment Requested' && (log.to_status === 'Pending 1st Approval' || log.to_status === 'Pending 2nd Approval'))
                ) {
                    const target = log.to_status;
                    const notified = target === 'Pending 2nd Approval' ? 'Second Approver' : 'First Approver';
                    // Reuse submitter derivation from previous status (who originally submitted before this step)
                    const submitterInfo = deriveSubmitterFromPrevStatus(target);
                    const submitterLine = submitterInfo.name
                        ? `Submitted by: ${submitterInfo.name}${submitterInfo.role ? ` (${submitterInfo.role})` : ''}`
                        : '';
                    const details = [
                        `Reverted to: ${target}`,
                        `Notified: ${notified}`,
                        submitterLine,
                    ].filter(Boolean).join('\n');
                    logs.push({
                        timestamp: formatDateTime(new Date(log.timestamp)),
                        action: 'Amendment Approved',
                        details,
                        status: 'completed'
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
                    // Pattern: "Amendment rejected by CRT: nononono"
                    if (!reason) {
                        const crtMatch = note.match(/rejected\s+by\s+[^:]+:\s*([^\n]+)/i);
                        if (crtMatch) reason = crtMatch[1].trim();
                    }
                    if (!reviewer) {
                        const reviewerGeneric = note.match(/rejected\s+by\s+([^:]+):/i);
                        if (reviewerGeneric) reviewer = reviewerGeneric[1].trim();
                    }
                    if (!reviewer) reviewer = 'CRT Team';
                    if (!reason) reason = 'Amendment rejected.';

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
                    // Do not push immediately; we'll add a single consolidated entry after the loop
                } else if (
                    log.note && /registration link sent\s*to\s*(?:2nd|second) approver/i.test(log.note)
                ) {
                    // For Second Approval Requested, always show CRT Team as the actor
                    const actor = 'Submitted by: CRT Team';
                    logs.push({
                        timestamp: formatDateTime(new Date(log.timestamp)),
                        action: 'Second Approval Requested',
                        details: 'Registration link sent to second approver.\n' + actor,
                        status: 'completed'
                    });
                } else if (log.to_status === 'Pending 2nd Approval' || (log.note && log.note.toLowerCase().includes('first approval'))) {
                    logs.push({
                        timestamp: formatDateTime(new Date(log.timestamp)),
                        action: 'First Approval Granted',
                        details: (log.note || 'First approval completed') + '\n' + toApprovedBy(getSubmitterInfo(log.note || '')),
                        status: 'completed'
                    });
                } else if (log.to_status === 'Cooling Period' || (log.note && log.note.toLowerCase().includes('second approval'))) {
                    logs.push({
                        timestamp: formatDateTime(new Date(log.timestamp)),
                        action: 'Second Approval Granted',
                        details: (log.note || 'Second approval completed') + '\n' + toApprovedBy(getSubmitterInfo(log.note || '')),
                        status: 'completed'
                    });
                } else if (log.to_status === 'Amendment Requested' || (log.note && log.note.toLowerCase().includes('amendment'))) {
                    // Enforce standard format for amendment entries
                    const prevStatus = log.from_status;
                    const contactsList = (formData.contacts || []) as Contact[];
                    const buildName = (first?: string, last?: string, email?: string | null) => {
                        const name = [first || '', last || ''].join(' ').trim();
                        return name || (email || '')
                    };
                    let name = '';
                    let role = '';
                    if (prevStatus === 'Pending 2nd Approval') {
                        const byRole = contactsList.find(c => c.system_role === 'secondary_approver');
                        const byId = contactsList.find(c => String(c.id) === String(formData.secondary_approver_id));
                        const chosen = byRole || byId;
                        if (chosen) {
                            name = buildName(chosen.first_name, chosen.last_name, chosen.email);
                            role = chosen.company_role || 'Secondary Approver';
                        } else if (formData.secondary_approver) {
                            const sa: any = formData.secondary_approver;
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
                    const submittedLine = name ? `Amendment Request Submitted by: ${name}${role ? ` (${role})` : ''}` : '';
                    const statusChanged = `Status changed from ${prevStatus || 'Previous Status'} to ${log.to_status || 'Amendment Requested'}`;
                    const details = [statusChanged, submittedLine].filter(Boolean).join('\n');

                    logs.push({
                        timestamp: formatDateTime(new Date(log.timestamp)),
                        action: 'Amendment Requested',
                        details,
                        status: 'pending'
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
                    `Reason:  ${lr.reason}`,
                    `Rejected by: ${lr.reviewer}`,
                    `Submitted by: ${lr.submittedByName}${lr.submittedByRole ? ` (${lr.submittedByRole})` : ''}`,
                ].join('\n');
                logs.push({
                    timestamp: formatDateTime(lr.timestamp),
                    action: 'Amendment Rejected',
                    details,
                    status: 'rejected',
                });
            }
        }

        // Add pending actions based on current form mode
        if (formMode === 'approve' && !formData.first_approval_confirmation) {
            logs.push({
                timestamp: 'Pending',
                action: 'First Approval Required',
                details: 'Awaiting first approver confirmation',
                status: 'pending'
            });
        }

        if (formMode === 'approve' && formData.first_approval_confirmation && !formData.second_approval_confirmation) {
            logs.push({
                timestamp: 'Pending',
                action: 'Second Approval Required',
                details: 'Awaiting secondary approver confirmation',
                status: 'pending'
            });
        }

        // Add high-level milestones based on current status
        if (formData.status === 'Cooling Period') {
            logs.push({
                timestamp: formatDateTime(new Date(formData.updated_at || now)),
                action: 'Sent for Finalization',
                details: 'Cooling Period initiated.\nSubmitted by: CRT Team',
                status: 'completed'
            });
        }

        if (formData.status === 'Approved') {
            logs.push({
                timestamp: formatDateTime(new Date(formData.updated_at || now)),
                action: 'Account Created',
                details: 'Account created successfully.\nConfirmation email sent with attached full-form PDF.\nSubmitted by: CRT Team',
                status: 'completed'
            });
        }

        // Sort all logs by timestamp (oldest first, most recent at bottom)
        const sortedLogs = logs.sort((a, b) => {
            if (a.timestamp === 'Pending') return 1; // Pending items go to bottom
            if (b.timestamp === 'Pending') return -1;
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });

        return { agreementDetails, logs: sortedLogs };
    };

    const { agreementDetails, logs } = generateTimestampLog();

    return (
        <div className="space-y-6">
            
            <ErrorMessageModal
                isOpen={showValidationError}
                onClose={() => setShowValidationError(false)}
                message={validationErrorMessage}
            />
            <ChangeStatusModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                corporate={formData}
                targetStatus={'Rejected'}
                onSave={async (corporateId, status, note) => {
                    setIsRejecting(true);
                    try {
                        await updateStatus(corporateId, status, note);
                        setIsRejectModalOpen(false);
                        setIsRejectSuccessModalOpen(true);
                    } catch (error) {
                        console.error('Rejection failed:', error);
                        setIsRejecting(false);
                    }
                }}
                isRejecting={true}
            />
            <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm max-w-5xl mx-auto border border-gray-200">
                <h1 className="text-center text-xl font-bold text-ht-gray-dark mb-4">e-Commercial Agreement</h1>
                {formData.status === 'Approved' && (
                  <div className="flex justify-end mb-4 gap-2">
                    <a
                      href={formData?.id ? `http://localhost:3001/corporates/${formData.id}/pdf` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
                    >
                      Preview PDF (Server)
                    </a>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue-dark"
                    >
                      Download PDF
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-600 mb-6 p-4 bg-gray-50 border rounded-md">
                    Thank you. Your commercial agreement submission has been received. <br />
                    This confirms that <strong>{formData.company_name || '[Client Company Name]'} [Company No: {formData.reg_number || 'XXXXXXXX-X'}]</strong>, represented by <strong>{`${primaryContact.first_name || ''} ${primaryContact.last_name || '[Full Name of Signatory]'}`.trim()}</strong>, has successfully entered into a commercial agreement with: <br />
                    <strong>HT Voucher Trading Sdn Bhd (Company No: 202401035271 (1581118A))</strong> <br />
                    Trading As: HappieToken
                </p>

                <ContentSection title="Commercial Terms">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="space-y-4">
                            <DisplayField label="Company Name" value={formData.company_name} borderless />
                            <DisplayField label="Official Registration Number" value={formData.reg_number} borderless />
                            <DisplayField label="Office Address" value={`${formData.office_address1}${formData.office_address2 ? `, ${formData.office_address2}` : ''}`} borderless />
                            <DisplayField label="Postcode" value={formData.postcode} borderless />
                            <DisplayField label="City" value={formData.city} borderless />
                            <DisplayField label="State" value={formData.state} borderless />
                            <DisplayField label="Country" value={formData.country} borderless />
                            <DisplayField label="Website" value={formData.website} borderless />
                            <DisplayField label="Account Note" value={formData.account_note} borderless />
                        </div>
                        <div className="space-y-4">
                            <DisplayField label="Agreement Duration" value={formData.agreement_from && formData.agreement_to ? `${new Date(formData.agreement_from).toISOString().split('T')[0]} to ${new Date(formData.agreement_to).toISOString().split('T')[0]}` : ''} borderless />
                            <DisplayField label="Credit Limit" value={`MYR ${formData.credit_limit}`} borderless />
                            <DisplayField label="Credit Terms" value={`${formData.credit_terms} days`} borderless />
                            <DisplayField label="Transaction Fees Rate" value={`${formData.transaction_fee}%`} borderless />
                            <DisplayField label="Late Payment Interest" value={`${formData.late_payment_interest}%`} borderless />
                            <DisplayField label="White Labeling Fee (*only when request)" value={formData.white_labeling_fee ? `${formData.white_labeling_fee}%` : 'N/A'} borderless />
                            <DisplayField label="Custom Feature Request Fee (*only when request)" value={`MYR ${formData.custom_feature_fee}`} borderless />
                        </div>
                    </div>
                    
                    {/* More Button placed under Commercial Terms - right aligned */}
                    <div className="flex justify-end mt-4">
                        <button
                            type="button"
                            onClick={() => setIsTermsConditionsExpanded(!isTermsConditionsExpanded)}
                            className="flex items-center text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-ht-blue rounded-md px-3 py-2 border border-gray-300 hover:bg-gray-50"
                        >
                            More
                            <svg className={`ml-1 w-4 h-4 transition-transform ${isTermsConditionsExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </ContentSection>

                {/* Terms & Conditions Section - Conditionally Rendered */}
                {isTermsConditionsExpanded && (
                    <ContentSection title="Terms & Conditions">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
                                 onClick={() => setIsGenericTermsModalOpen(true)}>
                                <span className="text-sm font-medium text-gray-900">
                                    Generic Terms and Conditions
                                </span>
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
                                 onClick={() => setIsCommercialTermsModalOpen(true)}>
                                <span className="text-sm font-medium text-gray-900">
                                    Commercial Terms and Conditions
                                </span>
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </ContentSection>
                )}
                
                <ContentSection title="First Approval">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <DisplayField label="Signatory Name" value={`${primaryContact.first_name || ''} ${primaryContact.last_name || ''}`.trim()} borderless />
                        <DisplayField label="Company Role" value={primaryContact.company_role} borderless />
                        <DisplayField label="System Role" value={primaryContact.system_role} borderless />
                        <DisplayField label="Email Address" value={primaryContact.email} borderless />
                        <DisplayField label="Contact Number" value={primaryContact.contact_number ? `${primaryContact.contact_prefix || '+60'} ${primaryContact.contact_number}` : ''} borderless />
                    </div>
                    <div className="flex items-start mt-6">
                        <input 
                            type="checkbox" 
                            id="first_approval_confirmation" 
                            name="first_approval_confirmation" 
                            checked={formData.first_approval_confirmation ?? false} 
                            onChange={handleChange} 
                            disabled={formMode === 'new' || formMode === 'edit' || formMode === 'approve-second' || isCoolingPeriod}
                            className={`h-4 w-4 mt-0.5 border-gray-300 rounded focus:ring-ht-gray ${(formMode === 'new' || formMode === 'edit' || formMode === 'approve-second' || isCoolingPeriod) ? 'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100' : ''}`} 
                        />
                        <label htmlFor="first_approval_confirmation" className={`ml-3 block text-xs ${(formMode === 'new' || formMode === 'edit' || formMode === 'approve-second' || isCoolingPeriod) ? 'text-gray-500' : 'text-gray-800'}`}>
                            I hereby confirm that I have read, understood, and agree to the <span className="underline font-bold">Generic Terms and Conditions</span> and <span className="underline font-bold">Commercial Terms and Conditions</span>, and I consent to proceed accordingly.
                        </label>
                    </div>
                </ContentSection>
                
                {((formMode === 'approve' && formData.first_approval_confirmation) || formMode === 'approve-second' || (formMode === 'edit' && (formData.status === 'Pending 2nd Approval' || formData.status === 'Cooling Period' || formData.status === 'Approved'))) && (
                    <ContentSection title="Secondary Approval">
                        {!shouldShowDisplayOnly && (
                            <div className="flex items-center mb-4">
                                <input
                                    type="checkbox"
                                    id="use_existing_contact"
                                    name="use_existing_contact"
                                    checked={!!secondary_approver.use_existing_contact}
                                    onChange={handleSecondaryApproverChange}
                                    disabled={isReadOnly}
                                    className={`h-4 w-4 border-gray-300 rounded focus:ring-ht-gray ${isReadOnly ? 'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100' : ''}`}
                                />
                                <label htmlFor="use_existing_contact" className="ml-2 block text-sm text-gray-900">
                                    Use existing contact person for secondary approval
                                </label>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {shouldShowDisplayOnly ? (
                                // Display-only mode: show all fields as DisplayFields
                                <>
                                    <DisplayField label="Signatory Name" value={`${secondary_approver.first_name || ''} ${secondary_approver.last_name || ''}`.trim()} borderless />
                                    <DisplayField label="Company Role" value={secondary_approver.company_role ?? null} borderless />
                                    <DisplayField label="System Role" value={secondary_approver.system_role ?? null} borderless />
                                    <DisplayField label="Email Address" value={secondary_approver.email ?? null} borderless />
                                    <DisplayField label="Contact Number" value={secondary_approver.contact_number ? `${secondary_approver.contact_prefix || '+60'} ${secondary_approver.contact_number}` : ''} borderless />
                                </>
                            ) : isSecondaryFromList ? (
                                <>
                                    <SelectField
                                        id="secondaryContactSelect"
                                        label="Select Contact Person"
                                        name="selected_contact_id"
                                        value={secondary_approver.selected_contact_id ?? null}
                                        onChange={handleSecondaryContactSelect}
                                        required={formMode === 'approve' || formMode === 'approve-second'}
                                        disabled={isReadOnly}
                                    >
                                        <option value="">Select a contact</option>
                                        {otherContacts.map((contact: Contact) => (
                                            <option key={contact.id} value={contact.id}>
                                                {`${contact.first_name} ${contact.last_name}`}
                                            </option>
                                        ))}
                                    </SelectField>
                                    <DisplayField label="Signatory Name" value={`${secondary_approver.last_name || ''} ${secondary_approver.first_name || ''}`.trim()} />
                                    <DisplayField label="Company Role" value={secondary_approver.company_role ?? null} />
                                    <DisplayField label="System Role" value={secondary_approver.system_role ?? null} />
                                    <DisplayField label="Email Address" value={secondary_approver.email ?? null} />
                                    <DisplayField label="Contact Number" value={secondary_approver.contact_number ? `${secondary_approver.contact_prefix || '+60'} ${secondary_approver.contact_number}` : ''} />
                                </>
                            ) : (
                                <>
                                    <SelectField
                                        id="salutation"
                                        label="Salutation"
                                        name="salutation"
                                        value={secondary_approver.salutation ?? 'Mr'}
                                        onChange={handleSecondaryApproverChange}
                                        required={formMode === 'approve' || formMode === 'approve-second'}
                                        disabled={isReadOnly}
                                    >
                                        <option value="Mr">Mr</option>
                                        <option value="Mrs">Mrs</option>
                                        <option value="Ms">Ms</option>
                                    </SelectField>
                                    <div className="md:col-span-1"></div>
                                    <InputField id="first_name" label="First Name" name="first_name" value={secondary_approver.first_name ?? null} onChange={handleSecondaryApproverChange} required={formMode === 'approve' || formMode === 'approve-second'} disabled={isReadOnly} />
                                    <InputField id="last_name" label="Last Name" name="last_name" value={secondary_approver.last_name ?? null} onChange={handleSecondaryApproverChange} required={formMode === 'approve' || formMode === 'approve-second'} disabled={isReadOnly} />
                                    <InputField id="company_role" label="Company Role" name="company_role" value={secondary_approver.company_role ?? null} onChange={handleSecondaryApproverChange} required={formMode === 'approve' || formMode === 'approve-second'} disabled={isReadOnly} />

                                    <InputField id="email" label="Email Address" name="email" type="email" value={secondary_approver.email ?? null} onChange={handleSecondaryApproverChange} required={formMode === 'approve' || formMode === 'approve-second'} disabled={isReadOnly} />
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">*Contact Number</label>
                                        <div className="flex">
                                            <select 
                                                className={`inline-flex items-center px-3 rounded-l-md ${isReadOnly ? 'border-0' : 'border border-r-0 border-gray-300'} text-gray-500 text-sm focus:ring-ht-blue focus:border-ht-blue ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
                                                value={secondary_approver.contact_prefix || '+60'}
                                                onChange={e => handleSecondaryApproverChange({ target: { name: 'contact_prefix', value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)}
                                                disabled={isReadOnly}
                                            >
            {getUniqueCallingCodes().map((item) => (
                <option key={item.code} value={item.code}>
                    {item.code}
                </option>
            ))}
                                            </select>
                                            <input
                                                type="text"
                                                id="contact_number"
                                                name="contact_number"
                                                value={secondary_approver.contact_number ?? ''}
                                                onChange={handleSecondaryApproverChange}
                                                disabled={isReadOnly}
                                                className={`flex-1 block w-full rounded-none rounded-r-md ${isReadOnly ? 'border-0' : 'border border-gray-300'} p-2 text-sm focus:ring-ht-blue focus:border-ht-blue ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white dark:bg-white'}`}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-start mt-6">
                            <input 
                                type="checkbox" 
                                id="second_approval_confirmation" 
                                name="second_approval_confirmation" 
                                checked={formData.second_approval_confirmation ?? false} 
                                onChange={handleChange} 
                                disabled={formMode === 'approve' || isCoolingPeriod || (formMode === 'edit' && formData.status === 'Pending 2nd Approval') || shouldShowDisplayOnly}
                                className={`h-4 w-4 mt-0.5 border-gray-300 rounded focus:ring-ht-gray ${(formMode === 'approve' || isCoolingPeriod || (formMode === 'edit' && formData.status === 'Pending 2nd Approval') || shouldShowDisplayOnly) ? 'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100' : ''}`} 
                            />
                            <label htmlFor="second_approval_confirmation" className={`ml-3 block text-xs ${(formMode === 'approve' || isCoolingPeriod || (formMode === 'edit' && formData.status === 'Pending 2nd Approval') || shouldShowDisplayOnly) ? 'text-gray-500' : 'text-gray-800'}`}>
                                I hereby confirm that I have read, understood, and agree to the <span className="underline font-bold">Generic Terms and Conditions</span> and <span className="underline font-bold">Commercial Terms and Conditions</span>, and I consent to proceed accordingly.
                            </label>
                        </div>
                    </ContentSection>
                )}

                {/* Agreement Details and Process Log */}
                <ContentSection title="Agreement Details & Process Log">
                    <div className="space-y-6">
                        {/* Agreement Details */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-3">Agreement Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Agreement Title:</span>
                                    <p className="text-gray-900">{agreementDetails.title}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Date of Execution:</span>
                                    <p className="text-gray-900">{agreementDetails.executionDate}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Effective Date:</span>
                                    <p className="text-gray-900">{agreementDetails.effectiveDate}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Reference ID:</span>
                                    <p className="text-gray-900">{agreementDetails.referenceId}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="font-medium text-gray-700">Digital Signature Status:</span>
                                    <p className={`font-semibold ${
                                        agreementDetails.digitalSignatureStatus === 'Fully Executed' ? 'text-green-600' :
                                        agreementDetails.digitalSignatureStatus === 'Pending 2nd Approval' ? 'text-yellow-600' :
                                        agreementDetails.digitalSignatureStatus === 'Pending 1st Approval' ? 'text-orange-600' :
                                        'text-gray-600'
                                    }`}>
                                        {agreementDetails.digitalSignatureStatus}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Process Timeline */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">Process Timeline</h4>
                                <button
                                  type="button"
                                  onClick={() => setIsTimelineOpen(prev => !prev)}
                                  className="flex items-center text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-ht-blue rounded-md px-3 py-2 border border-gray-300 hover:bg-gray-50"
                                >
                                  {isTimelineOpen ? 'Hide Timeline' : 'View Timeline'}
                                  <svg className={`ml-1 w-4 h-4 transition-transform ${isTimelineOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                            </div>
                            {isTimelineOpen && (
                              <div className="space-y-3 mt-3">
                                  {logs.map((log, index) => (
                                      <div key={index} className="flex items-start space-x-3">
                                          <div className="flex-1 min-w-0">
                                              <div className="flex items-center justify-between">
                                                  <p className="text-sm font-semibold text-gray-900">
                                                    {log.action}
                                                    {log.action === 'Amendment Requested' && latestAmendmentId && (
                                                      <button
                                                        type="button"
                                                        onClick={() => router.push(`/amendment/view/${latestAmendmentId}`)}
                                                        className="ml-2 inline-flex items-center text-xs text-ht-blue hover:text-ht-blue-dark"
                                                      >
                                                        View
                                                      </button>
                                                    )}
                                                  </p>
                                                  <p className="text-xs text-gray-500">{log.timestamp}</p>
                                              </div>
                                              <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{log.details}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                            )}
                        </div>
                    </div>
                </ContentSection>

            </div>

            {/* Print-only Container */}
            <div id="print-root" ref={printRef} className="hidden">
                <div style={{ padding: '24px', fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto', color: '#111827' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, textAlign: 'center', marginBottom: '12px' }}>e-Commercial Agreement</h1>
                    <div style={{ fontSize: '12px', color: '#374151', textAlign: 'center', marginBottom: '16px' }}>
                        HT Voucher Trading Sdn Bhd (Company No: 202401035271 (1581118A)) — HappieToken
                    </div>

                    {/* Corporate Summary */}
                    <h2 style={{ fontSize: '14px', fontWeight: 700, marginTop: '16px', marginBottom: '8px' }}>Corporate Summary</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div><strong>Company Name:</strong> {formData.company_name}</div>
                        <div><strong>Registration No.:</strong> {formData.reg_number}</div>
                        <div style={{ gridColumn: '1 / span 2' }}><strong>Office Address:</strong> {`${formData.office_address1 || ''}${formData.office_address2 ? `, ${formData.office_address2}` : ''}`}</div>
                        <div><strong>City:</strong> {formData.city}</div>
                        <div><strong>State:</strong> {formData.state}</div>
                        <div><strong>Postcode:</strong> {formData.postcode}</div>
                        <div><strong>Country:</strong> {formData.country}</div>
                        <div><strong>Website:</strong> {formData.website}</div>
                        <div style={{ gridColumn: '1 / span 2' }}><strong>Account Note:</strong> {formData.account_note}</div>
                    </div>

                    {/* Commercial Terms */}
                    <h2 style={{ fontSize: '14px', fontWeight: 700, marginTop: '16px', marginBottom: '8px' }}>Commercial Terms</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div><strong>Agreement From:</strong> {formData.agreement_from}</div>
                        <div><strong>Agreement To:</strong> {formData.agreement_to}</div>
                        <div><strong>Credit Limit:</strong> {formData.credit_limit}</div>
                        <div><strong>Credit Terms:</strong> {formData.credit_terms}</div>
                        <div><strong>Transaction Fee:</strong> {formData.transaction_fee}%</div>
                        <div><strong>Late Payment Interest:</strong> {formData.late_payment_interest}%</div>
                        <div><strong>White Labeling Fee:</strong> {formData.white_labeling_fee || 'N/A'}</div>
                        <div><strong>Custom Feature Fee:</strong> {formData.custom_feature_fee}</div>
                    </div>

                    {/* Generic Terms & Conditions */}
                    <h2 style={{ fontSize: '14px', fontWeight: 700, marginTop: '16px', marginBottom: '8px', pageBreakBefore: 'always' as any }}>Generic Terms & Conditions</h2>
                    <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
                        <p>These Standard Terms and Conditions (&quot;Terms&quot;) govern the relationship between HT Voucher Trading Sdn Bhd (trading as HappieToken) and the Client. These Terms apply to all Clients unless otherwise agreed in writing.</p>
                        <p>Provision of Services: The Company shall provide the Services described in the relevant Commercial Terms or online order form.</p>
                        <p>Client Obligations: The Client agrees to use the Services in accordance with these Terms and applicable laws.</p>
                        <p>Payment Terms: Payment terms are as specified in the Commercial Terms. The Client agrees to pay all fees as scheduled.</p>
                        <p>Limitation of Liability: The Company’s liability is limited as permitted by law. No indirect or consequential damages.</p>
                        <p>Termination: Either party may terminate with written notice as specified in the Commercial Terms.</p>
                        <p>Governing Law: These Terms are governed by the laws of Malaysia.</p>
                    </div>

                    {/* Commercial Terms & Conditions (narrative) */}
                    <h2 style={{ fontSize: '14px', fontWeight: 700, marginTop: '16px', marginBottom: '8px' }}>Commercial Terms & Conditions</h2>
                    <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
                        <p>Transaction Fees: Percentage applied per transaction and non-refundable. Credit Terms: Invoices due per agreed days; late interest applies. Additional service fees apply only upon request.</p>
                        <p>Confidentiality: All commercial terms are confidential. Payment Processing: Payments must use designated channels.</p>
                        <p>Dispute Resolution: Disputes resolved via arbitration under Malaysian law. SLAs: Service availability and performance per specifications.</p>
                    </div>

                    {/* Approvers */}
                    <h2 style={{ fontSize: '14px', fontWeight: 700, marginTop: '16px', marginBottom: '8px', pageBreakBefore: 'always' as any }}>Approvers</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                            <h3 style={{ fontWeight: 600, marginBottom: '6px' }}>First Approver</h3>
                            <div><strong>Name:</strong> {(formData.contacts?.[0]?.first_name || '') + ' ' + (formData.contacts?.[0]?.last_name || '')}</div>
                            <div><strong>Company Role:</strong> {formData.contacts?.[0]?.company_role || ''}</div>
                            <div><strong>Email:</strong> {formData.contacts?.[0]?.email || ''}</div>
                            <div><strong>Contact:</strong> {(formData.contacts?.[0]?.contact_prefix || '+60') + ' ' + (formData.contacts?.[0]?.contact_number || '')}</div>
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 600, marginBottom: '6px' }}>Second Approver</h3>
                            <div><strong>Name:</strong> {(secondary_approver?.first_name || '') + ' ' + (secondary_approver?.last_name || '')}</div>
                            <div><strong>Company Role:</strong> {secondary_approver?.company_role || ''}</div>
                            <div><strong>Email:</strong> {secondary_approver?.email || ''}</div>
                            <div><strong>Contact:</strong> {(secondary_approver?.contact_prefix || '+60') + ' ' + (secondary_approver?.contact_number || '')}</div>
                        </div>
                    </div>

                    {/* Appendix: Process Timeline */}
                    <h2 style={{ fontSize: '14px', fontWeight: 700, marginTop: '16px', marginBottom: '8px', pageBreakBefore: 'always' as any }}>Appendix: Process Timeline</h2>
                    <div style={{ fontSize: '12px' }}>
                        {(logs || []).map((log, idx) => (
                            <div key={idx} style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ fontWeight: 600 }}>{log.action}</div>
                                    <div style={{ color: '#6B7280' }}>{log.timestamp}</div>
                                </div>
                                <div style={{ whiteSpace: 'pre-line' }}>{log.details}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
              @media print {
                /* Hide everything */
                body * { visibility: hidden !important; }
                /* Show only print root */
                #print-root, #print-root * { visibility: visible !important; }
                #print-root { display: block !important; position: static !important; inset: auto !important; }
                /* Remove link underlines for cleaner output */
                a { text-decoration: none !important; color: inherit !important; }
                /* Page break helpers */
                h2 { break-after: avoid-page; }
                h1 { break-after: avoid-page; }
                /* Margins */
                @page { size: A4; margin: 12mm; }
              }
            `}</style>

            <div className="flex justify-end items-center pt-6 mt-6 space-x-4">
                 {(formMode !== 'approve' && formMode !== 'approve-second') && (
                    <button 
                        type="button"
                        onClick={() => setFormStep(1)}
                        className="text-sm text-gray-700 bg-white px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue"
                    >
                        Back
                    </button>
                 )}
                 <button 
                    type="button"
                    onClick={onCloseForm}
                    className="text-sm text-gray-700 bg-white px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue"
                 >
                    Cancel
                 </button>
                 {formMode !== 'approve' && formMode !== 'approve-second' && !isReadOnly && (
                    <button 
                        type="button"
                        onClick={async () => {
                            setIsSaving(true);
                            try {
                                await onSaveCorporate(formData, 'save');
                            } catch (error) {
                                console.error('Save failed:', error);
                            } finally {
                                setIsSaving(false);
                            }
                        }}
                        disabled={isSaving}
                        className={`text-sm px-4 py-2 rounded-md border ${isSaving ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue`}
                    >
                        {isSaving ? 'Processing...' : 'Save'}
                    </button>
                )}
                 {(formMode === 'approve' || formMode === 'approve-second') && !isReadOnly ? (
                    <>
                        <button 
                            type="button"
                            onClick={() => setIsRejectModalOpen(true)}
                            disabled={isRejecting}
                            className={`text-sm px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                isRejecting
                                    ? 'bg-red-400 text-white cursor-not-allowed' 
                                    : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-700'
                            }`}
                        >
                            {isRejecting ? 'Rejecting...' : 'Reject'}
                        </button>
                        <button 
                            type="button"
                            onClick={async () => {
                                console.log('Submitting form data:', JSON.stringify(formData, null, 2));
                                
                                // Validation checks
                                if (formMode === 'approve-second') {
                                    if (!validateSecondaryApprover()) {
                                        setShowValidationError(true);
                                        return;
                                    }
                                } else if (formMode === 'approve') {
                                    if (!validateFirstApproval()) {
                                        setShowValidationError(true);
                                        return;
                                    }
                                }
                                
                                setShowValidationError(false);
                                setIsApproving(true); // Set loading state
                                
                                try {
                                    await onSaveCorporate(formData, 'submit');
                                } catch (error) {
                                    console.error('Approval failed:', error);
                                } finally {
                                    setIsApproving(false); // Reset loading state
                                }
                            }}
                            disabled={isApproving} // Disable button during loading
                            className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue-dark disabled:bg-ht-gray disabled:cursor-not-allowed"
                        >
                            {isApproving ? 'Validating...' : 'Approve'}
                        </button>
                     </>
                  ) : (
                    <>
                        {(formMode === 'new' || formMode === 'edit') && !isReadOnly && (
                            <button 
                                type="button"
                                onClick={async () => {
                                    console.log('Submitting form data:', JSON.stringify(formData, null, 2));
                                    setIsSendingToApprover(true);
                                    try {
                                        await onSaveCorporate(formData, 'sent');
                                    } catch (error) {
                                        console.error('Failed to send to approver:', error);
                                    } finally {
                                        setIsSendingToApprover(false);
                                    }
                                }}
                                disabled={isSendingToApprover}
                                className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue-dark disabled:bg-ht-gray disabled:cursor-not-allowed"
                            >
                                {isSendingToApprover ? 'Processing...' : 'Send to Approver'}
                            </button>
                        )}
                    </>
                 )}
            </div>

            {/* Terms Modals */}
            <GenericTermsModal
                isOpen={isGenericTermsModalOpen}
                onClose={() => setIsGenericTermsModalOpen(false)}
            />
            
            <CommercialTermsModal
                isOpen={isCommercialTermsModalOpen}
                onClose={() => setIsCommercialTermsModalOpen(false)}
            />
            
            {/* Reject Success Modal */}
            <SuccessModal
                isOpen={isRejectSuccessModalOpen}
                onClose={() => {
                    setIsRejectSuccessModalOpen(false);
                    setIsRejecting(false);
                    onCloseForm();
                }}
                title="Rejection Successful"
                message="The corporate has been successfully rejected."
            />
        </div>
    );
};
export default ECommercialTermsForm;