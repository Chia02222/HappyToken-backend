"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../components/Dashboard';
import CRTCorporatePage from '../components/CRTCorporatePage';
import HistoryLogModal from '../components/modals/HistoryLogModal';
import { Page, Corporate, CorporateDetails, CorporateStatus, Contact} from '../types';
import { getCorporates, getCorporateById, createCorporate, updateCorporate, updateCorporateStatus, addRemark, deleteCorporate, resendRegistrationLink } from '../services/api';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import SuccessModal from '../components/modals/SuccessModal';
import ErrorMessageModal from '../components/modals/ErrorMessageModal';
import { useRouter } from 'next/navigation';

let clientSideIdCounter = 0;
const generateClientSideId = (): string => {
  clientSideIdCounter -= 1; // Use negative numbers to avoid collision with actual IDs
  return `client-${clientSideIdCounter}`;
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('CRT Corporate'); // Default to CRT Corporate
  const [userRole, setUserRole] = useState<'admin' | 'client'>('admin'); // Default to admin
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [corporateToAutoSendLink, setCorporateToAutoSendLink] = useState<Corporate | null>(null);
  const [selectedCorporateForHistory, setSelectedCorporateForHistory] = useState<CorporateDetails | null>(null);
  const [isConfirmDeleteModalVisible, setIsConfirmDeleteModalVisible] = useState(false);
  const [corporateToDeleteId, setCorporateToDeleteId] = useState<string | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successModalContent, setSuccessModalContent] = useState({ title: '', message: '' });
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState('');

  const router = useRouter();

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
    router.push('/corporate/new');
  };

  const openFormForCorporate = async (corporate: Corporate, mode: 'edit' | 'approve' | 'approve-second') => {
    router.push(`/corporate/${corporate.id}?mode=${mode}`);
  };

  const handleViewCorporateWrapper = (corporate: Corporate) => {
    openFormForCorporate(corporate, 'edit');
  };
  
  const handleUpdateStatus = async (id: string, status: CorporateStatus, note?: string) => {
    try {
        await updateCorporateStatus(id, status, note);
        await fetchCorporates();
    } catch (error) {
        console.error(`Failed to update status for corporate ${id}:`, error);
    }
  };

  const handleViewHistory = async (corporateId: string) => {
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

  const handleDeleteCorporate = async (id: string) => {
    setCorporateToDeleteId(id);
    setIsConfirmDeleteModalVisible(true);
  };

  const confirmDeleteCorporate = async () => {
    if (corporateToDeleteId) {
      try {
        await deleteCorporate(corporateToDeleteId);
        fetchCorporates();
      } catch (error) {
        console.error(`Failed to delete corporate ${corporateToDeleteId}:`, error);
      } finally {
        setIsConfirmDeleteModalVisible(false);
        setCorporateToDeleteId(null);
      }
    }
  };

  const handleResendRegistrationLink = async (id: string) => {
    try {
      const corporate = await getCorporateById(id);
      if (!corporate || !corporate.contacts || corporate.contacts.length === 0) {
        setErrorModalContent(`No contact information found for corporate ${id}. Cannot send registration link.`);
        setIsErrorModalVisible(true);
        return;
      }

      const hasValidEmail = corporate.contacts.some((contact: Contact) => contact.email && contact.email !== 'N/A');

      if (!hasValidEmail) {
        setErrorModalContent(`No valid contact email found for corporate ${id}. Cannot send registration link.`);
        setIsErrorModalVisible(true);
        return;
      }

      await resendRegistrationLink(id);
      await updateCorporateStatus(id, 'Sent', 'Registration link sent.');
      await fetchCorporates(); // Refresh the list of corporates
      const corporateFormLink = `${window.location.origin}/corporate/${id}?mode=approve`;
      setSuccessModalContent({
        title: 'Success',
        message: `Registration link has been successfully resent for corporate ${id}.`,
      });
      setIsSuccessModalVisible(true);
    } catch (error) {
      setErrorModalContent(`Failed to resend registration link for corporate ${id}. Please try again.`);
      setIsErrorModalVisible(true);
      console.error(`Failed to resend registration link for corporate ${id}:`, error);
    }
  };

  const handleSaveRemark = async (corporateId: string, note: string) => {
    try {
      // Fetch current corporate data to get its status
      const currentCorporateData = await getCorporateById(corporateId);
      const currentStatus = currentCorporateData?.status;

      await addRemark(corporateId, note, currentStatus, currentStatus); // Pass current status
      // Refresh history data
      const fullData = await getCorporateById(corporateId);
      console.log('fullData after saving remark:', fullData);
      setSelectedCorporateForHistory(fullData);
      await fetchCorporates(); // Also refresh the main list
    } catch (error) {
      console.error(`Failed to save remark for corporate ${corporateId}:`, error);
    }
  };
  const renderMainContent = () => {
    switch (currentPage) {
      case 'CRT Corporate':
        return (
            <CRTCorporatePage 
                onAddNew={handleAddNewCorporate}
                onView={handleViewCorporateWrapper}
                onViewHistory={handleViewHistory}
                corporates={corporates}
                updateStatus={handleUpdateStatus}
                corporateToAutoSendLink={corporateToAutoSendLink}
                setCorporateToAutoSendLink={setCorporateToAutoSendLink}
                onDeleteCorporate={handleDeleteCorporate}
                onResendRegistrationLink={handleResendRegistrationLink}
                onSendRegistrationLink={handleResendRegistrationLink}
                fetchCorporates={fetchCorporates}
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
      userRole={userRole}
    >
      {renderMainContent()}
      <HistoryLogModal
        isOpen={isHistoryModalVisible}
        onClose={handleCloseHistoryModal}
        corporate={selectedCorporateForHistory}
        onSave={handleSaveRemark}
      />
      <ConfirmationModal
        isOpen={isConfirmDeleteModalVisible}
        onClose={() => setIsConfirmDeleteModalVisible(false)}
        onConfirm={confirmDeleteCorporate}
        title="Confirm Deletion"
        message="Are you sure you want to delete this corporate account? This action cannot be undone."
      />
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
    </MainLayout>
  );
};

export default App;
