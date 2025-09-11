"use client";

import React from 'react';
import DisplayField from './common/DisplayField';
import InputField from './common/InputField';
import SelectField from './common/SelectField';
import ContentSection from './common/ContentSection';

interface ECommercialTermsFormProps {
    onCloseForm: () => void;
    setFormStep: (step: number) => void;
    formData: Record<string, any>;
    setFormData: (dataUpdater: (prevData: Record<string, any>) => Record<string, any>) => void;
    onSaveCorporate: (formData: Record<string, any>, action: 'submit' | 'send' | 'save') => void;
}

const ECommercialTermsForm: React.FC<ECommercialTermsFormProps> = ({ onCloseForm, setFormStep, formData, setFormData, onSaveCorporate }) => {
    
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
        setFormData(prev => ({
            ...prev,
            secondaryApprover: {
                ...prev.secondaryApprover,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };
    
    const handleSecondaryContactSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const contactId = e.target.value;
        const selectedContact = formData.contacts.find((c: any) => c.id.toString() === contactId);
        
        setFormData(prev => ({
            ...prev,
            secondaryApprover: {
                ...prev.secondaryApprover,
                selectedContactId: contactId,
                signatoryName: selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}`.trim() : '',
                companyRole: selectedContact ? selectedContact.companyRole : '',
                systemRole: selectedContact ? selectedContact.systemRole : '',
                email: selectedContact ? selectedContact.email : '',
                contactNumber: selectedContact ? selectedContact.contactNumber : '',
            }
        }));
    };
    
    const { secondaryApprover } = formData;
    const isSecondaryFromList = secondaryApprover.useExistingContact;

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm max-w-5xl mx-auto border border-gray-200">
                <h1 className="text-center text-xl font-bold text-ht-gray-dark mb-4">e-Commercial Agreement</h1>

                <p className="text-xs text-gray-600 mb-6 p-4 bg-gray-50 border rounded-md">
                    Thank you. Your commercial agreement submission has been received. <br />
                    This confirms that <strong>{formData.companyName || '[Client Company Name]'} [Company No: {formData.regNumber || 'XXXXXXXX-X'}]</strong>, represented by <strong>{`${primaryContact.firstName || ''} ${primaryContact.lastName || '[Full Name of Signatory]'}`.trim()}</strong>, has successfully entered into a commercial agreement with: <br />
                    <strong>HT Voucher Trading Sdn Bhd (Company No: 202401035271 (1581118A))</strong> <br />
                    Trading As: HappieToken
                </p>

                <ContentSection title="Commercial Terms">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="space-y-4">
                            <DisplayField label="Company Name" value={formData.companyName} />
                            <DisplayField label="Official Registration Number" value={formData.regNumber} />
                            <DisplayField label="Office Address" value={`${formData.officeAddress1}${formData.officeAddress2 ? `, ${formData.officeAddress2}` : ''}`} />
                            <DisplayField label="Postcode" value={formData.postcode} />
                            <DisplayField label="City" value={formData.city} />
                            <DisplayField label="State" value={formData.state} />
                            <DisplayField label="Country" value={formData.country} />
                            <DisplayField label="Website" value={formData.website} />
                            <DisplayField label="Account Note" value={formData.accountNote} />
                        </div>
                        <div className="space-y-4">
                            <DisplayField label="Agreement Duration" value={formData.agreementFrom && formData.agreementTo ? `${formData.agreementFrom} to ${formData.agreementTo}` : ''} />
                            <DisplayField label="Credit Limit" value={`MYR ${formData.creditLimit}`} />
                            <DisplayField label="Credit Terms" value={`${formData.creditTerms} days`} />
                            <DisplayField label="Transaction Fees Rate" value={`${formData.transactionFee}%`} />
                            <DisplayField label="Late Payment Interest" value={`${formData.latePaymentInterest}%`} />
                            <DisplayField label="White Labeling Fee (*only when request)" value={formData.whiteLabelingFee ? `${formData.whiteLabelingFee}%` : 'N/A'} />
                            <DisplayField label="Custom Feature Request Fee (*only when request)" value={`MYR ${formData.customFeatureFee}`} />
                        </div>
                    </div>
                </ContentSection>
                
                <ContentSection title="First Approval">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <DisplayField label="Company Name" value={formData.companyName} />
                        <DisplayField label="Registration Number" value={formData.regNumber} />
                        <DisplayField label="Signatory Name" value={`${primaryContact.firstName || ''} ${primaryContact.lastName || ''}`.trim()} />
                        <DisplayField label="Company Role" value={primaryContact.companyRole} />
                        <DisplayField label="System Role" value={primaryContact.systemRole} />
                        <DisplayField label="Email Address" value={primaryContact.email} />
                        <DisplayField label="Contact Number" value={primaryContact.contactNumber ? `+60 ${primaryContact.contactNumber}` : ''} />
                    </div>
                    <div className="flex items-start mt-6">
                        <input type="checkbox" id="firstApprovalConfirmation" name="firstApprovalConfirmation" checked={formData.firstApprovalConfirmation} onChange={handleChange} className="h-4 w-4 mt-0.5 border-gray-300 rounded focus:ring-ht-gray" />
                        <label htmlFor="firstApprovalConfirmation" className="ml-3 block text-xs text-gray-800">
                            I hereby confirm that I have read, understood, and agree to the terms and conditions of this Agreement, and I consent to proceed accordingly.
                        </label>
                    </div>
                </ContentSection>
                
                <ContentSection title="Secondary Approval">
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            id="useExistingContact"
                            name="useExistingContact"
                            checked={secondaryApprover.useExistingContact}
                            onChange={handleSecondaryApproverChange}
                            className="h-4 w-4 border-gray-300 rounded focus:ring-ht-gray"
                        />
                        <label htmlFor="useExistingContact" className="ml-2 block text-sm text-gray-900">
                            Use existing contact person for secondary approval
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {isSecondaryFromList ? (
                            <>
                                <SelectField
                                    id="secondaryContactSelect"
                                    label="Select Contact Person"
                                    name="selectedContactId"
                                    value={secondaryApprover.selectedContactId}
                                    onChange={handleSecondaryContactSelect}
                                    required
                                >
                                    <option value="">Select a contact</option>
                                    {otherContacts.map((contact: any) => (
                                        <option key={contact.id} value={contact.id}>
                                            {`${contact.firstName} ${contact.lastName}`}
                                        </option>
                                    ))}
                                </SelectField>
                                <DisplayField label="Signatory Name" value={secondaryApprover.signatoryName} />
                                <DisplayField label="Company Role" value={secondaryApprover.companyRole} />
                                <DisplayField label="System Role" value={secondaryApprover.systemRole} />
                                <DisplayField label="Email Address" value={secondaryApprover.email} />
                                <DisplayField label="Contact Number" value={secondaryApprover.contactNumber ? `+60 ${secondaryApprover.contactNumber}` : ''} />
                            </>
                        ) : (
                            <>
                                <InputField id="signatoryName" label="Signatory Name" name="signatoryName" value={secondaryApprover.signatoryName} onChange={handleSecondaryApproverChange} required />
                                <InputField id="companyRole" label="Company Role" name="companyRole" value={secondaryApprover.companyRole} onChange={handleSecondaryApproverChange} required />
                                <InputField id="systemRole" label="System Role" name="systemRole" value={secondaryApprover.systemRole} onChange={handleSecondaryApproverChange} required />
                                <InputField id="email" label="Email Address" name="email" type="email" value={secondaryApprover.email} onChange={handleSecondaryApproverChange} required />
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">*Contact Number</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+60</span>
                                        <input
                                            type="text"
                                            id="contactNumber"
                                            name="contactNumber"
                                            value={secondaryApprover.contactNumber}
                                            onChange={handleSecondaryApproverChange}
                                            className="flex-1 block w-full rounded-none rounded-r-md border border-gray-300 p-2 text-sm focus:ring-ht-blue focus:border-ht-blue bg-white dark:bg-white"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
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
                    onClick={() => onSaveCorporate(formData, 'send')}
                    disabled={!formData.firstApprovalConfirmation}
                    className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue-dark disabled:bg-ht-gray disabled:cursor-not-allowed"
                >
                    Send Link
                </button>
                 <button 
                    type="button"
                    onClick={() => {
                        onSaveCorporate(formData, 'submit');
                    }}
                    disabled={!formData.firstApprovalConfirmation}
                    className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue-dark disabled:bg-ht-gray disabled:cursor-not-allowed"
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default ECommercialTermsForm;
