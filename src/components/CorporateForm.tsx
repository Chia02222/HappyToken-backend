
import React from 'react';
import InputField from './common/InputField';
import SelectField from './common/SelectField';
import FormSection from './common/FormSection';

interface Subsidiary {
    id: number;
    companyName: string;
    regNumber: string;
    officeAddress1: string;
    officeAddress2: string;
    postcode: string;
    city: string;
    state: string;
    country: string;
    website: string;
    accountNote: string;
}

interface Contact {
    id: number;
    salutation: string;
    firstName: string;
    lastName: string;
    contactNumber: string;
    email: string;
    companyRole: string;
    systemRole: string;
}

interface SecondaryApprover {
    useExistingContact: boolean;
    selectedContactId: string;
    signatoryName: string;
    companyRole: string;
    systemRole: string;
    email: string;
    contactNumber: string;
}

interface CorporateFormData {
    companyName: string;
    regNumber: string;
    officeAddress1: string;
    officeAddress2: string;
    postcode: string;
    city: string;
    state: string;
    country: string;
    website: string;
    accountNote: string;
    subsidiaries: Subsidiary[];
    contacts: Contact[];
    billingSameAsOfficial: boolean;
    billingAddress1: string;
    billingAddress2: string;
    billingPostcode: string;
    billingCity: string;
    billingState: string;
    billingCountry: string;
    companyTIN: string;
    sstNumber: string;
    agreementFrom: string;
    agreementTo: string;
    creditLimit: string;
    creditTerms: string;
    transactionFee: string;
    latePaymentInterest: string;
    whiteLabelingFee: string;
    customFeatureFee: string;
    agreedToGenericTerms: boolean;
    agreedToCommercialTerms: boolean;
    firstApprovalConfirmation: boolean;
    secondaryApprover: SecondaryApprover;
    [key: string]: any;
}

interface CorporateFormProps {
    onCloseForm: () => void;
    setFormStep: (step: number) => void;
    formData: CorporateFormData;
    setFormData: (dataUpdater: (prevData: CorporateFormData) => CorporateFormData) => void;
    onSaveCorporate: (formData: CorporateFormData, action: 'submit' | 'send' | 'save') => void;
}

const malaysianStates = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu', 'W.P. Kuala Lumpur', 'W.P. Labuan', 'W.P. Putrajaya'
];

