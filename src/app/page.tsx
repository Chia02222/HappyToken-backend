"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import FormLayout from '../components/layout/FormLayout';
import Dashboard from '../components/Dashboard';
import CorporatePage from '../components/CorporatePage';
import CorporateForm from '../components/CorporateForm';
import CommercialTermsForm from '../components/CommercialTermsForm';
import ECommercialTermsForm from '../components/ECommercialTermsForm';
import HistoryLogModal from '../components/modals/HistoryLogModal';
import { Page, Corporate, CorporateDetails, CorporateStatus } from '../types';
import { getCorporates, getCorporateById, createCorporate, updateCorporate, updateCorporateStatus, addRemark } from '../services/api';

const INITIAL_CORPORATE_FORM_DATA: CorporateDetails = {
    id: 0,
    company_name: '',
    reg_number: '',
    status: 'New',
    created_at: '',
    investigation_log: [],
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
            id: Date.now(),
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
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [isCorporateFormVisible, setIsCorporateFormVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState<CorporateDetails>(INITIAL_CORPORATE_FORM_DATA);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [corporateToAutoSendLink, setCorporateToAutoSendLink] = useState<Corporate | null>(null);
  const [editingCorporate, setEditingCorporate] = useState<Corporate | null>(null);
  const [selectedCorporateForHistory, setSelectedCorporateForHistory] = useState<CorporateDetails | null>(null);
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'approve' | 'approve-second'>('new');

  const fetchCorporates = async () => {
    try {
      const data = await getCorporates();
      setCorporates(data);
    } catch (error) {
      console.error("Failed to fetch corporates:", error);
    }
  };

  useEffect(() => {
    fetchCorporates();
  }, []);

  const handleAddNewCorporate = () => {
    setEditingCorporate(null);
    setFormMode('new');
    setFormData(INITIAL_CORPORATE_FORM_DATA);
    setFormStep(1);
    setIsCorporateFormVisible(true);
  };

  const openFormForCorporate = async (corporate: Corporate, mode: 'edit' | 'approve' | 'approve-second') => {
    try {
      const fullFormData = await getCorporateById(corporate.id);
      setEditingCorporate(corporate);
      setFormMode(mode);
      setFormData({
        ...INITIAL_CORPORATE_FORM_DATA,
        ...fullFormData,
      });
      setFormStep(1);
      setIsCorporateFormVisible(true);
    } catch (error) {
      console.error(`Failed to fetch corporate ${corporate.id}:`, error);
    }
  };

  const handleViewCorporate = (corporate: Corporate) => {
    openFormForCorporate(corporate, 'edit');
  };

  const handleFirstApproval = (corporate: Corporate) => {
    openFormForCorporate(corporate, 'approve');
  };

  const handleSecondApproval = (corporate: Corporate) => {
    openFormForCorporate(corporate, 'approve-second');
  };

  const handleCloseCorporateForm = () => {
    setIsCorporateFormVisible(false);
    setEditingCorporate(null);
    setFormData(INITIAL_CORPORATE_FORM_DATA);
  };

  const handleSaveCorporate = async (formData: CorporateDetails, action: 'submit' | 'send' | 'save') => {
    try {
      if (formMode === 'approve-second' && action === 'submit') {
        formData.second_approval_confirmation = true;
      } else if (formMode === 'approve' && action === 'submit') {
        formData.first_approval_confirmation = true;
      }

      const { secondary_approver, contacts, subsidiaries, investigation_log, investigationLog, contactIdsToDelete, subsidiaryIdsToDelete, ...corporateData } = formData;

      const dataToSend = {
        ...corporateData,
        contacts,
        subsidiaries,
        contactIdsToDelete,
        subsidiaryIdsToDelete,
      };

      let savedCorporateId = editingCorporate?.id;

      if (editingCorporate) {
        await updateCorporate(editingCorporate.id, dataToSend);
      } else {
        const newCorporate = await createCorporate(dataToSend);
        savedCorporateId = newCorporate.id;
        if (action === 'send') {
            await updateCorporateStatus(newCorporate.id, 'Send', 'Registration link generated and status updated.');
            setCorporateToAutoSendLink(newCorporate);
        }
      }

      if (formMode === 'approve' && action === 'submit' && savedCorporateId) {
        await updateCorporateStatus(savedCorporateId, 'Pending 2nd Approval', 'First approval completed.');
      } else if (formMode === 'approve-second' && action === 'submit' && savedCorporateId) {
        await updateCorporateStatus(savedCorporateId, 'Cooling Period', 'Second approval completed.');
      }

      await fetchCorporates();
    } catch (error) {
      console.error("Failed to save corporate:", error);
    }
    handleCloseCorporateForm();
  };
  
  const handleUpdateStatus = async (id: number, status: CorporateStatus, note?: string) => {
    try {
        await updateCorporateStatus(id, status, note);
        await fetchCorporates();
    } catch (error) {
        console.error(`Failed to update status for corporate ${id}:`, error);
    }
  };

  const handleViewHistory = async (corporateId: number) => {
    try {
      const fullData = await getCorporateById(corporateId);
      setSelectedCorporateForHistory(fullData);
      setIsHistoryModalVisible(true);
    } catch (error) {
      console.error(`Failed to fetch history for corporate ${corporateId}:`, error);
    }
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalVisible(false);
    setSelectedCorporateForHistory(null);
  };

  const handleSaveRemark = async (corporateId: number, note: string) => {
    try {
      await addRemark(corporateId, note);
      // Refresh history data
      const fullData = await getCorporateById(corporateId);
      setSelectedCorporateForHistory(fullData);
      await fetchCorporates(); // Also refresh the main list
    } catch (error) {
      console.error(`Failed to save remark for corporate ${corporateId}:`, error);
    }
  };

  const renderMainContent = () => {
    if (isCorporateFormVisible) {
        const getBaseTitle = () => {
            if (formMode === 'new') return 'New Corporate Account';
            if (formMode === 'approve') return 'First Approval';
            if (formMode === 'approve-second') return 'Second Approval';
            if (editingCorporate) return 'View / Edit Corporate Account';
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
                  formData={formData as any}
                  setFormData={setFormData as any}
                  onSaveCorporate={handleSaveCorporate}
                />
              ) : formStep === 2 ? (
                <CommercialTermsForm
                  onCloseForm={handleCloseCorporateForm}
                  setFormStep={setFormStep}
                  formData={formData as any}
                  setFormData={setFormData as any}
                  onSaveCorporate={handleSaveCorporate}
                />
              ) : (
                 <ECommercialTermsForm
                  onCloseForm={handleCloseCorporateForm}
                  setFormStep={setFormStep}
                  formData={formData as any}
                  setFormData={setFormData as any}
                  onSaveCorporate={handleSaveCorporate}
                />
              )}
          </FormLayout>
        );
    }

    switch (currentPage) {
      case 'Corporate':
        return (
            <CorporatePage 
                onAddNew={handleAddNewCorporate}
                onView={handleViewCorporate}
                onFirstApprove={handleFirstApproval}
                onSecondApprove={handleSecondApproval}
                onViewHistory={handleViewHistory}
                corporates={corporates}
                setCorporates={setCorporates}
                updateStatus={handleUpdateStatus}
                corporateToAutoSendLink={corporateToAutoSendLink}
                setCorporateToAutoSendLink={setCorporateToAutoSendLink}
            />
        );
      case 'Dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
    >
      {renderMainContent()}
      <HistoryLogModal
        isOpen={isHistoryModalVisible}
        onClose={handleCloseHistoryModal}
        corporate={selectedCorporateForHistory}
        onSave={handleSaveRemark}
      />
    </MainLayout>
  );
};

export default App;
