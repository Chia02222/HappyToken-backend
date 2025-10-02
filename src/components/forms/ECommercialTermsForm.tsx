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
import {  getUniqueCallingCodes } from '../../data/countries';

// Timestamp Log Data Structures
interface LogEntry {
    timestamp: string;
    action: string;
    details: string;
    status: 'completed' | 'pending' | 'rejected' | 'draft';
    amendmentId?: string; // Add this field for direct ID matching
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
    const [amendmentRequests, setAmendmentRequests] = React.useState<Array<{
        id: string;
        timestamp: string;
        created_at: string;
        to_status: string;
    }>>([]);

    const handlePrint = () => {
        try {
            if (formData?.id && formData.id !== 'new') {
                const url = `/corporate/${formData.id}/pdf`;
                window.open(url, '_blank', 'noopener,noreferrer');
                return;
            }
            const originalTitle = document.title;
            const safeName = (formData.company_name || 'Corporate').replace(/[/\\:*?"<>|]/g, '-');
            document.title = `${safeName} - Happie Token`;
            window.print();
            setTimeout(() => { document.title = originalTitle; }, 0);
        } catch (e) {
            console.error('Print failed:', e);
        }
    };

    // Map timeline entry to specific amendment request ID
    const getAmendmentIdForTimelineEntry = (timelineEntry: LogEntry): string | null => {
        if (timelineEntry.action !== 'Amendment Requested') return null;
        
        // Use the amendment ID directly from the timeline entry if available
        if (timelineEntry.amendmentId) {
            return timelineEntry.amendmentId;
        }
        
        // Fallback to timestamp matching if amendment ID is not available
        const matchingAmendment = amendmentRequests.find(amendment => {
            // Match by timestamp (within 1 minute tolerance)
            const timelineTime = new Date(timelineEntry.timestamp).getTime();
            const amendmentTime = new Date(amendment.timestamp).getTime();
            const timeDiff = Math.abs(timelineTime - amendmentTime);
            return timeDiff < 60000; // 1 minute tolerance
        });
        
        return matchingAmendment?.id || null;
    };

    // Get amendment number for display (1st, 2nd, 3rd, etc.)
    const getAmendmentNumber = (timelineEntry: LogEntry): number => {
        if (timelineEntry.action !== 'Amendment Requested') return 0;
        
        // Count how many amendment requests occurred before this one
        const timelineTime = new Date(timelineEntry.timestamp).getTime();
        const earlierAmendments = amendmentRequests.filter(amendment => {
            const amendmentTime = new Date(amendment.timestamp).getTime();
            return amendmentTime < timelineTime;
        });
        
        return earlierAmendments.length + 1;
    };

    // Form read-only logic - make form read-only in edit mode, cooling period, or approved/rejected status
    const isCoolingPeriod = formData.status === 'Cooling Period';
    const isApprovedOrRejected = formData.status === 'Approved' || formData.status === 'Rejected';
    const isEditMode = formMode === 'edit';
    const isReadOnly = isCoolingPeriod || isApprovedOrRejected;
    
    // Disable approve/reject buttons when status is Amendment Requested and mode is approve/approve-second
    const isAmendmentRequested = formData.status === 'Amendment Requested';
    const isApproveMode = formMode === 'approve' || formMode === 'approve-second';
    const shouldDisableApproveReject = isAmendmentRequested && isApproveMode;
    
    // For approve-second mode, fields should be editable but without borders
    const isApproveSecondMode = formMode === 'approve-second';
    const isPendingSecondApproval = formData.status === 'Pending 2nd Approval';
    const shouldHideApproveRejectButtons = isPendingSecondApproval && formMode === 'approve';
    
    // Logic to determine when to show display-only fields
    const shouldShowDisplayOnly = isCoolingPeriod || isApprovedOrRejected;

    const primaryContact = formData.contacts?.[0] || {};
    const otherContacts = formData.contacts?.slice(1) || [];

    // Fetch all amendment requests for this corporate
    React.useEffect(() => {
        const fetchAllAmendments = async () => {
            try {
                if (!formData?.id) return;
                const list = await getAmendmentRequestsByCorporate(String(formData.id));
                const arr = Array.isArray(list) ? list : [];
                const withData = arr.filter((x: any) => {
                    const data = (x && (x.amendment_data || x.amendmentData || null));
                    if (!data || typeof data !== 'object') return false;
                    return Object.keys(data).length > 0;
                });
                
                // Store all amendment requests with their metadata
                const amendmentData = withData.map((x: any) => ({
                    id: String(x.id),
                    timestamp: x.timestamp || x.created_at,
                    created_at: x.created_at,
                    to_status: x.to_status
                })).sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
                
                setAmendmentRequests(amendmentData);
            } catch {
                setAmendmentRequests([]);
            }
        };
        fetchAllAmendments();
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

    // Check if secondary approver data exists and has meaningful content
    const hasSecondaryApproverData = React.useMemo(() => {
        const sa = secondary_approver;
        return sa && (
            (sa.first_name && sa.first_name.trim()) ||
            (sa.last_name && sa.last_name.trim()) ||
            (sa.email && sa.email.trim() && sa.email !== 'N/A') ||
            (sa.company_role && sa.company_role.trim()) ||
            (sa.contact_number && sa.contact_number.trim())
        );
    }, [secondary_approver]);

    // For approve-second mode, if secondary approver data exists, show it in display-only mode
    const shouldShowSecondaryAsDisplayOnly = (formMode === 'approve-second' && hasSecondaryApproverData) || 
                                           shouldShowDisplayOnly || 
                                           formData.status === 'Pending 2nd Approval';
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
            effectiveDate: formData.agreement_from ? String(formData.agreement_from) : 'TBD',
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

                

                // Extract submitter information from log note
                const getSubmitterInfo = (note: string): string => {
                    if (!note) return '';
                    
                    // If the note already contains "Submitted by:", return empty to avoid duplication
                    if (/Submitted by:/i.test(note)) {
                        return '';
                    }
                    
                    // Only extract if not already present
                    const submitterMatch = note.match(/Submitted by:\s*([^<\n,]+)/i);
                    return submitterMatch ? `Submitted by: ${submitterMatch[1].trim()}` : '';
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
                        status: 'completed'
                    });
                } else if (
                    (log.note && /amendment\s+declined\s+by\s+crt\s+team/i.test(log.note)) ||
                    (log.from_status === 'Amendment Requested' && (log.to_status === 'Pending 1st Approval' || log.to_status === 'Pending 2nd Approval') && log.note && /declined/i.test(log.note))
                ) {
                    const target = log.to_status;
                    const notified = target === 'Pending 2nd Approval' ? 'Second Approver' : 'First Approver';
                    
                    // Extract reason from the note
                    const reasonMatch = log.note.match(/Reason:\s*([^)]+)/i);
                    const reason = reasonMatch ? reasonMatch[1].trim() : 'No reason provided';
                    
                    const details = [
                        `Reverted to: ${target}`,
                        `Reason: ${reason}`,
                        `Notified: ${notified}`,
                        `Submitted by: CRT Team`,
                    ].filter(Boolean).join('\n');
                    
                    logs.push({
                        timestamp: formatDateTime(new Date(log.timestamp)),
                        action: 'Amendment Declined',
                        details,
                        status: 'rejected'
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
                } else if (log.to_status === 'Pending 2nd Approval' || (log.note && log.note.toLowerCase().includes('first approval'))) {
                    // Only show Submitted by for First Approval Granted
                    const submitterInfo = getSubmitterInfo(log.note || '');
                    const base = (log.note || 'First approval completed');
                    const details = base + (submitterInfo ? '\n' + submitterInfo : '');
                    logs.push({
                        timestamp: formatDateTime(new Date(log.timestamp)),
                        action: 'First Approval Granted',
                        details,
                        status: 'completed'
                    });
                } else if (log.to_status === 'Cooling Period' || (log.note && log.note.toLowerCase().includes('second approval'))) {
                    // For Second Approval Granted, show Submitted by instead of Approved by
                    const submitterInfo = getSubmitterInfo(log.note || '');
                    const base = (log.note || 'Second approval completed');
                    const details = base + (submitterInfo ? '\n' + submitterInfo : '');
                    logs.push({
                        timestamp: formatDateTime(new Date(log.timestamp)),
                        action: 'Second Approval Granted',
                        details,
                        status: 'completed'
                    });
                } else if (log.to_status === 'Amendment Requested') {
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
                    const submittedLine = name ? `submitted by: ${name}${role ? ` (${role})` : ''}` : '';
                    const details = submittedLine;

                    logs.push({
                        timestamp: formatDateTime(new Date(log.timestamp)),
                        action: 'Amendment Requested',
                        details,
                        status: 'pending',
                        amendmentId: (log as any).uuid || (log as any).id // Include the amendment ID directly
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

        if (formMode === 'approve-second' && formData.first_approval_confirmation && !formData.second_approval_confirmation) {
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
                details: 'Account created successfully.\nConfirmation email sent with attached full-form PDF.',
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
                            <DisplayField label="Agreement Duration" value={formData.agreement_from && formData.agreement_to ? `${formData.agreement_from.split('T')[0]} to ${formData.agreement_to.split('T')[0]}` : ''} borderless />
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
                
                {((formMode === 'approve' && formData.first_approval_confirmation) || formMode === 'approve-second' || (formMode === 'edit' && (formData.status === 'Pending 2nd Approval' || formData.status === 'Cooling Period' || formData.status === 'Approved')) || formData.status === 'Cooling Period' || formData.status === 'Approved') && (
                    <ContentSection title="Secondary Approval">
                        {!shouldShowSecondaryAsDisplayOnly && formData.status !== 'Pending 2nd Approval' && (
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
                            {shouldShowSecondaryAsDisplayOnly ? (
                                // Display-only mode: show all fields as DisplayFields (same as First Approval section)
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
                                    <InputField id="first_name" label="First Name" name="first_name" value={secondary_approver.first_name ?? null} onChange={handleSecondaryApproverChange} required={formMode === 'approve' || formMode === 'approve-second'} disabled={isReadOnly} borderless={isApproveSecondMode} />
                                    <InputField id="last_name" label="Last Name" name="last_name" value={secondary_approver.last_name ?? null} onChange={handleSecondaryApproverChange} required={formMode === 'approve' || formMode === 'approve-second'} disabled={isReadOnly} borderless={isApproveSecondMode} />
                                    <InputField id="company_role" label="Company Role" name="company_role" value={secondary_approver.company_role ?? null} onChange={handleSecondaryApproverChange} required={formMode === 'approve' || formMode === 'approve-second'} disabled={isReadOnly} borderless={isApproveSecondMode} />

                                    <InputField id="email" label="Email Address" name="email" type="email" value={secondary_approver.email ?? null} onChange={handleSecondaryApproverChange} required={formMode === 'approve' || formMode === 'approve-second'} disabled={isReadOnly} borderless={isApproveSecondMode} />
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">*Contact Number</label>
                                        <div className="flex">
                                            <select 
                                                className={`inline-flex items-center px-3 rounded-l-md ${isReadOnly || isApproveSecondMode ? 'border-0' : 'border border-r-0 border-gray-300'} text-gray-500 text-sm focus:ring-ht-blue focus:border-ht-blue ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
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
                                                className={`flex-1 block w-full rounded-none rounded-r-md ${isReadOnly || isApproveSecondMode ? 'border-0' : 'border border-gray-300'} p-2 text-sm focus:ring-ht-blue focus:border-ht-blue ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white dark:bg-white'}`}
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
                                                    {log.action === 'Amendment Requested' && getAmendmentIdForTimelineEntry(log) && (
                                                      <button
                                                        type="button"
                                                        onClick={() => router.push(`/amendment/view/${getAmendmentIdForTimelineEntry(log)}`)}
                                                        className="ml-2 inline-flex items-center text-xs text-ht-blue hover:text-ht-blue-dark"
                                                      >
                                                        View #{getAmendmentNumber(log)}
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
                {(formMode === 'approve' || formMode === 'approve-second') && !isReadOnly && !shouldHideApproveRejectButtons ? (
                    <>
                        <button 
                            type="button"
                            onClick={() => setIsRejectModalOpen(true)}
                            disabled={isRejecting || shouldDisableApproveReject}
                            className={`text-sm px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                isRejecting || shouldDisableApproveReject
                                    ? 'bg-red-400 text-white cursor-not-allowed' 
                                    : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-700'
                            }`}
                        >
                            {isRejecting ? 'Rejecting...' : 'Reject'}
                        </button>
                        <button 
                            type="button"
                            onClick={async () => {
                                
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
                                    // Refresh the page after successful approval
                                    window.location.reload();
                                } catch (error) {
                                    console.error('Approval failed:', error);
                                } finally {
                                    setIsApproving(false); // Reset loading state
                                }
                            }}
                            disabled={isApproving || shouldDisableApproveReject} // Disable button during loading or when amendment requested
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
                                    setIsSendingToApprover(true);
                                    try {
                                        // Attempt to save corporate and send email to approver
                                        // This will throw an error if email sending fails, preventing redirection
                                        await onSaveCorporate(formData, 'sent');
                                        // Only redirect if successful (handled in onSaveCorporate)
                                    } catch (error) {
                                        console.error('Failed to send to approver:', error);
                                        // Show error modal to user instead of redirecting
                                        // This prevents unwanted redirections when email sending fails
                                        const errorMessage = error instanceof Error ? error.message : 'Failed to send to approver. Please try again.';
                                        setValidationErrorMessage(errorMessage);
                                        setShowValidationError(true);
                                        // Note: No throw error here - error is handled by showing modal
                                    } finally {
                                        // Always reset loading state
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
                    // Refresh the page instead of redirecting
                    window.location.reload();
                }}
                title="Rejection Successful"
                message="The corporate has been successfully rejected."
            />
        </div>
    );
};
export default ECommercialTermsForm;