"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import FormLayout from '../../../components/layout/FormLayout';
import CorporateForm from '../../../components/forms/CorporateForm';
import ECommercialTermsForm from '../../../components/forms/ECommercialTermsForm';
import AmendRequestModal from '../../../components/modals/AmendRequestModal';
import { CorporateDetails, CorporateStatus, Contact, LogEntry } from '../../../types';
import { getCorporateById, createCorporate, updateCorporate, updateCorporateStatus, sendAmendmentEmail, sendEcommericialTermlink, sendAmendRejectEmail, getAmendmentRequestsByCorporate } from '../../../services/api';
import SuccessModal from '../../../components/modals/SuccessModal';
import ErrorMessageModal from '../../../components/modals/ErrorMessageModal';
import { isRequired, isValidEmail, isValidPhone, isValidDateRange, isPositiveNumberString, getMalaysiaDateString, handleDateInputChange } from '../../../utils/validators';

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
    pinned: false,
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
          if (mode === 'approve-second' || mode === 'approve') {
            const contacts = fullFormData.contacts || [];
            const secId = fullFormData.secondary_approver_id ?? undefined;
            const byId = contacts.find((c: Contact) => String(c.id) === String(secId));
            const byRole = contacts.find((c: Contact) => c.system_role === 'secondary_approver');
            const chosen = byId || byRole;
            if (chosen) {
              prefilledSecondary = {
                secondary_approver_id: chosen.id ?? null,
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
                } as CorporateDetails['secondary_approver'],
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
        // Only validate dates if provided
        if (formData.agreement_from || formData.agreement_to) {
          if (!isValidDateRange(formData.agreement_from, formData.agreement_to)) {
            setErrorModalContent('Agreement date range is invalid.');
            setIsErrorModalVisible(true);
            scrollToField('agreementFrom');
            return;
          }
        }
        // Only validate numeric strings if provided
        const needsCreditLimitCheck = formData.credit_limit != null && String(formData.credit_limit).trim() !== '';
        const needsCustomFeeCheck = formData.custom_feature_fee != null && String(formData.custom_feature_fee).trim() !== '';
        if ((needsCreditLimitCheck && !isPositiveNumberString(formData.credit_limit)) || (needsCustomFeeCheck && !isPositiveNumberString(formData.custom_feature_fee))) {
          setErrorModalContent('Amounts must be valid non-negative numbers.');
          setIsErrorModalVisible(true);
          scrollToField(!(isPositiveNumberString(formData.credit_limit)) ? 'credit_limit' : 'custom_feature_fee');
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
        // Ensure secondary approver is persisted to contacts table with system_role
        const sa = updatedFormData.secondary_approver as (Contact & { use_existing_contact?: boolean; selected_contact_id?: string }) | undefined;
        if (sa) {
          if (sa.use_existing_contact && sa.selected_contact_id) {
            // Update existing contact in contacts array with secondary_approver system_role
            const contactToUpdateIndex = updatedFormData.contacts.findIndex(c => String(c.id) === String(sa.selected_contact_id));
            if (contactToUpdateIndex !== -1) {
              const updatedContacts = [...updatedFormData.contacts];
              updatedContacts[contactToUpdateIndex] = {
                ...updatedContacts[contactToUpdateIndex],
                system_role: 'secondary_approver',
                // Update any fields that might have changed
                salutation: sa.salutation || updatedContacts[contactToUpdateIndex].salutation,
                first_name: sa.first_name || updatedContacts[contactToUpdateIndex].first_name,
                last_name: sa.last_name || updatedContacts[contactToUpdateIndex].last_name,
                company_role: sa.company_role || updatedContacts[contactToUpdateIndex].company_role,
                email: sa.email || updatedContacts[contactToUpdateIndex].email,
                contact_number: sa.contact_number || updatedContacts[contactToUpdateIndex].contact_number,
              };
              updatedFormData.contacts = updatedContacts;
            }
          } else if (!sa.use_existing_contact) {
            // Add new secondary approver contact to contacts array
            const newSecondaryContact: Contact = {
              salutation: sa.salutation || 'Mr',
              first_name: sa.first_name || '',
              last_name: sa.last_name || '',
              contact_number: sa.contact_number || '',
              email: sa.email || '',
              company_role: sa.company_role || '',
              system_role: 'secondary_approver',
            };
            updatedFormData.contacts = [...updatedFormData.contacts, newSecondaryContact];
          }
        }
      }

      const { contacts, subsidiaries, contactIdsToDelete, subsidiaryIdsToDelete, secondary_approver, ...corporateData } = updatedFormData;

      const dataToSend = {
        ...corporateData,
        contacts,
        subsidiaries,
        contactIdsToDelete,
        subsidiaryIdsToDelete,
        // Don't send secondary_approver object - let backend find by system_role
      };

      // Debug logging removed to avoid main-thread overhead

      let savedCorporateId = corporateId;

      if (corporateId && corporateId !== 'new') {
        await updateCorporate(corporateId, dataToSend);
      } else {
        try {
          const newCorporate = await createCorporate(dataToSend);
          savedCorporateId = newCorporate.uuid;
        } catch (error) {
          console.error('Failed to create corporate:', error);
          throw error;
        }
      }


      if (action === 'sent' && savedCorporateId) {
        // Send email to first approver and update status via backend
        // This is the critical section that handles email sending for "Send to Approver" button
        try {
          
          // First, let's verify the corporate was created and has contact info
          // This prevents errors when trying to send emails to non-existent corporates
          const corporate = await getCorporateById(savedCorporateId);
          if (!corporate || !corporate.contacts || corporate.contacts.length === 0) {
            throw new Error('Corporate not found or has no contacts');
          }
          
          // Validate that the primary contact has a valid email address
          // This prevents sending emails to invalid or missing email addresses
          const firstContact = corporate.contacts[0];
          if (!firstContact.email || firstContact.email === 'N/A' || firstContact.email === '') {
            throw new Error('Primary contact email is missing or invalid');
          }
          
          
          // Send the email using the backend service
          // This will update the corporate status to 'Pending 1st Approval' if successful
          const result = await sendEcommericialTermlink(savedCorporateId);
          
          // Check if the result indicates success
          // The backend service returns {success: false, message: "..."} on failure
          if (result && result.success === false) {
            throw new Error(result.message || 'Email sending failed');
          }
          
          setSuccessModalContent({ 
            title: 'Sent', 
            message: 'Email sent to the first approver and status updated to Pending 1st Approval.' 
          });
          setShouldCloseOnSuccessClose(true);
          setIsSuccessModalVisible(true);
          return;
        } catch (err) {
          // Log the error for debugging purposes
          console.error('Error sending email to first approver:', err);
          
          // Create a user-friendly error message
          const msg = err instanceof Error ? err.message : String(err);
          setErrorModalContent(`Failed to send for approval: ${msg}. The corporate data has been saved but the email could not be sent. Please check the email configuration or contact information and try again.`);
          setIsErrorModalVisible(true);
          
          // CRITICAL: Re-throw the error to prevent success flow from executing
          // This ensures the calling code (ECommercialTermsForm) catches the error
          // and shows an error modal instead of redirecting
          throw err;
        }
      } else if (formMode === 'approve' && action === 'submit' && savedCorporateId) {
        // Secondary approver data is already persisted in the main updateCorporate call above
        // No need for duplicate call

        // Build detailed status note including approver name and role
        const firstApprover = formData.contacts?.[0];
        const approverName = firstApprover ? `${firstApprover.first_name} ${firstApprover.last_name}`.trim() : 'First Approver';
        const approverRole = firstApprover?.company_role || 'First Approver';
        const statusNote = `First approval completed.\nSubmitted by: ${approverName} (${approverRole})`;

        await updateCorporateStatus(savedCorporateId, 'Pending 2nd Approval', statusNote);
        try {
          await sendEcommericialTermlink(savedCorporateId, 'second');
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setErrorModalContent(`Failed to email second approver: ${msg}`);
          setIsErrorModalVisible(true);
          return;
        }
        // Redirect to second approval mode so the secondary approver section is active
        router.push(`/corporate/${savedCorporateId}?mode=approve-second&step=2`);
        return;
      } else if (formMode === 'approve-second' && action === 'submit' && savedCorporateId) {
        // Build detailed status note including second approver name and role
        const secondApprover = formData.secondary_approver;
        const approverName = secondApprover ? `${secondApprover.first_name || ''} ${secondApprover.last_name || ''}`.trim() : 'Second Approver';
        const approverRole = secondApprover?.company_role || 'Second Approver';
        const statusNote = `Second approval completed.\nSubmitted by: ${approverName} (${approverRole})`;

        await updateCorporateStatus(savedCorporateId, 'Cooling Period', statusNote);
        setSuccessModalContent({ 
          title: 'Second Approval Completed', 
          message: 'The agreement has been fully approved and is now in the cooling period.' 
        });
        setIsSuccessModalVisible(true);
        setShouldCloseOnSuccessClose(true);
        return;
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
    router.push(`/amendment/${corporateId}`);
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
      const logs = formData.investigation_log as LogEntry[] | undefined;
      if (!Array.isArray(logs)) return null;
      const rej = logs.find(l => l.to_status === 'Rejected') || logs.find(l => (l.note || '').toLowerCase().includes('reject')) || null;
      return rej;
    } catch { return null; }
  }, [formData]);

  const latestAmendLog = React.useMemo(() => {
    try {
      const logs = formData.investigation_log as LogEntry[] | undefined;
      if (!Array.isArray(logs)) return null;
      const amend = logs.find(l => l.to_status === 'Amendment Requested') || logs.find(l => (l.note || '').includes('Amendment Request Submitted')) || null;
      return amend;
    } catch { return null; }
  }, [formData]);

  const resolvePrevStatusForAmendment = (): CorporateStatus => {
    const from = latestAmendLog?.from_status ?? undefined;
    if (from) return from as CorporateStatus;
    const hasSecondary = Boolean(formData.secondary_approver_id);
    return (hasSecondary ? 'Pending 2nd Approval' : 'Pending 1st Approval') as CorporateStatus;
  };

  const resolveApproverForStatus = (status: CorporateStatus): 'first' | 'second' => {
    return status === 'Pending 2nd Approval' ? 'second' : 'first';
  };

  const [isAmendRejecting, setIsAmendRejecting] = React.useState(false);
  const [isAmendConfirming, setIsAmendConfirming] = React.useState(false);
  const [isRejectingAmendment, setIsRejectingAmendment] = React.useState(false);
  const [amendRejectReason, setAmendRejectReason] = React.useState('');
  const [hasPendingAmendment, setHasPendingAmendment] = React.useState<boolean>(false);
  const [showAmendmentModal, setShowAmendmentModal] = React.useState<boolean>(false);

  // Determine if there is still an active pending amendment request for this corporate
  useEffect(() => {
    const checkPendingAmendment = async () => {
      try {
        if (!corporateId) return;
        const list = await getAmendmentRequestsByCorporate(String(corporateId));
        const arr = Array.isArray(list) ? list : [];
        const withData = arr.filter((x: any) => {
          const data = (x && (x.amendment_data || x.amendmentData || null));
          if (!data || typeof data !== 'object') return false;
          return Object.keys(data).length > 0;
        });
        const pending = withData.some((x: any) => x.to_status === 'Amendment Requested');
        setHasPendingAmendment(pending);
      } catch (e) {
        // Fail-closed: if we cannot confirm, hide notice by default
        setHasPendingAmendment(false);
      }
    };
    checkPendingAmendment();
  }, [corporateId, formData.status, latestAmendLog?.timestamp]);

  // Show modal when status is Amendment Requested and there's a pending amendment
  useEffect(() => {
    if (formData.status === 'Amendment Requested' && hasPendingAmendment) {
      setShowAmendmentModal(true);
    }
  }, [formData.status, hasPendingAmendment]);

  const formatAmendNote = (note?: string) => {
    if (!note) return 'An amendment has been requested.';
    // Normalize HTML breaks to newlines first
    let cleaned = String(note).replace(/<br\s*\/?>(?=\s|$)/gi, '\n');
    // Remove common boilerplate phrases and submitted-by lines
    cleaned = cleaned
      // Remove variants of "Amendment request submitted"
      .replace(/\bAmendment\s+Request\s+Submitted\b[:.!\s]*/gi, '')
      .replace(/\bAmendment\s+request\s+submitted\b[:.!\s]*/gi, '')
      // Remove any lines that start with "Submitted by: ..."
      .replace(/^\s*Submitted\s+by:\s*.*$/gim, '')
      // Remove pipe-separated format with undefined values
      .replace(/\|Requested Changes:\s*undefined\||Reason:\s*undefined\||Submitted by:\s*undefined\|/gi, '')
      .replace(/\|Requested Changes:\s*[^|]*\||Reason:\s*[^|]*\||Submitted by:\s*[^|]*\|/gi, '')
      // Collapse multiple blank lines
      .replace(/\n{2,}/g, '\n')
      .trim();
    return cleaned;
  };

  const getAmendRequester = (note?: string | null): string | null => {
    if (!note) return null;
    const m = note.match(/Submitted by:\s*([^<\n]+)/i);
    return m?.[1]?.trim() || null;
  };

  const getSubmittedByName = (): string | null => {
    try {
      const prevStatus = latestAmendLog?.from_status;
      const contacts = (formData.contacts || []) as Contact[];

      const formatName = (first?: string, last?: string, email?: string | null) => {
        const name = [first || '', last || ''].join(' ').trim();
        return name || (email || null);
      };

      if (prevStatus === 'Pending 2nd Approval') {
        const byRole = contacts.find(c => c.system_role === 'secondary_approver');
        const byId = contacts.find(c => String(c.id) === String((formData as any).secondary_approver_id));
        const chosen = byRole || byId;
        if (chosen) return formatName(chosen.first_name, chosen.last_name, chosen.email);
        const sa = (formData as any).secondary_approver as (Partial<Contact> | undefined);
        if (sa) return formatName(sa.first_name as string, sa.last_name as string, sa.email as string);
        return null;
      }

      // Default to first approver (primary contact) for other statuses including Pending 1st Approval
      const primary = contacts[0];
      if (primary) return formatName(primary.first_name, primary.last_name, primary.email);
      return null;
    } catch {
      return null;
    }
  };

  const getSubmittedByRole = (): string | null => {
    try {
      const prevStatus = latestAmendLog?.from_status;
      const contacts = (formData.contacts || []) as Contact[];

      if (prevStatus === 'Pending 2nd Approval') {
        const byRole = contacts.find(c => c.system_role === 'secondary_approver');
        const byId = contacts.find(c => String(c.id) === String((formData as any).secondary_approver_id));
        const chosen = byRole || byId;
        if (chosen?.company_role) return chosen.company_role;
        const sa = (formData as any).secondary_approver as (Partial<Contact> | undefined);
        if (sa && (sa.company_role as string)) return sa.company_role as string;
        return 'Secondary Approver';
      }

      const primary = contacts[0];
      if (primary?.company_role) return primary.company_role;
      return 'First Approver';
    } catch {
      return null;
    }
  };

  const formatTimestamp = (ts?: string | null): string | null => {
    if (!ts) return null;
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kuala_Lumpur'
      });
    } catch {
      return ts as string;
    }
  };

  const viewAmendmentReview = async () => {
    try {
      const list = await getAmendmentRequestsByCorporate(String(corporateId));
      const arr = Array.isArray(list) ? list : [];
      if (!arr.length) {
        setErrorModalContent('No amendment requests found for this corporate.');
        setIsErrorModalVisible(true);
        return;
      }

      // Only consider entries that actually carry amendment data
      const withData = arr.filter((x: any) => {
        const data = (x && (x.amendment_data || x.amendmentData || null));
        if (!data) return false;
        if (typeof data !== 'object') return false;
        return Object.keys(data).length > 0;
      });

      if (!withData.length) {
        setErrorModalContent('No amendment entries with data found for this corporate.');
        setIsErrorModalVisible(true);
        return;
      }

      const preferred = withData.find((x: any) => x.to_status === 'Amendment Requested');
      const latest = preferred || [...withData].sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];
      if (latest?.id) {
        // For approvers, redirect to view-only page
        if (formMode === 'approve' || formMode === 'approve-second') {
          router.push(`/amendment/view/${latest.id}`);
        } else {
          // For CRT users, redirect to full review page
          router.push(`/crt/amendment/${latest.id}`);
        }
      } else {
        setErrorModalContent('Unable to locate amendment review entry.');
        setIsErrorModalVisible(true);
      }
    } catch (e) {
      setErrorModalContent(e instanceof Error ? e.message : 'Failed to open amendment review.');
      setIsErrorModalVisible(true);
    }
  };

  const getApproverLevelFromStatus = (status?: string | null): 'first approval' | 'second approval' => {
    return status === 'Pending 2nd Approval' ? 'second approval' : 'first approval';
  };

  return (
    <FormLayout 
      title={formTitle}
      showAmendRequestButton={formStep === 2 && (formMode === 'approve' || formMode === 'approve-second') && formData.status !== 'Rejected' && formData.status !== 'Cooling Period' && formData.status !== 'Approved'}
      amendRequestDisabled={String(formData.status) === 'Amendment Requested'}
      onAmendRequest={handleAmendRequest}
    >
        {(formData.status === 'Amendment Requested' && hasPendingAmendment) && (
          <div className="w-full mb-4 p-4 border border-orange-300 bg-orange-50 text-orange-800 rounded">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold mb-1">Amendment Requested</div>
                <div className="text-xs text-orange-900 mb-1">
                  {formatTimestamp(latestAmendLog?.timestamp)}
                </div>
                {getSubmittedByName() && (
                  <div className="text-xs text-orange-900 mb-2">
                    Amendment request submitted by: {getSubmittedByName()} {getSubmittedByRole() ? `(${getSubmittedByRole()})` : ''}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={viewAmendmentReview}
                  className="text-sm bg-ht-blue text-white px-3 py-2 rounded-md hover:bg-ht-blue-dark focus:outline-none focus:ring-2 focus:ring-ht-blue"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Amendment Request Notice Modal */}
        <AmendRequestModal
          isOpen={showAmendmentModal}
          onClose={() => setShowAmendmentModal(false)}
          amendmentData={{
            timestamp: latestAmendLog?.timestamp,
            submittedBy: getSubmittedByName() || undefined,
            submittedByRole: getSubmittedByRole() || undefined
          }}
          onViewAmendment={viewAmendmentReview}
        />

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
                  className="text-sm bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
                  disabled={!amendRejectReason.trim() || isRejectingAmendment}
                  onClick={async () => {
                    setIsRejectingAmendment(true);
                    try {
                      const prev = resolvePrevStatusForAmendment();
                      await updateCorporateStatus(corporateId, prev, `Amendment rejected by CRT: ${amendRejectReason}`);
                      await sendAmendRejectEmail(corporateId, amendRejectReason);
                      setIsAmendRejecting(false);
                      setAmendRejectReason('');
                      setSuccessModalContent({
                        title: 'Amendment Rejected',
                        message: `Reverted to ${prev}. Rejection email sent to the appropriate approver.`,
                      });
                      setIsSuccessModalVisible(true);
                    } catch (e) {
                      setErrorModalContent(`Failed to reject amendment: ${e instanceof Error ? e.message : String(e)}`);
                      setIsErrorModalVisible(true);
                    } finally {
                      setIsRejectingAmendment(false);
                    }
                  }}
                >
                  {isRejectingAmendment ? 'Processing...' : 'Reject Amendment'}
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
              if (formMode === 'approve' || formMode === 'approve-second') {
                // For approvers, refresh the page instead of closing
                window.location.reload();
              } else {
                // For other modes, close the form
                handleCloseCorporateForm();
              }
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
    </FormLayout>
  );
};

export default CorporateFormPage;