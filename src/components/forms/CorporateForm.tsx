
import React from 'react';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import FormSection from '../common/FormSection';
import { CorporateDetails, Contact, Subsidiary } from '../../types';

interface CorporateFormProps {
    onCloseForm: () => void;
    setFormStep: (step: number) => void;
    formData: CorporateDetails;
    setFormData: (dataUpdater: (prevData: CorporateDetails) => CorporateDetails) => void;
    onSaveCorporate: (formData: CorporateDetails, action: 'submit' | 'sent' | 'save') => void;
    generateClientSideId: () => string;
}

const malaysianStates = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu', 'W.P. Kuala Lumpur', 'W.P. Labuan', 'W.P. Putrajaya'
];

const CorporateForm: React.FC<CorporateFormProps> = ({ onCloseForm, setFormStep, formData, setFormData, onSaveCorporate, generateClientSideId }) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubsidiaryChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData(prev => {
            const newSubsidiaries = prev.subsidiaries.map((sub: Subsidiary, i: number) => 
                i === index ? { ...sub, [name]: value } : sub
            );
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
                    email: '',
                    company_role: '',
                    system_role: '',
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
                    <InputField id="company_name" label="Company Name" name="company_name" value={formData.company_name} onChange={handleChange} required />
                    <InputField id="reg_number" label="Official Registration Number" name="reg_number" value={formData.reg_number} onChange={handleChange} required />
                    <InputField id="office_address1" label="Office Address 1" name="office_address1" value={formData.office_address1} onChange={handleChange} required />
                    <InputField id="office_address2" label="Office Address 2" name="office_address2" value={formData.office_address2 ??  null} onChange={handleChange} />
                    <InputField id="postcode" label="Postcode" name="postcode" value={formData.postcode} onChange={handleChange} required />
                    <InputField id="city" label="City" name="city" value={formData.city} onChange={handleChange} required />
                    <SelectField id="state" label="State" name="state" value={formData.state} onChange={handleChange} required>
                        <option value="">Select State</option>
                        {malaysianStates.map((state: string) => <option key={state} value={state}>{state}</option>)}
                    </SelectField>
                    <SelectField id="country" label="Country" name="country" value={formData.country} onChange={handleChange} required>
                         <option>Malaysia</option>
                         <option>Singapore</option>
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
                                <SelectField id={`sub-state-${sub.id}`} label="State" name="state" value={sub.state} onChange={(e) => handleSubsidiaryChange(index, e)} required>
                                    <option value="">Select State</option>
                                    {malaysianStates.map((state: string) => <option key={state} value={state}>{state}</option>)}
                                </SelectField>
                                <SelectField id={`sub-country-${sub.id}`} label="Country" name="country" value={sub.country} onChange={(e) => handleSubsidiaryChange(index, e)} required>
                                    <option>Malaysia</option>
                                    <option>Singapore</option>
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
                            <InputField id={`contact-first_name-${contact.id}`} label="First Name" name="first_name" value={contact.first_name} onChange={e => handleContactChange(index, e)} required />
                            <InputField id={`contact-last_name-${contact.id}`} label="Last Name" name="last_name" value={contact.last_name} onChange={e => handleContactChange(index, e)} required />
                             <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">*Contact Number</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+60</span>
                                    <input type="text" id={`contact-number-${contact.id}`} name="contact_number" value={contact.contact_number} onChange={e => handleContactChange(index, e)} className="flex-1 block w-full rounded-none rounded-r-md border border-gray-300 p-2 text-sm focus:ring-ht-blue focus:border-ht-blue bg-white dark:bg-white" />
                                </div>
                            </div>
                            <InputField id={`contact-email-${contact.id}`} label="Email Address" name="email" value={contact.email} onChange={e => handleContactChange(index, e)} required type="email" />
                            <SelectField id={`contact-company_role-${contact.id}`} label="Company Role" name="company_role" value={contact.company_role} onChange={e => handleContactChange(index, e)} required>
                                <option>Select Role</option>
                            </SelectField>
                             <SelectField id={`contact-system_role-${contact.id}`} label="System Role" name="system_role" value={contact.system_role} onChange={e => handleContactChange(index, e)} required>
                                <option>Select Role</option>
                            </SelectField>
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
                        <InputField id="billing_address1" label="Office Address 1" name="billing_address1" value={formData.billing_address1 as string} onChange={handleChange} required />
                        <InputField id="billing_address2" label="Office Address 2" name="billing_address2" value={formData.billing_address2 as string} onChange={handleChange} />
                        <InputField id="billing_postcode" label="Postcode" name="billing_postcode" value={formData.billing_postcode as string} onChange={handleChange} required />
                        <InputField id="billing_city" label="City" name="billing_city" value={formData.billing_city as string} onChange={handleChange} required />
                        <InputField id="billing_state" label="State" name="billing_state" value={formData.billing_state as string} onChange={handleChange} required />
                        <InputField id="billing_country" label="Country" name="billing_country" value={formData.billing_country as string} onChange={handleChange} required />
                    </div>
                )}
            </FormSection>
            
            <FormSection title="Tax Information">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <InputField id="company_tin" label="Company TIN" name="company_tin" value={formData.company_tin as string} onChange={handleChange} required />
                    <InputField id="sst_number" label="SST Number" name="sst_number" value={formData.sst_number as string} onChange={handleChange} />
                </div>
            </FormSection>

            <FormSection title="Generic Terms & Conditions">
                <div className="prose prose-sm max-w-none h-48 overflow-y-auto border p-4 rounded-md text-gray-600 bg-gray-50/50">
                    <p className="text-xs">Last Updated: [Insert Date]</p>
                    <p>These Standard Terms and Conditions (&quot;Terms&quot;) govern the relationship between HT Voucher Trading Sdn Bhd (Company No. [Insert], trading as HappieToken, hereinafter referred to as the &quot;Company&quot;) and any party (&quot;Client&quot;) who enters into a commercial arrangement with the Company for the use of its products or services, whether by signing an order form, accepting a quotation, or registering via an online form. These Terms are legally binding and apply to all Clients unless otherwise agreed in writing.</p>
                    <h4 className="font-semibold">1. Definitions</h4>
                    <ul>
                        <li>&quot;Agreement&quot; means the binding contract between the Company and the Client, consisting of these Terms and any applicable Order Form or Commercial Terms Schedule.</li>
                        <li>&quot;Services&quot; means the platform access, features, tools, APIs, or solutions provided by the Company.</li>
                        <li>&quot;Client Data&quot; means any information, material, or content uploaded, submitted, or shared by the Client through the Services.</li>
                        <li>&quot;Effective Date&quot; means the date on which the Client first accepts or is deemed to accept these Terms.</li>
                    </ul>
                    <h4 className="font-semibold">2. Provision of Services</h4>
                    <p>The Company shall provide the Services described in the a relevant Commercial Terms Schedule or online order form. The Company reserves the right to improve, modify, or discontinue any part of the Services with reasonable notice.</p>
                </div>
                 <div className="flex items-center mt-4">
                    <input type="checkbox" id="agreed_to_generic_terms" name="agreed_to_generic_terms" checked={formData.agreed_to_generic_terms as boolean} onChange={handleChange} className="h-4 w-4 border-gray-300 rounded focus:ring-ht-gray" />
                    <label htmlFor="agreed_to_generic_terms" className="ml-2 block text-sm text-gray-900">I have read and agree to the Generic Terms and Conditions.</label>
                </div>
            </FormSection>

            <div className="flex justify-end items-center pt-6 border-t mt-6 space-x-4">
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
                        // In a real app, form data would be validated here.
                        setFormStep(2);
                    }}
                    disabled={!formData.agreed_to_generic_terms}
                    className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue-dark disabled:bg-ht-gray disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default CorporateForm;
