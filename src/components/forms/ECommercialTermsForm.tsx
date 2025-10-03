"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { useRouter } from 'next/navigation';
import DisplayField from '../common/DisplayField';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import ContentSection from '../common/ContentSection';
import ApprovalModals from './modals/ApprovalModals';
import TermsModals from './modals/TermsModals';
import AgreementDetailsCard from './timeline/AgreementDetailsCard';
import ProcessTimeline from './timeline/ProcessTimeline';
import CommercialTermsSection from './sections/CommercialTermsSection';
import TermsConditionsSection from './sections/TermsConditionsSection';
import FirstApprovalSection from './sections/FirstApprovalSection';
import SecondaryApprovalSection from './sections/SecondaryApprovalSection';

import { CorporateDetails, Contact, CorporateStatus } from '../../types';
import { getAmendmentRequestsByCorporate } from '../../services/api';
import {  getUniqueCallingCodes } from '../../data/countries';
import { logError, logInfo } from '../../utils/logger';
import { errorHandler } from '../../utils/errorHandler';

interface LogEntry {
    timestamp: string;
    action: string;
    details: string;
    status: 'completed' | 'pending' | 'rejected' | 'draft';
    amendmentId?: string;
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
            const errorMessage = errorHandler.handleApiError(e as Error, { component: 'ECommercialTermsForm', action: 'print' });
            logError('Print failed', { error: errorMessage }, 'ECommercialTermsForm');
        }
    };

    const getAmendmentIdForTimelineEntry = (timelineEntry: LogEntry): string | null => {
        if (timelineEntry.action !== 'Amendment Requested') return null;
        
        if (timelineEntry.amendmentId) {
            return timelineEntry.amendmentId;
        }
        
        const matchingAmendment = amendmentRequests.find(amendment => {
            const timelineTime = new Date(timelineEntry.timestamp).getTime();
            const amendmentTime = new Date(amendment.timestamp).getTime();
            const timeDiff = Math.abs(timelineTime - amendmentTime);
            return timeDiff < 60000;
        });
        
        return matchingAmendment?.id || null;
    };

    const getAmendmentNumber = (timelineEntry: LogEntry): number => {
        if (timelineEntry.action !== 'Amendment Requested') return 0;
        
        const timelineTime = new Date(timelineEntry.timestamp).getTime();
        const earlierAmendments = amendmentRequests.filter(amendment => {
            const amendmentTime = new Date(amendment.timestamp).getTime();
            return amendmentTime < timelineTime;
        });
        
        return earlierAmendments.length + 1;
    };

    const isCoolingPeriod = formData.status === 'Cooling Period';
    const isApprovedOrRejected = formData.status === 'Approved' || formData.status === 'Rejected';
    const isEditMode = formMode === 'edit';
    const isReadOnly = isCoolingPeriod || isApprovedOrRejected;
    
    const isAmendmentRequested = formData.status === 'Amendment Requested';
    const isApproveMode = formMode === 'approve' || formMode === 'approve-second';
    const shouldDisableApproveReject = isAmendmentRequested && isApproveMode;
    
    const isApproveSecondMode = formMode === 'approve-second';
    const isPendingSecondApproval = formData.status === 'Pending 2nd Approval';
    const shouldHideApproveRejectButtons = isPendingSecondApproval && formMode === 'approve';
    
    const shouldShowDisplayOnly = isCoolingPeriod || isApprovedOrRejected;

    const primaryContact = formData.contacts?.[0] || {};
    const otherContacts = formData.contacts?.slice(1) || [];

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

    const shouldShowSecondaryAsDisplayOnly = (formMode === 'approve-second' && hasSecondaryApproverData) || 
                                           shouldShowDisplayOnly || 
                                           formData.status === 'Pending 2nd Approval';
    const validateSecondaryApprover = (): boolean => {
        if (!(formMode === 'approve' || formMode === 'approve-second')) {
            return true;
        }
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
            return false;
        }
        setValidationErrorMessage('');
        return true;
    };

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

    const getDigitalSignatureStatus = (): string => {
        if (formData.second_approval_confirmation) return 'Fully Executed';
        if (formData.first_approval_confirmation) return 'Pending 2nd Approval';
        if (formData.status === 'Pending 1st Approval') return 'Pending 1st Approval';
        return 'Draft';
    };

    const generateTimestampLog = (): TimestampLogData => {
        const logs: LogEntry[] = [];
        const now = new Date();

        const agreementDetails: AgreementDetails = {
            title: "Commercial Services Agreement",
            executionDate: formatDateTime(now),
            effectiveDate: formData.agreement_from ? String(formData.agreement_from) : 'TBD',
            referenceId: (formData.id ? `HT-${String(formData.id)}` : (formData.created_at ? `HT-${new Date(formData.created_at as string).getTime()}` : 'HT-PENDING')),
            digitalSignatureStatus: getDigitalSignatureStatus()
        };

        if (formData.created_at) {
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
                            submitterInfo = ` Submitted by: ${name} (${role})`;
                        } else {
                            submitterInfo = ` Submitted by: ${name}`;
                        }
                    }
                }
            }
            
            if (!submitterInfo) {
                submitterInfo = 'Submitted by: CRT Team';
            }
            
            logs.push({
                timestamp: formatDateTime(new Date(formData.created_at)),
                action: 'Agreement Created',
                details: 'Initial draft prepared and submitted for review',
                status: 'completed'
            });
        }

        if (formData.investigation_log) {
            const sortedLogs = [...formData.investigation_log].sort((a, b) => 
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

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

                

                const getSubmitterInfo = (note: string): string => {
                    if (!note) return '';
                    
                    if (/Submitted by:/i.test(note)) {
                        return '';
                    }
                    
                    const submitterMatch = note.match(/Submitted by:\s*([^<\n,]+)/i);
                    return submitterMatch ? `Submitted by: ${submitterMatch[1].trim()}` : '';
                };

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
                    const note = log.note || '';
                    let reason = '';
                    let reviewer = '';
                    const isPreferred = /rejected\s+by/i.test(note);
                    
                    const reviewNotesMatch = note.match(/Review\s*Notes:\s*([^|\n]+)/i);
                    if (reviewNotesMatch) {
                        reason = reviewNotesMatch[1].trim();
                    }
                    const reviewedByMatch = note.match(/Reviewed\s*by:\s*([^|\n]+)/i);
                    if (reviewedByMatch) {
                        reviewer = reviewedByMatch[1].trim();
                    }
                    
                    if (!reason) {
                        const crtTeamMatch = note.match(/amendment\s+declined\s+by\s+crt\s+team\s*\(reason:\s*([^)]+)\)/i);
                        if (crtTeamMatch) reason = crtTeamMatch[1].trim();
                    }
                    
                    
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
                    const submitterInfo = getSubmitterInfo(log.note || '');
                    const base = (log.note || 'Registration link sent to 1st approver');
                    const details = base + (submitterInfo ? '\n' + submitterInfo : '');
                    logs.push({
                        timestamp: formatDateTime(new Date(log.timestamp)),
                        action: 'Registration Link Sent',
                        details,
                        status: 'completed'
                    });
                } else if (log.to_status === 'Pending 2nd Approval' && log.note && log.note.toLowerCase().includes('registration link sent to 2nd approver')) {
                    const submitterInfo = getSubmitterInfo(log.note || '');
                    const base = (log.note || 'Registration link sent to 2nd approver');
                    const details = base + (submitterInfo ? '\n' + submitterInfo : '');
                    logs.push({
                        timestamp: formatDateTime(new Date(log.timestamp)),
                        action: 'Registration Link Sent',
                        details,
                        status: 'completed'
                    });
                } else if (log.to_status === 'Pending 2nd Approval' || (log.note && log.note.toLowerCase().includes('first approval'))) {
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

        if (formMode === 'approve' && formData.status !== 'Rejected' && !formData.first_approval_confirmation) {
            logs.push({
                timestamp: 'Pending',
                action: 'First Approval Required',
                details: 'Awaiting first approver confirmation',
                status: 'pending'
            });
        }

        if (formMode === 'approve-second' && formData.status !== 'Rejected' && formData.first_approval_confirmation && !formData.second_approval_confirmation) {
            logs.push({
                timestamp: 'Pending',
                action: 'Second Approval Required',
                details: 'Awaiting secondary approver confirmation',
                status: 'pending'
            });
        }

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
            
            <ApprovalModals
                showValidationError={showValidationError}
                setShowValidationError={setShowValidationError}
                validationErrorMessage={validationErrorMessage}
                isRejectModalOpen={isRejectModalOpen}
                setIsRejectModalOpen={setIsRejectModalOpen}
                formData={formData}
                updateStatus={updateStatus}
                isRejecting={isRejecting}
                setIsRejecting={setIsRejecting}
                isRejectSuccessModalOpen={isRejectSuccessModalOpen}
                setIsRejectSuccessModalOpen={setIsRejectSuccessModalOpen}
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

                <CommercialTermsSection
                    formData={formData}
                    isTermsConditionsExpanded={isTermsConditionsExpanded}
                    setIsTermsConditionsExpanded={setIsTermsConditionsExpanded}
                />

                <TermsConditionsSection
                    isTermsConditionsExpanded={isTermsConditionsExpanded}
                    setIsGenericTermsModalOpen={setIsGenericTermsModalOpen}
                    setIsCommercialTermsModalOpen={setIsCommercialTermsModalOpen}
                />
                
                <FirstApprovalSection
                    formData={formData}
                    primaryContact={primaryContact}
                    formMode={formMode}
                    isCoolingPeriod={isCoolingPeriod}
                    handleChange={handleChange}
                />
                
                <SecondaryApprovalSection
                    formData={formData}
                    formMode={formMode}
                    isCoolingPeriod={isCoolingPeriod}
                    isReadOnly={isReadOnly}
                    isApproveSecondMode={isApproveSecondMode}
                    shouldShowSecondaryAsDisplayOnly={Boolean(shouldShowSecondaryAsDisplayOnly)}
                    shouldShowDisplayOnly={shouldShowDisplayOnly}
                    secondary_approver={secondary_approver}
                    otherContacts={otherContacts}
                    isSecondaryFromList={Boolean(isSecondaryFromList)}
                    handleChange={handleChange}
                    handleSecondaryApproverChange={handleSecondaryApproverChange}
                    handleSecondaryContactSelect={handleSecondaryContactSelect}
                />

                {/* Agreement Details and Process Log */}
                <ContentSection title="Agreement Details & Process Log">
                    <div className="space-y-6">
                        <AgreementDetailsCard agreementDetails={agreementDetails} />
                        <ProcessTimeline
                            logs={logs}
                            isTimelineOpen={isTimelineOpen}
                            setIsTimelineOpen={setIsTimelineOpen}
                            getAmendmentIdForTimelineEntry={getAmendmentIdForTimelineEntry}
                            getAmendmentNumber={getAmendmentNumber}
                        />
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
                                const errorMessage = errorHandler.handleApiError(error as Error, { component: 'ECommercialTermsForm', action: 'save' });
                                logError('Save failed', { error: errorMessage }, 'ECommercialTermsForm');
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
                                    window.location.reload();
                                } catch (error) {
                                    const errorMessage = errorHandler.handleApiError(error as Error, { component: 'ECommercialTermsForm', action: 'approval' });
                                    logError('Approval failed', { error: errorMessage }, 'ECommercialTermsForm');
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
                                        await onSaveCorporate(formData, 'sent');
                                    } catch (error) {
                                        const errorMessage = errorHandler.handleApiError(error as Error, { component: 'ECommercialTermsForm', action: 'sendToApprover' });
                                        logError('Failed to send to approver', { error: errorMessage }, 'ECommercialTermsForm');
                                        const userErrorMessage = error instanceof Error ? error.message : 'Failed to send to approver. Please try again.';
                                        setValidationErrorMessage(userErrorMessage);
                                        setShowValidationError(true);
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

            <TermsModals
                isGenericTermsModalOpen={isGenericTermsModalOpen}
                setIsGenericTermsModalOpen={setIsGenericTermsModalOpen}
                isCommercialTermsModalOpen={isCommercialTermsModalOpen}
                setIsCommercialTermsModalOpen={setIsCommercialTermsModalOpen}
            />
        </div>
    );
};
export default ECommercialTermsForm;