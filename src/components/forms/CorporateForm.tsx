
import React, { useState } from 'react';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import FormSection from '../common/FormSection';
import SearchableCallingCodeField from '../common/SearchableCallingCodeField';
import { CorporateDetails, Contact, Subsidiary } from '../../types';
import { corporateFormSchema } from '../../utils/corporateFormSchema';
import { getMalaysiaDateString } from '../../utils/validators';
import { countries, getStatesWithNA, getStateFieldLabel, getUniqueCallingCodes } from '../../data/countries';
import { logError } from '../../utils/logger';
import { errorHandler } from '../../utils/errorHandler';

interface CorporateFormProps {
    onCloseForm: () => void;
    setFormStep: (step: number) => void;
    formData: CorporateDetails;
    setFormData: (dataUpdater: (prevData: CorporateDetails) => CorporateDetails) => void;
    onSaveCorporate: (formData: CorporateDetails, action: 'submit' | 'sent' | 'save') => void;
    generateClientSideId: () => string;
    onValidationError?: (message: string) => void;
    formMode: 'new' | 'edit' | 'approve' | 'approve-second';
}


const CorporateForm: React.FC<CorporateFormProps> = ({ onCloseForm, setFormStep, formData, setFormData, onSaveCorporate, generateClientSideId, onValidationError, formMode = 'new'}) => {

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSaving, setIsSaving] = useState(false);
	const [isValidatingNext, setIsValidatingNext] = useState(false);

	const scrollToField = (fieldId: string) => {
		try {
			document.getElementById(fieldId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		} catch {}
	};

    const primaryId = formData.contacts?.[0]?.id || '0';

    const getCallingCodeForCountry = (countryName: string): string => {
        const country = countries.find(c => c.name === countryName);
        return country ? country.callingCode : '+60'; // Default to Malaysia's calling code
    };

	const runZodValidation = (): boolean => {
	    const dataForValidation = formMode === 'edit'
	        ? {
	            ...formData,
	            first_approval_confirmation: true,
	            second_approval_confirmation: true,
	            agreed_to_generic_terms: true,
	            agreed_to_commercial_terms: true,
	          }
	        : formData;
	    const res = corporateFormSchema.safeParse(dataForValidation as unknown);
		if (res.success) {
			setErrors({});
			return true;
		}
		const issue = res.error.issues[0];
		const p = issue.path.join('.');
		let id = String(issue.path[0]);
		if (p === 'agreement_from') id = 'agreementFrom';
		else if (p === 'agreement_to') id = 'agreementTo';
		else if (p === 'credit_limit') id = 'creditLimit';
		else if (p === 'credit_terms') id = 'creditTerms';
		else if (p === 'transaction_fee') id = 'transactionFee';
		else if (p === 'late_payment_interest') id = 'latePaymentInterest';
		else if (p === 'white_labeling_fee') id = 'whiteLabelingFee';
		else if (p === 'custom_feature_fee') id = 'custom_feature_fee';
		else if (p.startsWith('contacts.0.first_name')) id = `contact-first_name-${primaryId}`;
		else if (p.startsWith('contacts.0.last_name')) id = `contact-last_name-${primaryId}`;
		else if (p.startsWith('contacts.0.contact_number')) id = `contact-number-${primaryId}`;
		else if (p.startsWith('contacts.0.email')) id = `contact-email-${primaryId}`;

        setErrors({ [id]: issue.message });
        scrollToField(id);
		onValidationError?.('Please complete the required fields.');
		return false;
	};

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => {
                const newData = { ...prev, [name]: value };
                if (name === 'country') {
                    newData.state = '';
                    const callingCode = getCallingCodeForCountry(value);
                    newData.contacts = newData.contacts.map(contact => ({
                        ...contact,
                        contact_prefix: callingCode
                    }));
                } else if (name === 'billing_country') {
                    newData.billing_state = '';
                }
                return newData;
            });
        }
    };
    
    const handleSubsidiaryChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData(prev => {
            const newSubsidiaries = prev.subsidiaries.map((sub: Subsidiary, i: number) => {
                if (i === index) {
                    const updatedSub = { ...sub, [name]: value };
                    if (name === 'country') {
                        updatedSub.state = '';
                    }
                    return updatedSub;
                }
                return sub;
            });
            return { ...prev, subsidiaries: newSubsidiaries };
        });
    };

    const addSubsidiary = () => {
        setFormData(prev => ({
            ...prev,
            subsidiaries: [
                ...prev.subsidiaries,
                {
                    id: generateClientSideId(),
                    company_name: '',
                    reg_number: '',
                    office_address1: '',
                    office_address2: '',
                    postcode: '',
                    city: '',
                    state: '',
                    country: 'Malaysia',
                    website: '',
                    account_note: '',
                },
            ],
        }));
    };

    const removeSubsidiary = (index: number) => {
        setFormData(prev => {
            const subsidiaryToRemove = prev.subsidiaries[index];
            const newSubsidiaries = prev.subsidiaries.filter((_: Subsidiary, i: number) => i !== index);
            const newSubsidiaryIdsToDelete = subsidiaryToRemove.id ? [...(prev.subsidiaryIdsToDelete || []), subsidiaryToRemove.id] : prev.subsidiaryIdsToDelete;
            return { ...prev, subsidiaries: newSubsidiaries, subsidiaryIdsToDelete: newSubsidiaryIdsToDelete };
        });
    };

    const handleContactChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData(prev => {
            const newContacts = prev.contacts.map((contact: Contact, i: number) =>
                i === index ? { ...contact, [name]: value } : contact
            );
            return { ...prev, contacts: newContacts };
        });
    };

    const addContact = () => {
        setFormData(prev => ({
            ...prev,
            contacts: [
                ...prev.contacts,
                {
                    id: generateClientSideId(),
                    salutation: 'Mr',
                    first_name: '',
                    last_name: '',
                    contact_number: '',
                    contact_prefix: getCallingCodeForCountry(prev.country),
                    email: '',
                    company_role: '',
                    system_role: 'user',
                },
            ],
        }));
    };

    const removeContact = (index: number) => {
        if (formData.contacts.length > 1) {
             setFormData(prev => {
                const contactToRemove = prev.contacts[index];
                const newContacts = prev.contacts.filter((_: Contact, i: number) => i !== index);
                const newContactIdsToDelete = contactToRemove.id ? [...(prev.contactIdsToDelete || []), contactToRemove.id] : prev.contactIdsToDelete;
                return { ...prev, contacts: newContacts, contactIdsToDelete: newContactIdsToDelete };
            });
        }
    };
    
    return (
        <div className="space-y-6">
            <FormSection title="Company Information & Official Address">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <InputField id="company_name" label="Company Name" name="company_name" value={formData.company_name} onChange={handleChange} required error={errors.company_name} />
                    <InputField id="reg_number" label="Official Registration Number" name="reg_number" value={formData.reg_number} onChange={handleChange} required error={errors.reg_number} />
                    <InputField id="office_address1" label="Office Address 1" name="office_address1" value={formData.office_address1} onChange={handleChange} required error={errors.office_address1} />
                    <InputField id="office_address2" label="Office Address 2" name="office_address2" value={formData.office_address2 ??  null} onChange={handleChange} />
                    <InputField id="postcode" label="Postcode" name="postcode" value={formData.postcode} onChange={handleChange} required error={errors.postcode} />
                    <InputField id="city" label="City" name="city" value={formData.city} onChange={handleChange} required error={errors.city} />
                    <SelectField id="country" label="Country" name="country" value={formData.country} onChange={handleChange} required>
                        <option value="">Select Country</option>
                        {countries.map((country) => <option key={country.name} value={country.name}>{country.name}</option>)}
                    </SelectField>
                <SelectField id="state" label={getStateFieldLabel(formData.country)} name="state" value={formData.state} onChange={handleChange} required>
                    <option value="">Select {getStateFieldLabel(formData.country)}</option>
                    {getStatesWithNA(formData.country).map((state: string) => <option key={state} value={state}>{state}</option>)}
                </SelectField>
                    <div className="md:col-span-2">
                        <InputField id="website" label="Website" name="website" value={formData.website as string} onChange={handleChange} />
                    </div>
                    <div className="md:col-span-2">
                         <label htmlFor="account_note" className="block text-xs font-medium text-gray-700 mb-1">Account Note</label>
                        <textarea id="account_note" name="account_note" value={formData.account_note as string} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-ht-blue focus:border-ht-blue bg-white dark:bg-white"></textarea>
                    </div>
                </div>
                <div className="md:col-span-2 mt-6 pt-6 border-t">
                    <h3 className="text-sm font-semibold text-ht-gray-dark mb-4">Subsidiaries</h3>
                    {formData.subsidiaries.map((sub: Subsidiary, index: number) => (
                        <div key={sub.id} className="mb-6 p-4 border rounded-lg bg-gray-50/50">
                            <div className="flex justify-between items-center mb-4 pb-3 border-b">
                                <h4 className="font-semibold text-gray-800">Subsidiary {index + 1}</h4>
                                <button type="button" onClick={() => removeSubsidiary(index)} className="text-sm text-red-600 hover:text-red-800 font-semibold">Remove</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <InputField id={`sub-company_name-${sub.id}`} label="Company Name" name="company_name" value={sub.company_name} onChange={(e) => handleSubsidiaryChange(index, e)} required />
                                <InputField id={`sub-reg_number-${sub.id}`} label="Official Registration Number" name="reg_number" value={sub.reg_number} onChange={(e) => handleSubsidiaryChange(index, e)} required />
                                <InputField id={`sub-office_address1-${sub.id}`} label="Office Address 1" name="office_address1" value={sub.office_address1} onChange={(e) => handleSubsidiaryChange(index, e)} required />
                                <InputField id={`sub-office_address2-${sub.id}`} label="Office Address 2" name="office_address2" value={sub.office_address2 ?? null} onChange={(e) => handleSubsidiaryChange(index, e)} />
                                <InputField id={`sub-postcode-${sub.id}`} label="Postcode" name="postcode" value={sub.postcode} onChange={(e) => handleSubsidiaryChange(index, e)} required />
                                <InputField id={`sub-city-${sub.id}`} label="City" name="city" value={sub.city} onChange={(e) => handleSubsidiaryChange(index, e)} required />
                                <SelectField id={`sub-country-${sub.id}`} label="Country" name="country" value={sub.country} onChange={(e) => handleSubsidiaryChange(index, e)} required>
                                    <option value="">Select Country</option>
                                    {countries.map((country) => <option key={country.name} value={country.name}>{country.name}</option>)}
                                </SelectField>
                                <SelectField id={`sub-state-${sub.id}`} label={getStateFieldLabel(sub.country)} name="state" value={sub.state} onChange={(e) => handleSubsidiaryChange(index, e)} required>
                                    <option value="">Select {getStateFieldLabel(sub.country)}</option>
                                    {getStatesWithNA(sub.country).map((state: string) => <option key={state} value={state}>{state}</option>)}
                                </SelectField>
                                <div className="md:col-span-2">
                                    <InputField id={`sub-website-${sub.id}`} label="Website" name="website" value={sub.website ?? null} onChange={(e) => handleSubsidiaryChange(index, e)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor={`sub-account_note-${sub.id}`} className="block text-xs font-medium text-gray-700 mb-1">Account Note</label>
                                    <textarea id={`sub-account_note-${sub.id}`} name="account_note" value={sub.account_note} onChange={(e) => handleSubsidiaryChange(index, e)} rows={3} className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-ht-blue focus:border-ht-blue bg-white dark:bg-white"></textarea>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="mt-2">
                        <button type="button" onClick={addSubsidiary} className="text-sm text-ht-blue hover:text-ht-blue-dark font-semibold">
                            + Add Subsidiary
                        </button>
                    </div>
                </div>
            </FormSection>

            <FormSection title="Contact Person">
                 {formData.contacts.map((contact: Contact, index: number) => (
                    <div key={contact.id} className={index > 0 ? "mt-6 pt-6 border-t" : ""}>
                        {formData.contacts.length > 1 && (
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-medium text-gray-800">Contact Person {index + 1}</h3>
                                <button type="button" onClick={() => removeContact(index)} className="text-sm text-red-600 hover:text-red-800">Remove</button>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <SelectField id={`contact-salutation-${contact.id}`} label="Salutation" name="salutation" value={contact.salutation} onChange={e => handleContactChange(index, e)}>
                                <option>Mr</option>
                                <option>Mrs</option>
                                <option>Ms</option>
                            </SelectField>
                            <div></div>
                            <InputField id={`contact-first_name-${contact.id}`} label="First Name" name="first_name" value={contact.first_name} onChange={e => handleContactChange(index, e)} required error={errors[`contact-first_name-${contact.id}`]} />
                            <InputField id={`contact-last_name-${contact.id}`} label="Last Name" name="last_name" value={contact.last_name} onChange={e => handleContactChange(index, e)} required error={errors[`contact-last_name-${contact.id}`]} />
                             <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">*Contact Number</label>
                                <div className="flex">
                                    <SearchableCallingCodeField
                                        value={contact.contact_prefix || '+60'}
                                        onChange={(value) => handleContactChange(index, { target: { name: 'contact_prefix', value } } as React.ChangeEvent<HTMLSelectElement>)}
                                        id={`contact-prefix-${contact.id}`}
                                    />
                                    <input type="text" id={`contact-number-${contact.id}`} name="contact_number" value={contact.contact_number} onChange={e => handleContactChange(index, e)} className={`flex-1 block w-full rounded-none rounded-r-md border p-2 text-sm focus:ring-ht-blue bg-white dark:bg-white ${errors[`contact-number-${contact.id}`] ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-ht-blue'}`} />
                                </div>
                                {errors[`contact-number-${contact.id}`] && <p className="mt-1 text-xs text-red-600">{errors[`contact-number-${contact.id}`]}</p>}
                            </div>
                            <InputField id={`contact-email-${contact.id}`} label="Email Address" name="email" value={contact.email} onChange={e => handleContactChange(index, e)} required type="email" error={errors[`contact-email-${contact.id}`]} />
                            <InputField id={`contact-company_role-${contact.id}`} label="Company Role" name="company_role" value={contact.company_role} onChange={e => handleContactChange(index, e)} required />
                            <InputField id={`contact-system_role-${contact.id}`} label="System Role" name="system_role" value={contact.system_role || 'user'} onChange={e => handleContactChange(index, e)} required disabled={(contact.system_role || 'user') === 'user'} />
                        </div>
                    </div>
                ))}
                <div className="mt-6">
                    <button type="button" onClick={addContact} className="text-sm text-ht-blue hover:text-ht-blue-dark font-semibold">
                        + Create another person
                    </button>
                </div>
            </FormSection>
            
            <FormSection title="Billing Address">
                <div className="flex items-center mb-6">
                    <input type="checkbox" id="billing_same_as_official" name="billing_same_as_official" checked={formData.billing_same_as_official as boolean} onChange={handleChange} className="h-4 w-4 border-gray-300 rounded focus:ring-ht-gray" />
                    <label htmlFor="billing_same_as_official" className="ml-2 block text-sm text-gray-900">Same as Official Address</label>
                </div>
                {!(formData.billing_same_as_official as boolean) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <InputField id="billing_address1" label="Office Address 1" name="billing_address1" value={formData.billing_address1 as string} onChange={handleChange} required error={errors.billing_address1} />
                        <InputField id="billing_address2" label="Office Address 2" name="billing_address2" value={formData.billing_address2 as string} onChange={handleChange} />
                        <InputField id="billing_postcode" label="Postcode" name="billing_postcode" value={formData.billing_postcode as string} onChange={handleChange} required error={errors.billing_postcode} />
                        <InputField id="billing_city" label="City" name="billing_city" value={formData.billing_city as string} onChange={handleChange} required error={errors.billing_city} />
                        <SelectField id="billing_country" label="Country" name="billing_country" value={formData.billing_country as string} onChange={handleChange} required error={errors.billing_country}>
                            <option value="">Select Country</option>
                            {countries.map((country) => <option key={country.name} value={country.name}>{country.name}</option>)}
                        </SelectField>
                        <SelectField id="billing_state" label={getStateFieldLabel(formData.billing_country as string)} name="billing_state" value={formData.billing_state as string} onChange={handleChange} required error={errors.billing_state}>
                            <option value="">Select {getStateFieldLabel(formData.billing_country as string)}</option>
                            {getStatesWithNA(formData.billing_country as string).map((state: string) => <option key={state} value={state}>{state}</option>)}
                        </SelectField>
                    </div>
                )}
            </FormSection>
            
            <FormSection title="Tax Information">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <InputField id="company_tin" label="Company TIN" name="company_tin" value={formData.company_tin as string} onChange={handleChange} required error={errors.company_tin} />
                    <InputField id="sst_number" label="SST Number" name="sst_number" value={formData.sst_number as string} onChange={handleChange} />
                </div>
            </FormSection>

            <FormSection title="Commercial Terms">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Agreement Duration</label>
                        <div className="flex items-center space-x-2">
                           <InputField id="agreementFrom" label="" name="agreement_from" value={formData.agreement_from ? formData.agreement_from.split('T')[0] : ''} onChange={(e) => handleChange({ target: { name: 'agreement_from', value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)} type="date" min={getMalaysiaDateString()} error={errors.agreementFrom} />
                           <span className="text-gray-500">to</span>
                           <InputField id="agreementTo" label="" name="agreement_to" value={formData.agreement_to ? formData.agreement_to.split('T')[0] : ''} onChange={(e) => handleChange({ target: { name: 'agreement_to', value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)} type="date" min={(formData.agreement_from ? formData.agreement_from.split('T')[0] : getMalaysiaDateString())} error={errors.agreementTo} />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Credit Limit</label>
                        <div className="flex items-center">
                             <span className="inline-flex items-center px-3 h-[38px] rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">MYR</span>
                            <InputField id="creditLimit" label="" name="credit_limit" value={formData.credit_limit ?? null} onChange={handleChange} error={errors.creditLimit} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Credit Terms</label>
                        <div className="flex items-center">
                           <InputField id="creditTerms" label="" name="credit_terms" value={formData.credit_terms ?? null} onChange={handleChange} error={errors.creditTerms} />
                           <span className="ml-2 text-gray-500">days from invoice date</span>
                        </div>
                    </div>
                    
                    <InputField id="transactionFee" label="Transaction Fees Rate (% based on total purchased amount)" name="transaction_fee" value={formData.transaction_fee ?? null} onChange={handleChange} error={errors.transactionFee} />
                    <InputField id="latePaymentInterest" label="Late Payment Interest (% per 14 days)" name="late_payment_interest" value={formData.late_payment_interest ?? null} onChange={handleChange} error={errors.latePaymentInterest} />
                    
                    <InputField id="whiteLabelingFee" label="White Labeling Fee (*only when request) (% based on total purchased amount)" name="white_labeling_fee" value={formData.white_labeling_fee ?? null} onChange={handleChange} error={errors.whiteLabelingFee} />
                     <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Custom Feature Request Fee (*only when request)</label>
                        <div className="flex items-center">
                             <span className="inline-flex items-center px-3 h-[38px] rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">MYR</span>
                            <InputField id="custom_feature_fee" label="" name="custom_feature_fee" value={formData.custom_feature_fee ?? null} onChange={handleChange} error={errors.custom_feature_fee} />
                        </div>
                </div>
                </div>
            </FormSection>

            <div className="flex justify-end items-center pt-6 mt-6 space-x-4">
                 <button 
                    type="button"
                    onClick={onCloseForm}
                    className="text-sm text-gray-700 bg-white px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue"
                 >
                    Cancel
                 </button>
                <button 
                    type="button"
                    onClick={async () => {
                        if (formMode !== 'edit' && !runZodValidation()) return;
                        try {
                            setIsSaving(true);
                            await onSaveCorporate(formData, 'save');
                        } catch (error) {
                            const errorMessage = errorHandler.handleApiError(error as Error, { component: 'CorporateForm', action: 'save' });
                            logError('Save failed', { error: errorMessage }, 'CorporateForm');
                        } finally {
                            setIsSaving(false);
                        }
                    }}
                    disabled={isSaving || isValidatingNext}
                    className={`text-sm px-4 py-2 rounded-md border ${isSaving || isValidatingNext ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue`}
                 >
                    {isSaving ? 'Processing...' : 'Save'}
                 </button>
                 <button 
                    type="button"
                    onClick={async () => {
                        setIsValidatingNext(true);
                        try {
                            if (formMode !== 'edit' && !runZodValidation()) return;
                            setFormStep(2);
                        } finally {
                            setIsValidatingNext(false);
                        }
                    }}
                    disabled={isSaving || isValidatingNext}
                    className={`text-sm px-4 py-2 rounded-md ${isSaving || isValidatingNext ? 'bg-ht-gray text-white cursor-not-allowed' : 'bg-ht-blue text-white hover:bg-ht-blue-dark'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue`}
                >
                    {isValidatingNext ? 'Validating…' : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default CorporateForm;