const CorporateForm: React.FC<CorporateFormProps> = ({ onCloseForm, setFormStep, formData, setFormData, onSaveCorporate }) => {

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
                    id: Date.now(),
                    companyName: '',
                    regNumber: '',
                    officeAddress1: '',
                    officeAddress2: '',
                    postcode: '',
                    city: '',
                    state: '',
                    country: 'Malaysia',
                    website: '',
                    accountNote: '',
                },
            ],
        }));
    };

    const removeSubsidiary = (index: number) => {
        setFormData(prev => {
            const newSubsidiaries = prev.subsidiaries.filter((_: Subsidiary, i: number) => i !== index);
            return { ...prev, subsidiaries: newSubsidiaries };
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
                    id: Date.now(),
                    salutation: 'Mr',
                    firstName: '',
                    lastName: '',
                    contactNumber: '',
                    email: '',
                    companyRole: '',
                    systemRole: '',
                },
            ],
        }));
    };

    const removeContact = (index: number) => {
        if (formData.contacts.length > 1) {
             setFormData(prev => {
                const newContacts = prev.contacts.filter((_: Contact, i: number) => i !== index);
                return { ...prev, contacts: newContacts };
            });
        }
    };
    
    return (
        <div className="space-y-6">
            <FormSection title="Company Information & Official Address">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <InputField id="companyName" label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} required />
                    <InputField id="regNumber" label="Official Registration Number" name="regNumber" value={formData.regNumber} onChange={handleChange} required />
                    <InputField id="officeAddress1" label="Office Address 1" name="officeAddress1" value={formData.officeAddress1} onChange={handleChange} required />
                    <InputField id="officeAddress2" label="Office Address 2" name="officeAddress2" value={formData.officeAddress2} onChange={handleChange} />
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
                         <label htmlFor="accountNote" className="block text-xs font-medium text-gray-700 mb-1">Account Note</label>
                        <textarea id="accountNote" name="accountNote" value={formData.accountNote as string} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-ht-blue focus:border-ht-blue bg-white dark:bg-white"></textarea>
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
                                <InputField id={`sub-companyName-${sub.id}`} label="Company Name" name="companyName" value={sub.companyName} onChange={(e) => handleSubsidiaryChange(index, e)} required />
                                <InputField id={`sub-regNumber-${sub.id}`} label="Official Registration Number" name="regNumber" value={sub.regNumber} onChange={(e) => handleSubsidiaryChange(index, e)} required />
                                <InputField id={`sub-officeAddress1-${sub.id}`} label="Office Address 1" name="officeAddress1" value={sub.officeAddress1} onChange={(e) => handleSubsidiaryChange(index, e)} required />
                                <InputField id={`sub-officeAddress2-${sub.id}`} label="Office Address 2" name="officeAddress2" value={sub.officeAddress2} onChange={(e) => handleSubsidiaryChange(index, e)} />
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
                                    <InputField id={`sub-website-${sub.id}`} label="Website" name="website" value={sub.website} onChange={(e) => handleSubsidiaryChange(index, e)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor={`sub-accountNote-${sub.id}`} className="block text-xs font-medium text-gray-700 mb-1">Account Note</label>
                                    <textarea id={`sub-accountNote-${sub.id}`} name="accountNote" value={sub.accountNote} onChange={(e) => handleSubsidiaryChange(index, e)} rows={3} className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-ht-blue focus:border-ht-blue bg-white dark:bg-white"></textarea>
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
                            <InputField id={`contact-firstName-${contact.id}`} label="First Name" name="firstName" value={contact.firstName} onChange={e => handleContactChange(index, e)} required />
                            <InputField id={`contact-lastName-${contact.id}`} label="Last Name" name="lastName" value={contact.lastName} onChange={e => handleContactChange(index, e)} required />
                             <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">*Contact Number</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+60</span>
                                    <input type="text" id={`contact-number-${contact.id}`} name="contactNumber" value={contact.contactNumber} onChange={e => handleContactChange(index, e)} className="flex-1 block w-full rounded-none rounded-r-md border border-gray-300 p-2 text-sm focus:ring-ht-blue focus:border-ht-blue bg-white dark:bg-white" />
                                </div>
                            </div>
                            <InputField id={`contact-email-${contact.id}`} label="Email Address" name="email" value={contact.email} onChange={e => handleContactChange(index, e)} required type="email" />
                            <SelectField id={`contact-companyRole-${contact.id}`} label="Company Role" name="companyRole" value={contact.companyRole} onChange={e => handleContactChange(index, e)} required>
                                <option>Select Role</option>
                            </SelectField>
                             <SelectField id={`contact-systemRole-${contact.id}`} label="System Role" name="systemRole" value={contact.systemRole} onChange={e => handleContactChange(index, e)} required>
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
                    <input type="checkbox" id="billingSameAsOfficial" name="billingSameAsOfficial" checked={formData.billingSameAsOfficial as boolean} onChange={handleChange} className="h-4 w-4 border-gray-300 rounded focus:ring-ht-gray" />
                    <label htmlFor="billingSameAsOfficial" className="ml-2 block text-sm text-gray-900">Same as Official Address</label>
                </div>
                {!(formData.billingSameAsOfficial as boolean) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <InputField id="billingAddress1" label="Office Address 1" name="billingAddress1" value={formData.billingAddress1 as string} onChange={handleChange} required />
                        <InputField id="billingAddress2" label="Office Address 2" name="billingAddress2" value={formData.billingAddress2 as string} onChange={handleChange} />
                        <InputField id="billingPostcode" label="Postcode" name="billingPostcode" value={formData.billingPostcode as string} onChange={handleChange} required />
                        <InputField id="billingCity" label="City" name="billingCity" value={formData.billingCity as string} onChange={handleChange} required />
                        <InputField id="billingState" label="State" name="billingState" value={formData.billingState as string} onChange={handleChange} required />
                        <InputField id="billingCountry" label="Country" name="billingCountry" value={formData.billingCountry as string} onChange={handleChange} required />
                    </div>
                )}
            </FormSection>
            
            <FormSection title="Tax Information">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <InputField id="companyTIN" label="Company TIN" name="companyTIN" value={formData.companyTIN as string} onChange={handleChange} required />
                    <InputField id="sstNumber" label="SST Number" name="sstNumber" value={formData.sstNumber as string} onChange={handleChange} />
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
                    <input type="checkbox" id="agreedToGenericTerms" name="agreedToGenericTerms" checked={formData.agreedToGenericTerms as boolean} onChange={handleChange} className="h-4 w-4 border-gray-300 rounded focus:ring-ht-gray" />
                    <label htmlFor="agreedToGenericTerms" className="ml-2 block text-sm text-gray-900">I have read and agree to the Generic Terms and Conditions.</label>
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
                    disabled={!formData.agreedToGenericTerms}
                    className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue-dark disabled:bg-ht-gray disabled:cursor-not-allowed"
                >
                    Save and Proceed
                </button>
            </div>
        </div>
    );
};

export default CorporateForm;
