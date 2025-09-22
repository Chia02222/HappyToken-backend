"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import FormLayout from '../../../components/layout/FormLayout';
import CorporateForm from '../../../components/CorporateForm';
import CommercialTermsForm from '../../../components/CommercialTermsForm';
import ECommercialTermsForm from '../../../components/ECommercialTermsForm';
import { CorporateDetails, CorporateStatus, Contact } from '../../../types';
import { getCorporateById, createCorporate, updateCorporate, updateCorporateStatus } from '../../../services/api';
import SuccessModal from '../../../components/modals/SuccessModal';
import ErrorMessageModal from '../../../components/modals/ErrorMessageModal';

let clientSideIdCounter = 0;
const generateClientSideId = (): string => {
  clientSideIdCounter -= 1;
  return `${clientSideIdCounter}`;
};

const isUuid = (value: string): boolean => {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);
};

const INITIAL_CORPORATE_FORM_DATA: CorporateDetails = {
    id: '',
    company_name: '',
    reg_number: '',
    status: 'New',
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
            system_role: 'user',
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


const CorporateFormPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const corporateId = params.id as string;
  const mode = searchParams.get('mode') as 'new' | 'edit' | 'approve' | 'approve-second' | null;

  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState<CorporateDetails>(INITIAL_CORPORATE_FORM_DATA);
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'approve' | 'approve-second'>(mode || 'new');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState('');

  useEffect(() => {
    const fetchCorporateData = async () => {
      if (corporateId && corporateId !== 'new') {
        try {
          const fullFormData = await getCorporateById(corporateId);
          setFormData(fullFormData);
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
                updatedFormData.contacts = [...updatedFormData.contacts, newSecondaryContact];
            }
        }
      } else if (formMode === 'approve' && action === 'submit') {
        updatedFormData.first_approval_confirmation = true;
      }

      const processedContacts = updatedFormData.contacts.map(contact => {
        if (typeof contact.id === 'string' && !isUuid(contact.id)) {
          const { id: _id, ...rest } = contact;
          return rest; // Remove client-side ID for new contacts
        }
        return contact;
      });

      const { contacts, subsidiaries, contactIdsToDelete, subsidiaryIdsToDelete, ...corporateData } = { ...updatedFormData, contacts: processedContacts };

      const dataToSend = {
        ...corporateData,
        contacts,
        subsidiaries,
        contactIdsToDelete,
        subsidiaryIdsToDelete,
        secondary_approver: updatedFormData.secondary_approver,
      };

      let savedCorporateId = corporateId;

      if (corporateId && corporateId !== 'new') {
        await updateCorporate(corporateId, dataToSend);
      } else {
        const newCorporate = await createCorporate(dataToSend);
        savedCorporateId = newCorporate.id;
        if (action === 'sent') {
            await updateCorporateStatus(newCorporate.id, 'Sent', 'Registration link generated and status updated.');
        }
      }

      if (formMode === 'approve' && action === 'submit' && savedCorporateId) {
        await updateCorporateStatus(savedCorporateId, 'Pending 2nd Approval', 'First approval completed.');
      } else if (formMode === 'approve-second' && action === 'submit' && savedCorporateId) {
        await updateCorporateStatus(savedCorporateId, 'Cooling Period', 'Second approval completed.');
      }

      handleCloseCorporateForm();
    } catch (error) {
      console.error("Failed to save corporate:", error);
      setErrorModalContent(`Failed to save corporate: ${error instanceof Error ? error.message : String(error)}`);
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
    <FormLayout title={formTitle}>
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
        />
        <ErrorMessageModal
            isOpen={isErrorModalVisible}
            onClose={() => setIsErrorModalVisible(false)}
            message={errorModalContent}
        />
    </FormLayout>
  );
};

export default CorporateFormPage;