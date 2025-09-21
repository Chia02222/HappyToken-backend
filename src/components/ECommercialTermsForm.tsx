"use client";

import React from 'react';
import DisplayField from './common/DisplayField';
import InputField from './common/InputField';
import SelectField from './common/SelectField';
import ContentSection from './common/ContentSection';
import ErrorMessageModal from './modals/ErrorMessageModal';

import { CorporateDetails, Contact } from '../types';

interface ECommercialTermsFormProps {
    onCloseForm: () => void;
    setFormStep: (step: number) => void;
    formData: CorporateDetails;
    setFormData: (dataUpdater: (prevData: CorporateDetails) => CorporateDetails) => void;
    onSaveCorporate: (formData: CorporateDetails, action: 'submit' | 'sent' | 'save') => void;
    formMode: 'new' | 'edit' | 'approve' | 'approve-second';
}

const ECommercialTermsForm: React.FC<ECommercialTermsFormProps> = ({ onCloseForm, setFormStep, formData, setFormData, onSaveCorporate, formMode }) => {
    const [showValidationError, setShowValidationError] = React.useState(false);
    const [validationErrorMessage, setValidationErrorMessage] = React.useState('');

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
    const secondary_approver = secondaryApproverFromData || {
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
        const { secondary_approver } = formData;
        if (!secondary_approver) {
            setValidationErrorMessage("Secondary approver details are missing.");
            return false;
        }

        if (secondary_approver.use_existing_contact) {
            if (!secondary_approver.selected_contact_id) {
                setValidationErrorMessage("Please select an existing contact for secondary approval.");
                return false;
            }
        } else {
            if (!secondary_approver.salutation ||
                !secondary_approver.first_name ||
                !secondary_approver.last_name ||
                !secondary_approver.company_role ||
                !secondary_approver.system_role ||
                !secondary_approver.email ||
                !secondary_approver.contact_number) {
                setValidationErrorMessage("Please fill in all required fields for secondary approval.");
                return false;
            }
        }
        setValidationErrorMessage(''); // Clear error message if validation passes
        return true;
    };


    return (
        <div className="space-y-6">
            <ErrorMessageModal
                isOpen={showValidationError}
                onClose={() => setShowValidationError(false)}
                message={validationErrorMessage}
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
                            <DisplayField label="Company Name" value={formData.company_name} />
                            <DisplayField label="Official Registration Number" value={formData.reg_number} />
                            <DisplayField label="Office Address" value={`${formData.office_address1}${formData.office_address2 ? `, ${formData.office_address2}` : ''}`} />
                            <DisplayField label="Postcode" value={formData.postcode} />
                            <DisplayField label="City" value={formData.city} />
                            <DisplayField label="State" value={formData.state} />
                            <DisplayField label="Country" value={formData.country} />
                            <DisplayField label="Website" value={formData.website} />
                            <DisplayField label="Account Note" value={formData.account_note} />
                        </div>
                        <div className="space-y-4">
                            <DisplayField label="Agreement Duration" value={formData.agreement_from && formData.agreement_to ? `${formData.agreement_from} to ${formData.agreement_to}` : ''} />
                            <DisplayField label="Credit Limit" value={`MYR ${formData.credit_limit}`} />
                            <DisplayField label="Credit Terms" value={`${formData.credit_terms} days`} />
                            <DisplayField label="Transaction Fees Rate" value={`${formData.transaction_fee}%`} />
                            <DisplayField label="Late Payment Interest" value={`${formData.late_payment_interest}%`} />
                            <DisplayField label="White Labeling Fee (*only when request)" value={formData.white_labeling_fee ? `${formData.white_labeling_fee}%` : 'N/A'} />
                            <DisplayField label="Custom Feature Request Fee (*only when request)" value={`MYR ${formData.custom_feature_fee}`} />
                        </div>
                    </div>
                </ContentSection>
                
                <ContentSection title="First Approval">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <DisplayField label="Company Name" value={formData.company_name} />
                        <DisplayField label="Registration Number" value={formData.reg_number} />
                        <DisplayField label="Signatory Name" value={`${primaryContact.first_name || ''} ${primaryContact.last_name || ''}`.trim()} />
                        <DisplayField label="Company Role" value={primaryContact.company_role} />
                        <DisplayField label="System Role" value={primaryContact.system_role} />
                        <DisplayField label="Email Address" value={primaryContact.email} />
                        <DisplayField label="Contact Number" value={primaryContact.contact_number ? `+60 ${primaryContact.contact_number}` : ''} />
                    </div>
                    <div className="flex items-start mt-6">
                        <input type="checkbox" id="first_approval_confirmation" name="first_approval_confirmation" checked={formData.first_approval_confirmation ?? false} onChange={handleChange} className="h-4 w-4 mt-0.5 border-gray-300 rounded focus:ring-ht-gray" />
                        <label htmlFor="first_approval_confirmation" className="ml-3 block text-xs text-gray-800">
                            I hereby confirm that I have read, understood, and agree to the terms and conditions of this Agreement, and I consent to proceed accordingly.
                        </label>
                    </div>
                </ContentSection>
                
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
                                    required
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
                                    required
                                >
                                    <option value="Mr">Mr</option>
                                    <option value="Mrs">Mrs</option>
                                    <option value="Ms">Ms</option>
                                </SelectField>
                                <div className="md:col-span-1"></div>
                                <InputField id="first_name" label="First Name" name="first_name" value={secondary_approver.first_name ?? null} onChange={handleSecondaryApproverChange} required />
                                <InputField id="last_name" label="Last Name" name="last_name" value={secondary_approver.last_name ?? null} onChange={handleSecondaryApproverChange} required />
                                <InputField id="company_role" label="Company Role" name="company_role" value={secondary_approver.company_role ?? null} onChange={handleSecondaryApproverChange} required />

                                <InputField id="email" label="Email Address" name="email" type="email" value={secondary_approver.email ?? null} onChange={handleSecondaryApproverChange} required />
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
                        <input type="checkbox" id="second_approval_confirmation" name="second_approval_confirmation" checked={formData.second_approval_confirmation ?? false} onChange={handleChange} className="h-4 w-4 mt-0.5 border-gray-300 rounded focus:ring-ht-gray" />
                        <label htmlFor="second_approval_confirmation" className="ml-3 block text-xs text-gray-800">
                            I hereby confirm that I have read, understood, and agree to the terms and conditions of this Agreement, and I consent to proceed accordingly.
                        </label>
                    </div>
                </ContentSection>
            </div>

            <div className="flex justify-end items-center pt-6 border-t mt-6 space-x-4">
                 <button 
                    type="button"
                    onClick={() => setFormStep(2)}
                    className="text-sm text-gray-700 bg-white px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue"
                 >
                    Back
                 </button>
                 <button 
                    type="button"
                    onClick={onCloseForm}
                    className="text-sm text-gray-700 bg-white px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue"
                 >
                    Cancel
                 </button>
                 <button 
                    type="button"
                    onClick={() => onSaveCorporate(formData, 'save')}
                    className="text-sm text-gray-700 bg-white px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue"
                 >
                    Save
                 </button>
                 <button 
                    type="button"
                    onClick={() => onSaveCorporate(formData, 'sent')}
                    disabled={(formMode === 'approve' && !formData.first_approval_confirmation) || (formMode === 'approve-second' && !formData.second_approval_confirmation)}
                    className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue-dark disabled:bg-ht-gray disabled:cursor-not-allowed"
                >
                    Send Link
                </button>
                 <button 
                    type="button"
                    onClick={() => {
                        console.log('Submitting form data:', JSON.stringify(formData, null, 2));
                        if (formMode === 'approve-second') {
                            if (!validateSecondaryApprover()) {
                                setShowValidationError(true);
                                return;
                            }
                        }
                        setShowValidationError(false);
                        onSaveCorporate(formData, 'submit');
                    }}
                    disabled={(formMode === 'approve' && !formData.first_approval_confirmation) || (formMode === 'approve-second' && !formData.second_approval_confirmation)}
                    className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue-dark disabled:bg-ht-gray disabled:cursor-not-allowed"
                >
                    Submit
                </button>
            </div>
        </div>
    );
};
export default ECommercialTermsForm;