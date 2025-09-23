"use client";
import React from 'react';
import InputField from '../common/InputField';
import FormSection from '../common/FormSection';

import { CorporateDetails } from '../../types';

interface CommercialTermsFormProps {
    onCloseForm: () => void;
    setFormStep: (step: number) => void;
    formData: CorporateDetails;
    setFormData: (dataUpdater: (prevData: CorporateDetails) => CorporateDetails) => void;
    onSaveCorporate: (formData: CorporateDetails, action: 'submit' | 'sent' | 'save') => void;
}

const CommercialTermsForm: React.FC<CommercialTermsFormProps> = ({ onCloseForm, setFormStep, formData, setFormData, onSaveCorporate }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    return (
        <div className="space-y-6">
            <FormSection title="Commercial Terms">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Agreement Duration</label>
                        <div className="flex items-center space-x-2">
                           <InputField id="agreementFrom" label="" name="agreement_from" value={formData.agreement_from ?? null} onChange={handleChange} type="date" required min={new Date().toISOString().split('T')[0]} />
                           <span className="text-gray-500">to</span>
                           <InputField id="agreementTo" label="" name="agreement_to" value={formData.agreement_to ?? null} onChange={handleChange} type="date" required min={formData.agreement_from || new Date().toISOString().split('T')[0]} />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Credit Limit</label>
                        <div className="flex items-center">
                             <span className="inline-flex items-center px-3 h-[38px] rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">MYR</span>
                            <InputField id="creditLimit" label="" name="credit_limit" value={formData.credit_limit ?? null} onChange={handleChange} required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Credit Terms</label>
                        <div className="flex items-center">
                           <InputField id="creditTerms" label="" name="credit_terms" value={formData.credit_terms ?? null} onChange={handleChange} required />
                           <span className="ml-2 text-gray-500">days from invoice date</span>
                        </div>
                    </div>
                    
                    <InputField id="transactionFee" label="Transaction Fees Rate (% based on total purchased amount)" name="transaction_fee" value={formData.transaction_fee ?? null} onChange={handleChange} required />
                    <InputField id="latePaymentInterest" label="Late Payment Interest (% per 14 days)" name="late_payment_interest" value={formData.late_payment_interest ?? null} onChange={handleChange} required />
                    
                    <InputField id="whiteLabelingFee" label="White Labeling Fee (*only when request) (% based on total purchased amount)" name="white_labeling_fee" value={formData.white_labeling_fee ?? null} onChange={handleChange} required />
                     <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Custom Feature Request Fee (*only when request)</label>
                        <div className="flex items-center">
                             <span className="inline-flex items-center px-3 h-[38px] rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">MYR</span>
                            <InputField id="custom_feature_fee" label="" name="custom_feature_fee" value={formData.custom_feature_fee ?? null} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="md:col-span-2 mt-6 pt-6 border-t">
                        <div className="prose prose-sm max-w-none h-40 overflow-y-auto border p-4 rounded-md text-gray-600 bg-gray-50/50">
                            <h4 className="font-semibold">Commercial Agreement Terms</h4>
                            <p>By proceeding, the Client acknowledges and agrees to the commercial terms specified herein, including but not limited to the agreed-upon fees, credit limits, and payment schedules. These terms form a legally binding part of the service agreement between the Client and HT Voucher Trading Sdn Bhd.</p>
                            <ul>
                                <li><strong>Transaction Fees:</strong> The specified percentage will be applied to the total value of each transaction processed through the platform.</li>
                                <li><strong>Credit Terms:</strong> Invoices are due within the number of days specified from the invoice date. Late payments will incur interest as per the agreed rate.</li>
                                <li><strong>Service Fees:</strong> Additional fees for services like White Labeling or Custom Feature Requests are applicable only upon request and will be billed separately as incurred.</li>
                                <li><strong>Confidentiality:</strong> All commercial terms, including pricing and fee structures, are confidential and shall not be disclosed to any third party without prior written consent from both parties.</li>
                            </ul>
                        </div>
                        <div className="flex items-center mt-4">
                            <input 
                                type="checkbox" 
                                id="agreed_to_commercial_terms" 
                                name="agreed_to_commercial_terms" 
                                checked={formData.agreed_to_commercial_terms as boolean}  
                                onChange={handleChange} 
                                className="h-4 w-4 border-gray-300 rounded focus:ring-ht-gray" 
                            />
                            <label htmlFor="agreed_to_commercial_terms" className="ml-2 block text-sm text-gray-900">
                                I confirm that I have read, understood, and agree to the commercial terms outlined above.
                            </label>
                        </div>
                    </div>
                 </div>
            </FormSection>

            <div className="flex justify-end items-center pt-6 border-t mt-6 space-x-4">
                 <button 
                    type="button"
                    onClick={() => setFormStep(1)}
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
                    onClick={() => {
                        setFormStep(3);
                    }}
                    disabled={!formData.agreed_to_commercial_terms}
                    className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue-dark disabled:bg-ht-gray disabled:cursor-not-allowed"
                >
                    Save and Proceed
                </button>
            </div>
        </div>
    );
};

export default CommercialTermsForm;
