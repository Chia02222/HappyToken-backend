"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import FormLayout from '../../../components/layout/FormLayout';
import CorporateForm from '../../../components/forms/CorporateForm';
import ECommercialTermsForm from '../../../components/forms/ECommercialTermsForm';
import { CorporateDetails, CorporateStatus, Contact } from '../../../types';
import { getCorporateById, createCorporate, updateCorporate, updateCorporateStatus, sendAmendmentEmail, sendEcommericialTermlink } from '../../../services/api';
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
    credit_limit: '',
    credit_terms: '',
    transaction_fee: '',
    late_payment_interest: '',
    white_labeling_fee: '',
    custom_feature_fee: '',
    agreed_to_generic_terms: false,
    agreed_to_commercial_terms: false,
    first_approval_confirmation: false,
    second_approval_confirmation: false,
    investigation_log: [],
};

type CorporateFormPageProps = object;

const CorporateFormPage: React.FC<CorporateFormPageProps> = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const corporateId = params.id as string;
  const mode = searchParams.get('mode') as 'new' | 'edit' | 'approve' | 'approve-second' | null;

  const initialStep = (mode === 'approve' || mode === 'approve-second' || searchParams.get('step') === '2') ? 2 : 1;
  const [formStep, setFormStep] = useState(initialStep);
  const [formData, setFormData] = useState<CorporateDetails>(INITIAL_CORPORATE_FORM_DATA);
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'approve' | 'approve-second'>(mode || 'new');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successModalContent, setSuccessModalContent] = useState({ title: '', message: '' });
  const [shouldCloseOnSuccessClose, setShouldCloseOnSuccessClose] = useState(false);
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
          // Pre-populate secondary approver in approve-second mode so user doesn't need to reselect
          let prefilledSecondary: Partial<CorporateDetails> = {};
          if (mode === 'approve-second') {
            const contacts = fullFormData.contacts || [];
            const secId = (fullFormData as any).secondary_approver_id as string | number | undefined;
            const byId = contacts.find((c: any) => String(c.id) === String(secId));
            const byRole = contacts.find((c: any) => c.system_role === 'secondary_approver');
            const chosen = byId || byRole;
            if (chosen) {
              prefilledSecondary = {
                secondary_approver_id: chosen.id as any,
                secondary_approver: {
                  use_existing_contact: true,
                  selected_contact_id: chosen.id,
                  salutation: chosen.salutation,
                  first_name: chosen.first_name,
                  last_name: chosen.last_name,
                  company_role: chosen.company_role,
                  system_role: 'secondary_approver',
                  email: chosen.email,
                  contact_number: chosen.contact_number,
                } as any,
              } as Partial<CorporateDetails>;
            }
          }

          const adjusted = {
            ...INITIAL_CORPORATE_FORM_DATA,
            ...fullFormData,
            ...(mode === 'approve-second' ? {
              agreed_to_generic_terms: false,
              agreed_to_commercial_terms: false,
            } : {}),
            ...prefilledSecondary,
          } as CorporateDetails;
          setFormData(adjusted);
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
  }, [corporateId, mode, searchParams]);

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
        // Ensure secondary approver is persisted to contacts table and linked on corporate
        const sa = updatedFormData.secondary_approver as (Contact & { use_existing_contact?: boolean; selected_contact_id?: string | number }) | undefined;
        if (sa) {
          // Always enforce system_role for secondary approver when saving
          (updatedFormData as any).secondary_approver = { ...sa, system_role: 'secondary_approver' } as any;

          if (sa.use_existing_contact && sa.selected_contact_id) {
            const selected = updatedFormData.contacts?.find(c => String(c.id) === String(sa.selected_contact_id));
            if (selected) {
              // Populate fields to avoid overwriting existing contact with empty strings in backend
              (updatedFormData as any).secondary_approver = {
                ...sa,
                selected_contact_id: selected.id,
                salutation: selected.salutation,
                first_name: selected.first_name,
                last_name: selected.last_name,
                company_role: selected.company_role,
                system_role: 'secondary_approver',
                email: selected.email,
                contact_number: selected.contact_number,
              };
            }
          }
        }
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

      // Debug logging removed to avoid main-thread overhead

      let savedCorporateId = corporateId;

      if (corporateId && corporateId !== 'new') {
        await updateCorporate(corporateId, dataToSend);
      } else {
        const newCorporate = await createCorporate(dataToSend);
        savedCorporateId = newCorporate.id;
      }

      if (action === 'sent' && savedCorporateId) {
        // Send email to first approver and update status via backend
        try {
          await sendEcommericialTermlink(savedCorporateId);
          setSuccessModalContent({ title: 'Sent', message: 'Email sent to the first approver and status updated to Pending 1st Approval.' });
          setShouldCloseOnSuccessClose(true);
          setIsSuccessModalVisible(true);
          return;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setErrorModalContent(`Failed to send for approval: ${msg}`);
          setIsErrorModalVisible(true);
          return;
        }
      } else if (formMode === 'approve' && action === 'submit' && savedCorporateId) {
        await updateCorporateStatus(savedCorporateId, 'Pending 2nd Approval', 'First approval completed.');
        try {
          await sendEcommericialTermlink(savedCorporateId, 'second');
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setErrorModalContent(`Failed to email second approver: ${msg}`);
          setIsErrorModalVisible(true);
          return;
        }
      } else if (formMode === 'approve-second' && action === 'submit' && savedCorporateId) {
        await updateCorporateStatus(savedCorporateId, 'Cooling Period', 'Second approval completed.');
      }

      if (action === 'save') {
        setSuccessModalContent({ title: 'Saved', message: 'Corporate saved successfully.' });
        setIsSuccessModalVisible(true);
        setShouldCloseOnSuccessClose(true);
        return;
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
      // Create a detailed note for the investigation log with proper formatting for parsing
      const amendmentNote = `Amendment Request Submitted<br>Requested Changes: ${requestedChanges}<br>Reason: ${amendmentReason}<br>Submitted by: ${formData.contacts?.[0]?.first_name || ''} ${formData.contacts?.[0]?.last_name || ''} (${formData.contacts?.[0]?.email || ''})`;

      // Add to investigation log
      await updateCorporateStatus(corporateId, 'Amendment Requested', amendmentNote);
      
      // Send email notification to CRT team (no body parameters needed)
      await sendAmendmentEmail(corporateId);
      
      // Show success message
      setSuccessModalContent({
        title: 'Amendment Request Submitted',
        message: 'Your amendment request has been submitted successfully and the CRT team has been notified via email.'
      });
      setIsSuccessModalVisible(true);
      setIsAmendRequestModalVisible(false);
    } catch (error) {
      console.error('Failed to submit amendment request:', error);
      setErrorModalContent('Failed to submit amendment request. Please try again.');
      setIsErrorModalVisible(true);
    }
  };

  const getBaseTitle = () => {
    if (formMode === 'new' || formMode === 'edit') return 'New Corporate Account';
    if (formMode === 'approve') return 'First Approval';
    if (formMode === 'approve-second') return 'Second Approval';
    if (corporateId && corporateId !== 'new') return 'Corporate Account';
    return 'New Corporate Account';
  };
  const baseTitle = getBaseTitle();
  
  const formTitle = (formMode === 'approve' || formMode === 'approve-second' || formStep === 2)
    ? 'E-Commercial Terms & Signature'
    : baseTitle;

  const latestRejectedLog = React.useMemo(() => {
    try {
      const logs = (formData as any).investigation_log as Array<{ to_status?: string; note?: string; timestamp?: string }>|undefined;
      if (!Array.isArray(logs)) return null;
      const rej = logs.find(l => l.to_status === 'Rejected') || logs.find(l => (l.note || '').toLowerCase().includes('reject')) || null;
      return rej;
    } catch { return null; }
  }, [formData]);

  const latestAmendLog = React.useMemo(() => {
    try {
      const logs = (formData as any).investigation_log as Array<{ to_status?: string; from_status?: string; note?: string; timestamp?: string }>|undefined;
      if (!Array.isArray(logs)) return null;
      const amend = logs.find(l => l.to_status === 'Amendment Requested') || logs.find(l => (l.note || '').includes('Amendment Request Submitted')) || null;
      return amend;
    } catch { return null; }
  }, [formData]);

  const resolvePrevStatusForAmendment = (): CorporateStatus => {
    const from = (latestAmendLog as any)?.from_status as CorporateStatus | undefined;
    if (from) return from;
    const hasSecondary = Boolean((formData as any).secondary_approver_id);
    return (hasSecondary ? 'Pending 2nd Approval' : 'Pending 1st Approval') as CorporateStatus;
  };

  const resolveApproverForStatus = (status: CorporateStatus): 'first' | 'second' => {
    return status === 'Pending 2nd Approval' ? 'second' : 'first';
  };

  const [isAmendRejecting, setIsAmendRejecting] = React.useState(false);
  const [amendRejectReason, setAmendRejectReason] = React.useState('');

  const formatAmendNote = (note?: string) => {
    if (!note) return 'An amendment has been requested.';
    return note
      .replace(/Amendment Request Submitted<br>?/i, '')
      .replace(/<br>/g, '\n')
      .trim();
  };

  return (
    <FormLayout 
      title={formTitle}
      showAmendRequestButton={formStep === 2 && (formMode === 'approve' || formMode === 'approve-second')}
      onAmendRequest={handleAmendRequest}
    >
        {(formData.status === 'Amendment Requested') && (
          <div className="w-full mb-4 p-4 border border-orange-300 bg-orange-50 text-orange-800 rounded">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold mb-1">Amendment Requested</div>
                <div className="text-sm whitespace-pre-wrap">{formatAmendNote(latestAmendLog?.note)}</div>
              </div>
              {(formMode !== 'approve' && formMode !== 'approve-second') && (
              <div className="flex items-center gap-2">
                <button
                  className="text-sm bg-ht-blue text-white px-3 py-2 rounded-md hover:bg-ht-blue-dark"
                  onClick={async () => {
                    try {
                      const prev = resolvePrevStatusForAmendment();
                      await updateCorporateStatus(corporateId, prev, `Amendment approved by CRT; reverting to ${prev}.`);
                      const approver = resolveApproverForStatus(prev);
                      await sendEcommericialTermlink(corporateId, approver);
                      setSuccessModalContent({
                        title: 'Amendment Approved',
                        message: `Reverted to ${prev}. Email sent to ${approver === 'second' ? 'second' : 'first'} approver.`,
                      });
                      setIsSuccessModalVisible(true);
                    } catch (e) {
                      setErrorModalContent(`Failed to confirm amendment: ${e instanceof Error ? e.message : String(e)}`);
                      setIsErrorModalVisible(true);
                    }
                  }}
                >
                  Confirm
                </button>
                <button
                  className="text-sm bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"
                  onClick={() => {
                    setIsAmendRejecting(true);
                  }}
                >
                  Reject
                </button>
              </div>
              )}
            </div>
          </div>
        )}

        {isAmendRejecting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setIsAmendRejecting(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold">Reject Amendment</h3>
                <button className="text-gray-500 text-xl" onClick={() => setIsAmendRejecting(false)}>×</button>
              </div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-ht-blue focus:border-ht-blue"
                rows={4}
                value={amendRejectReason}
                onChange={(e) => setAmendRejectReason(e.target.value)}
                placeholder="Enter reason for rejecting the amendment..."
              />
              <div className="flex justify-end gap-2 mt-4">
                <button className="text-sm px-3 py-2 rounded-md border" onClick={() => setIsAmendRejecting(false)}>Cancel</button>
                <button
                  className="text-sm bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 disabled:bg-red-300"
                  disabled={!amendRejectReason.trim()}
                  onClick={async () => {
                    try {
                      const prev = resolvePrevStatusForAmendment();
                      await updateCorporateStatus(corporateId, prev, `Amendment rejected by CRT: ${amendRejectReason}`);
                      const approver = resolveApproverForStatus(prev);
                      await sendEcommericialTermlink(corporateId, approver);
                      setIsAmendRejecting(false);
                      setAmendRejectReason('');
                      setSuccessModalContent({
                        title: 'Amendment Rejected',
                        message: `Reverted to ${prev}. Email sent to ${approver === 'second' ? 'second' : 'first'} approver.`,
                      });
                      setIsSuccessModalVisible(true);
                    } catch (e) {
                      setErrorModalContent(`Failed to reject amendment: ${e instanceof Error ? e.message : String(e)}`);
                      setIsErrorModalVisible(true);
                    }
                  }}
                >
                  Reject Amendment
                </button>
              </div>
            </div>
          </div>
        )}
        {(formData.status === 'Rejected') && (
          <div className="w-full mb-4 p-4 border border-red-300 bg-red-50 text-red-800 rounded">
            <div className="font-semibold mb-1">Rejected</div>
            <div className="text-sm whitespace-pre-wrap">{latestRejectedLog?.note || 'This corporate was rejected.'}</div>
          </div>
        )}
        {(formMode === 'approve' || formMode === 'approve-second' || formStep === 2) ? (
            <ECommercialTermsForm
                onCloseForm={handleCloseCorporateForm}
                setFormStep={setFormStep}
                formData={({ ...formData}) as CorporateDetails}
                setFormData={setFormData}
                onSaveCorporate={handleSaveCorporate}
                formMode={formMode}
                updateStatus={handleUpdateStatus}
            />
        ) : (
            <CorporateForm
                onCloseForm={handleCloseCorporateForm}
                setFormStep={setFormStep}
                formData={({ ...formData}) as CorporateDetails}
                setFormData={setFormData}
                onSaveCorporate={handleSaveCorporate}
                generateClientSideId={generateClientSideId}
                formMode={formMode}
            />
        )}
        <SuccessModal
            isOpen={isSuccessModalVisible}
        onClose={() => {
          setIsSuccessModalVisible(false);
          if (shouldCloseOnSuccessClose) {
            setShouldCloseOnSuccessClose(false);
            handleCloseCorporateForm();
          }
        }}
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