"use client";

import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import FormLayout from '../components/layout/FormLayout';
import Dashboard from '../components/Dashboard';
import CorporatePage from '../components/CorporatePage';
import CorporateForm from '../components/CorporateForm';
import CommercialTermsForm from '../components/CommercialTermsForm';
import ECommercialTermsForm from '../components/ECommercialTermsForm';
import { Page, Corporate } from '../types';
import { CORPORATES_DATA, INITIAL_CORPORATE_FORM_DATA, MOCK_FORM_DATA, CORPORATE_DETAILS_DATA } from '../constants';

// Define the form data type to match the actual structure
type FormData = typeof INITIAL_CORPORATE_FORM_DATA;


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [isCorporateFormVisible, setIsCorporateFormVisible] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_CORPORATE_FORM_DATA);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [corporates, setCorporates] = useState<Corporate[]>(CORPORATES_DATA);
  const [corporateToAutoSendLink, setCorporateToAutoSendLink] = useState<Corporate | null>(null);
  const [editingCorporate, setEditingCorporate] = useState<Corporate | null>(null);
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'approve' | 'approve-second'>('new');


  const handleAddNewCorporate = () => {
    setEditingCorporate(null);
    setFormMode('new');
    setFormData(INITIAL_CORPORATE_FORM_DATA);
    setFormStep(1);
    setIsCorporateFormVisible(true);
  };

  const handleViewCorporate = (corporate: Corporate) => {
    const fullFormData = CORPORATE_DETAILS_DATA[corporate.id] || MOCK_FORM_DATA;
    setEditingCorporate(corporate);
    setFormMode('edit');
    setFormData(fullFormData);
    setFormStep(1);
    setIsCorporateFormVisible(true);
  };

  const handleFirstApproval = (corporate: Corporate) => {
    const fullFormData = CORPORATE_DETAILS_DATA[corporate.id] || MOCK_FORM_DATA;
    setEditingCorporate(corporate);
    setFormMode('approve');
    setFormData(fullFormData);
    setFormStep(1);
    setIsCorporateFormVisible(true);
  };

  const handleSecondApproval = (corporate: Corporate) => {
    const fullFormData = CORPORATE_DETAILS_DATA[corporate.id] || MOCK_FORM_DATA;
    setEditingCorporate(corporate);
    setFormMode('approve-second');
    setFormData(fullFormData);
    setFormStep(1);
    setIsCorporateFormVisible(true);
  };

  const handleCloseCorporateForm = () => {
    setIsCorporateFormVisible(false);
    setEditingCorporate(null);
    setFormData(INITIAL_CORPORATE_FORM_DATA);
  };

  const handleSaveCorporate = (formData: Record<string, any>, action: 'submit' | 'send' | 'save') => {
    if (editingCorporate) {
        // Update existing corporate
        const updatedCorporate = { ...editingCorporate };
        updatedCorporate.companyName = formData.companyName;
        updatedCorporate.regNumber = formData.regNumber;
        
        if (action === 'submit') {
            if (formMode === 'approve') {
                updatedCorporate.status = 'Pending 2nd Approval';
            } else if (formMode === 'approve-second') {
                updatedCorporate.status = 'Cooling Period';
            }
        }

        setCorporates(prev => prev.map(c => 
            c.id === editingCorporate.id ? updatedCorporate : c
        ));
    } else {
        // Add new corporate
        const newStatus = action === 'send' ? 'Send' : 'New';
        const newCorporate: Corporate = {
            id: Date.now(),
            companyName: formData.companyName,
            regNumber: formData.regNumber,
            status: newStatus,
            createdAt: new Date().toISOString().split('T')[0],
            investigationLog: [],
        };
        
        setCorporates(prev => [...prev, newCorporate]);

        if (action === 'send') {
            setCorporateToAutoSendLink(newCorporate);
        }
    }
    handleCloseCorporateForm();
  };

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

  // Default layout for the dashboard and other pages.
  const renderContent = () => {
    switch (currentPage) {
      case 'Corporate':
        return (
            <CorporatePage 
                onAddNew={handleAddNewCorporate}
                onView={handleViewCorporate}
                onFirstApprove={handleFirstApproval}
                onSecondApprove={handleSecondApproval}
                corporates={corporates}
                setCorporates={setCorporates}
                corporateToAutoSendLink={corporateToAutoSendLink}
                setCorporateToAutoSendLink={setCorporateToAutoSendLink}
            />
        );
      // In the future, other page components like RFQ, Merchant, etc., would be handled here.
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
      {renderContent()}
    </MainLayout>
  );
};

export default App;
