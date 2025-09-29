"use client";

import React from 'react';
import DisplayField from '../common/DisplayField';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import ContentSection from '../common/ContentSection';
import ErrorMessageModal from '../modals/ErrorMessageModal';
import ChangeStatusModal from '../modals/ChangeStatusModal';
import GenericTermsModal from '../modals/GenericTermsModal';
import CommercialTermsModal from '../modals/CommercialTermsModal';

import { CorporateDetails, Contact, CorporateStatus } from '../../types';

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

    const primaryContact = formData.contacts?.[0] || {};
    const otherContacts = formData.contacts?.slice(1) || [];

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
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
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
            effectiveDate: formData.agreement_from || 'TBD',
            referenceId: (formData.id ? `HT-${String(formData.id)}` : (formData.created_at ? `HT-${new Date(formData.created_at as string).getTime()}` : 'HT-PENDING')),
            digitalSignatureStatus: getDigitalSignatureStatus()
        };

        // Process logs based on current status
        if (formData.created_at) {
            logs.push({
                timestamp: formatDateTime(new Date(formData.created_at)),
                action: 'Agreement Created',
                details: 'Initial draft prepared and submitted for review',
                status: 'completed'
            });
        }

        if (formData.status === 'Pending 1st Approval' || formData.status === 'Approved' || formData.status === 'Rejected') {
            logs.push({
                timestamp: formatDateTime(new Date(formData.updated_at || now)),
                action: 'Sent for Approval',
                details: 'Agreement submitted to first approver for review',
                status: 'completed'
            });
        }

        if (formData.first_approval_confirmation) {
            logs.push({
                timestamp: formatDateTime(new Date(formData.updated_at || now)),
                action: 'First Approval Granted',
                details: `Approved by ${primaryContact.first_name} ${primaryContact.last_name}`,
                status: 'completed'
            });
        }

        if (formData.second_approval_confirmation) {
            logs.push({
                timestamp: formatDateTime(new Date(formData.updated_at || now)),
                action: 'Second Approval Granted',
                details: `Approved by ${secondary_approver.first_name} ${secondary_approver.last_name}`,
                status: 'completed'
            });
        }

        if (formData.status === 'Rejected') {
            logs.push({
                timestamp: formatDateTime(new Date(formData.updated_at || now)),
                action: 'Agreement Rejected',
                details: 'Agreement rejected and returned for amendments',
                status: 'rejected'
            });
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

        return { agreementDetails, logs };
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
                    await updateStatus(corporateId, status, note);
                    onCloseForm();
                }}
                isRejecting={true}
            />
            <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm max-w-5xl mx-auto border border-gray-200">
                <h1 className="text-center text-xl font-bold text-ht-gray-dark mb-4">e-Commercial Agreement</h1>

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
                            <DisplayField label="Agreement Duration" value={formData.agreement_from && formData.agreement_to ? `${formData.agreement_from} to ${formData.agreement_to}` : ''} borderless />
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
                        <DisplayField label="Contact Number" value={primaryContact.contact_number ? `+60 ${primaryContact.contact_number}` : ''} borderless />
                    </div>
                    <div className="flex items-start mt-6">
                        <input 
                            type="checkbox" 
                            id="first_approval_confirmation" 
                            name="first_approval_confirmation" 
                            checked={formData.first_approval_confirmation ?? false} 
                            onChange={handleChange} 
                            disabled={formMode === 'new' || formMode === 'edit'}
                            className={`h-4 w-4 mt-0.5 border-gray-300 rounded focus:ring-ht-gray ${(formMode === 'new' || formMode === 'edit') ? 'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100' : ''}`} 
                        />
                        <label htmlFor="first_approval_confirmation" className={`ml-3 block text-xs ${(formMode === 'new' || formMode === 'edit') ? 'text-gray-500' : 'text-gray-800'}`}>
                            I hereby confirm that I have read, understood, and agree to the <span className="underline font-bold">Generic Terms and Conditions</span> and <span className="underline font-bold">Commercial Terms and Conditions</span>, and I consent to proceed accordingly.
                        </label>
                    </div>
                </ContentSection>
                
                {/* Secondary Approval Section - Show only when mode is 'approve' and first approval is confirmed */}
                {(formMode === 'approve' && formData.first_approval_confirmation) && (
                    <ContentSection title="Secondary Approval">
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                id="use_existing_contact"
                                name="use_existing_contact"
                                checked={!!secondary_approver.use_existing_contact}
                                onChange={handleSecondaryApproverChange}
                                className="h-4 w-4 border-gray-300 rounded focus:ring-ht-gray"
                            />
                            <label htmlFor="use_existing_contact" className="ml-2 block text-sm text-gray-900">
                                Use existing contact person for secondary approval
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {isSecondaryFromList ? (
                                <>
                                    <SelectField
                                        id="secondaryContactSelect"
                                        label="Select Contact Person"
                                        name="selected_contact_id"
                                        value={secondary_approver.selected_contact_id ?? null}
                                        onChange={handleSecondaryContactSelect}
                                        required={formMode === 'approve' || formMode === 'approve-second'}
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
                                    <DisplayField label="Contact Number" value={secondary_approver.contact_number ? `+60 ${secondary_approver.contact_number}` : ''} />
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
                                    >
                                        <option value="Mr">Mr</option>
                                        <option value="Mrs">Mrs</option>
                                        <option value="Ms">Ms</option>
                                    </SelectField>
                                    <div className="md:col-span-1"></div>
                                    <InputField id="first_name" label="First Name" name="first_name" value={secondary_approver.first_name ?? null} onChange={handleSecondaryApproverChange} required={formMode === 'approve' || formMode === 'approve-second'} />
                                    <InputField id="last_name" label="Last Name" name="last_name" value={secondary_approver.last_name ?? null} onChange={handleSecondaryApproverChange} required={formMode === 'approve' || formMode === 'approve-second'} />
                                    <InputField id="company_role" label="Company Role" name="company_role" value={secondary_approver.company_role ?? null} onChange={handleSecondaryApproverChange} required={formMode === 'approve' || formMode === 'approve-second'} />

                                    <InputField id="email" label="Email Address" name="email" type="email" value={secondary_approver.email ?? null} onChange={handleSecondaryApproverChange} required={formMode === 'approve' || formMode === 'approve-second'} />
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">*Contact Number</label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+60</span>
                                            <input
                                                type="text"
                                                id="contact_number"
                                                name="contact_number"
                                                value={secondary_approver.contact_number ?? ''}
                                                onChange={handleSecondaryApproverChange}
                                                className="flex-1 block w-full rounded-none rounded-r-md border border-gray-300 p-2 text-sm focus:ring-ht-blue focus:border-ht-blue bg-white dark:bg-white"
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
                                disabled={formMode === 'approve'}
                                className="h-4 w-4 mt-0.5 border-gray-300 rounded focus:ring-ht-gray disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100" 
                            />
                            <label htmlFor="second_approval_confirmation" className={`ml-3 block text-xs ${formMode === 'approve' ? 'text-gray-500' : 'text-gray-800'}`}>
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
                                                  <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                                  <p className="text-xs text-gray-500">{log.timestamp}</p>
                                              </div>
                                              <p className="text-sm text-gray-600 mt-1">{log.details}</p>
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
                 {formMode !== 'approve' && formMode !== 'approve-second' && (
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
                 {(formMode === 'approve' || formMode === 'approve-second') && formData.status !== 'Rejected' ? (
                    <>
                        <button 
                            type="button"
                            onClick={() => setIsRejectModalOpen(true)}
                            className="text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700"
                        >
                            Reject
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
                        {(formMode === 'new' || formMode === 'edit') && (
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
        </div>
    );
};
export default ECommercialTermsForm;