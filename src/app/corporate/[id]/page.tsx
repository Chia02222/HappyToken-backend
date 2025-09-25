"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import FormLayout from '../../../components/layout/FormLayout';
import CorporateForm from '../../../components/forms/CorporateForm';
import CommercialTermsForm from '../../../components/forms/CommercialTermsForm';
import ECommercialTermsForm from '../../../components/forms/ECommercialTermsForm';
import { CorporateDetails, CorporateStatus, Contact } from '../../../types';
import { getCorporateById, createCorporate, updateCorporate, updateCorporateStatus, sendAmendmentEmail } from '../../../services/api';
import SuccessModal from '../../../components/modals/SuccessModal';
import ErrorMessageModal from '../../../components/modals/ErrorMessageModal';
import AmendRequestModal from '../../../components/modals/AmendRequestModal';
import { isRequired, isValidEmail, isValidPhone, isValidDateRange, isPositiveNumberString } from '../../../utils/validators';

let clientSideIdCounter = 0;
const generateClientSideId = (): string => {
  clientSideIdCounter -= 1;
  return `client-${clientSideIdCounter}`;
};

const INITIAL_CORPORATE_FORM_DATA: CorporateDetails = {
    id: '',
    company_name: '',
    reg_number: '',
    status: 'Draft',
    created_at: '',
    updated_at: '',
    office_address1: '',
    office_address2: '',
    postcode: '',
    city: '',
    state: '',
    country: 'Malaysia',
    website: '',
    account_note: '',
    subsidiaries: [],
    contacts: [
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
    billing_same_as_official: true,
    billing_address1: '',
    billing_address2: '',
    billing_postcode: '',
    billing_city: '',
    billing_state: '',
    billing_country: 'Malaysia',
    company_tin: '',
    sst_number: '',
    agreement_from: '',
    agreement_to: '',
    credit_limit: '0.00',
    credit_terms: '',
    transaction_fee: '',
    late_payment_interest: '',
    white_labeling_fee: '',
    custom_feature_fee: '0.00',
    agreed_to_generic_terms: false,
    agreed_to_commercial_terms: false,
    first_approval_confirmation: false,
    second_approval_confirmation: false,
    investigation_log: [],
};

interface CorporateFormPageProps {
  // params are now accessed via useParams hook, so no longer needed here
}

const CorporateFormPage: React.FC<CorporateFormPageProps> = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const corporateId = params.id as string;
  const mode = searchParams.get('mode') as 'new' | 'edit' | 'approve' | 'approve-second' | null;

  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState<CorporateDetails>(INITIAL_CORPORATE_FORM_DATA);
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'approve' | 'approve-second'>(mode || 'new');
  const [isConfirmDeleteModalVisible, setIsConfirmDeleteModalVisible] = useState(false);
  const [corporateToDeleteId, setCorporateToDeleteId] = useState<string | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successModalContent, setSuccessModalContent] = useState({ title: '', message: '' });
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState('');
  const [isAmendRequestModalVisible, setIsAmendRequestModalVisible] = useState(false);

  const scrollToField = (fieldId: string) => {
    if (typeof window === 'undefined') return;
    const el = document.getElementById(fieldId);
    if (el && 'scrollIntoView' in el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus if possible
      if ('focus' in el) {
        try { (el as HTMLElement).focus(); } catch {}
      }
    }
  };

  useEffect(() => {
    const fetchCorporateData = async () => {
      if (corporateId && corporateId !== 'new') {
        try {
          const fullFormData = await getCorporateById(corporateId);
          setFormData({
            ...INITIAL_CORPORATE_FORM_DATA,
            ...fullFormData,
          });
          // Set formMode based on URL parameter if available, otherwise default to 'edit'
          setFormMode(mode || 'edit');
        } catch (error) {
          console.error(`Failed to fetch corporate ${corporateId}:`, error);
        }
      } else {
        setFormMode('new');
        setFormData(INITIAL_CORPORATE_FORM_DATA);
      }
    };

    fetchCorporateData();
  }, [corporateId, mode]);

  const handleCloseCorporateForm = () => {
    router.push('/');
  };

  const handleSaveCorporate = async (formData: CorporateDetails, action: 'submit' | 'sent' | 'save') => {
    try {
      // Basic client-side validation
      const primary = formData.contacts?.[0];
      if (!isRequired(formData.company_name) || !isRequired(formData.reg_number)) {
        setErrorModalContent('Company name and registration number are required.');
        setIsErrorModalVisible(true);
        scrollToField(!isRequired(formData.company_name) ? 'company_name' : 'reg_number');
        return;
      }
      if (!primary || !isRequired(primary.first_name) || !isRequired(primary.last_name)) {
        setErrorModalContent('Primary contact first and last name are required.');
        setIsErrorModalVisible(true);
        scrollToField(!primary || !isRequired(primary.first_name) ? 'first_name' : 'last_name');
        return;
      }
      if (!isValidEmail(primary.email)) {
        setErrorModalContent('Primary contact email is invalid.');
        setIsErrorModalVisible(true);
        scrollToField('email');
        return;
      }
      if (!isValidPhone(primary.contact_number)) {
        setErrorModalContent('Primary contact phone is invalid.');
        setIsErrorModalVisible(true);
        scrollToField('contact_number');
        return;
      }
      if (formStep >= 2) {
        if (!isValidDateRange(formData.agreement_from, formData.agreement_to)) {
          setErrorModalContent('Agreement date range is invalid.');
          setIsErrorModalVisible(true);
          scrollToField('agreementFrom');
          return;
        }
        if (!isPositiveNumberString(formData.credit_limit) || !isPositiveNumberString(formData.custom_feature_fee)) {
          setErrorModalContent('Amounts must be valid non-negative numbers.');
          setIsErrorModalVisible(true);
          scrollToField(!isPositiveNumberString(formData.credit_limit) ? 'credit_limit' : 'custom_feature_fee');
          return;
        }
      }

      const updatedFormData = { ...formData };

      if (formMode === 'approve-second' && action === 'submit') {
        updatedFormData.second_approval_confirmation = true;

        const { secondary_approver } = updatedFormData;
        if (secondary_approver) {
            if (secondary_approver.use_existing_contact && secondary_approver.selected_contact_id) {
                const contactToUpdateIndex = updatedFormData.contacts.findIndex(c => c.id === secondary_approver.selected_contact_id);
                if (contactToUpdateIndex !== -1) {
                    const updatedContacts = [...updatedFormData.contacts];
                    updatedContacts[contactToUpdateIndex] = {
                        ...updatedContacts[contactToUpdateIndex],
                        contact_number: secondary_approver.contact_number || updatedContacts[contactToUpdateIndex].contact_number,
                        email: secondary_approver.email || updatedContacts[contactToUpdateIndex].email,
                        company_role: secondary_approver.company_role || updatedContacts[contactToUpdateIndex].company_role,
                        system_role: 'secondary_approver',
                    };
                    updatedFormData.contacts = updatedContacts;
                }
            } else if (!secondary_approver.use_existing_contact) {
                const newSecondaryContact: Contact = {
                    salutation: secondary_approver.salutation || 'Mr',
                    first_name: secondary_approver.first_name || '',
                    last_name: secondary_approver.last_name || '',
                    contact_number: secondary_approver.contact_number || '',
                    email: secondary_approver.email || '',
                    company_role: secondary_approver.company_role || '',
                    system_role: 'secondary_approver',
                };
                if (!isRequired(newSecondaryContact.first_name) || !isRequired(newSecondaryContact.last_name) || !isValidEmail(newSecondaryContact.email) || !isValidPhone(newSecondaryContact.contact_number)) {
                  setErrorModalContent('Secondary approver details are invalid or incomplete.');
                  setIsErrorModalVisible(true);
                  scrollToField(!isRequired(newSecondaryContact.first_name)
                    ? 'first_name'
                    : !isRequired(newSecondaryContact.last_name)
                      ? 'last_name'
                      : !isValidEmail(newSecondaryContact.email)
                        ? 'email'
                        : 'contact_number');
                  return;
                }
                updatedFormData.contacts = [...updatedFormData.contacts, newSecondaryContact];
            }
        }
      } else if (formMode === 'approve' && action === 'submit') {
        updatedFormData.first_approval_confirmation = true;
      }

      const { contacts, subsidiaries, contactIdsToDelete, subsidiaryIdsToDelete, ...corporateData } = updatedFormData;

      const dataToSend = {
        ...corporateData,
        contacts,
        subsidiaries,
        contactIdsToDelete,
        subsidiaryIdsToDelete,
        secondary_approver: updatedFormData.secondary_approver,
      };

      // Debug: inspect outgoing payload
      try {
        // Avoid logging huge blobs if any
        console.debug('[SaveCorporate] mode:', formMode, 'action:', action);
        console.debug('[SaveCorporate] payload:', JSON.stringify(dataToSend));
      } catch {}

      let savedCorporateId = corporateId;

      if (corporateId && corporateId !== 'new') {
        const updatedCorporate = await updateCorporate(corporateId, dataToSend);
      } else {
        const newCorporate = await createCorporate(dataToSend);
        savedCorporateId = newCorporate.id;
        if (action === 'sent') {
            await updateCorporateStatus(newCorporate.id, 'Pending 1st Approval', 'Submitted to 1st approver.');
        }
      }

      if (formMode === 'approve' && action === 'submit' && savedCorporateId) {
        await updateCorporateStatus(savedCorporateId, 'Pending 2nd Approval', 'First approval completed.');
      } else if (formMode === 'approve-second' && action === 'submit' && savedCorporateId) {
        await updateCorporateStatus(savedCorporateId, 'Cooling Period', 'Second approval completed.');
      }

      handleCloseCorporateForm();
    } catch (error) {
      console.error('[SaveCorporate] Failed to save corporate:', error);
      const msg = error instanceof Error ? error.message : String(error);
      // Show backend message plus a short hint to open devtools for payload
      setErrorModalContent(`Failed to save corporate: ${msg}`);
      setIsErrorModalVisible(true);
    }
  };

  const handleUpdateStatus = async (id: string, status: CorporateStatus, note?: string) => {
    try {
        await updateCorporateStatus(id, status, note);
    } catch (error) {
        console.error(`Failed to update status for corporate ${id}:`, error);
        setErrorModalContent(`Failed to update status: ${error instanceof Error ? error.message : String(error)}`);
        setIsErrorModalVisible(true);
    }
  };

  const handleAmendRequest = () => {
    console.log('Amend Request clicked for corporate:', corporateId);
    setIsAmendRequestModalVisible(true);
  };

  const handleSubmitAmendment = async (corporateId: string, requestedChanges: string, amendmentReason: string) => {
    try {
      // Create a detailed note for the investigation log with custom formatting
      const amendmentNote = `Requested Changes: ${requestedChanges}<br>Reason:${amendmentReason}<br>Submitted by: ${formData.contacts?.[0]?.first_name || ''} ${formData.contacts?.[0]?.last_name || ''} (${formData.contacts?.[0]?.email || ''})`;

      // Add to investigation log
      await updateCorporateStatus(corporateId, 'Amendment Requested', amendmentNote);
      
      // Send email notification to CRT team
      const approverName = `${formData.contacts?.[0]?.first_name || ''} ${formData.contacts?.[0]?.last_name || ''}`.trim();
      const crtName = 'CRT Team'; // You can make this dynamic if needed
      
      await sendAmendmentEmail(corporateId, {
        requestedChanges,
        amendmentReason,
        approverName,
        crtName
      });
      
      // Show success message
      setSuccessModalContent({
        title: 'Amendment Request Submitted',
        message: 'Your amendment request has been submitted successfully and the CRT team has been notified via email.'
      });
      setIsSuccessModalVisible(true);
    } catch (error) {
      console.error('Failed to submit amendment request:', error);
      throw error;
    }
  };

  const getBaseTitle = () => {
    if (formMode === 'new') return 'New Corporate Account';
    if (formMode === 'approve') return 'First Approval';
    if (formMode === 'approve-second') return 'Second Approval';
    if (corporateId && corporateId !== 'new') return 'View / Edit Corporate Account';
    return 'New Corporate Account';
  };
  const baseTitle = getBaseTitle();
  
  const formTitle = formStep === 1 ? baseTitle :
                    formStep === 2 ? 'Commercial Terms' : 
                    'E-Commercial Terms & Signature';

  return (
    <FormLayout 
      title={formTitle}
      showAmendRequestButton={formMode === 'approve' || formMode === 'approve-second'}
      onAmendRequest={handleAmendRequest}
    >
        {formStep === 1 ? (
            <CorporateForm
                onCloseForm={handleCloseCorporateForm}
                setFormStep={setFormStep}
                formData={({ ...formData}) as CorporateDetails}
                setFormData={setFormData}
                onSaveCorporate={handleSaveCorporate}
                generateClientSideId={generateClientSideId}
            />
        ) : formStep === 2 ? (
            <CommercialTermsForm
                onCloseForm={handleCloseCorporateForm}
                setFormStep={setFormStep}
                formData={({ ...formData}) as CorporateDetails}
                setFormData={setFormData}
                onSaveCorporate={handleSaveCorporate}
            />
        ) : (
            <ECommercialTermsForm
                onCloseForm={handleCloseCorporateForm}
                setFormStep={setFormStep}
                formData={({ ...formData}) as CorporateDetails}
                setFormData={setFormData}
                onSaveCorporate={handleSaveCorporate}
                formMode={formMode}
                updateStatus={handleUpdateStatus}
            />
        )}
        <SuccessModal
            isOpen={isSuccessModalVisible}
            onClose={() => setIsSuccessModalVisible(false)}
            title={successModalContent.title}
            message={successModalContent.message}
        />
        <ErrorMessageModal
            isOpen={isErrorModalVisible}
            onClose={() => setIsErrorModalVisible(false)}
            message={errorModalContent}
        />
        <AmendRequestModal
            isOpen={isAmendRequestModalVisible}
            onClose={() => setIsAmendRequestModalVisible(false)}
            corporate={formData}
            corporateId={corporateId}
            onSubmitAmendment={handleSubmitAmendment}
        />
    </FormLayout>
  );
};

export default CorporateFormPage;