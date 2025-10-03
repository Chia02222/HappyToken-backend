"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../components/Dashboard';
import CRTCorporatePage from '../components/CRTCorporatePage';
import HistoryLogModal from '../components/modals/HistoryLogModal';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { Page, Corporate, CorporateDetails, CorporateStatus, Contact} from '../types';
import { getCorporates, getCorporateById, updateCorporateStatus, addRemark, deleteCorporate, sendEcommericialTermlink, submitCorporateForFirstApproval } from '../services/api';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import SuccessModal from '../components/modals/SuccessModal';
import ErrorMessageModal from '../components/modals/ErrorMessageModal';
import LoginPage from '../components/LoginPage';
import { useRouter, useSearchParams } from 'next/navigation';
import { logError, logInfo } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';


const App: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState<Page>('CRT Corporate'); // Default to CRT Corporate
  const [userRole, setUserRole] = useState<'admin' | 'client'>('admin'); // Default to admin
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state
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
  const [isLoadingCorporates, setIsLoadingCorporates] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [isSavingRemark, setIsSavingRemark] = useState(false);

  // Login handler
  const handleLogin = (role: 'admin' | 'client') => {
    setUserRole(role);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('auth_user_role', role);
      localStorage.setItem('auth_authenticated', 'true');
    } catch {}
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('admin'); // Reset to default
    try {
      localStorage.removeItem('auth_authenticated');
      localStorage.removeItem('auth_user_role');
    } catch {}
  };

  const fetchCorporates = async () => {
    try {
      setIsLoadingCorporates(true);
      const data = await getCorporates();
      setCorporates(data);
    } catch (error) {
      const errorMessage = errorHandler.handleApiError(error as Error, { component: 'App', action: 'fetchCorporates' });
      logError("Failed to fetch corporates", { error: errorMessage }, 'App');
    } finally {
      setIsLoadingCorporates(false);
    }
  };

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('auth_authenticated') === 'true';
      const savedRole = (localStorage.getItem('auth_user_role') as 'admin' | 'client') || 'admin';
      if (savedAuth) {
        setUserRole(savedRole);
        setIsAuthenticated(true);
      }
    } catch {}
    fetchCorporates();
  }, []);

  // Handle page parameter from URL
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam && ['Dashboard', 'RFQ', 'Merchant', 'CRT Corporate', 'API', 'Configuration', 'Management', 'Reports'].includes(pageParam)) {
      setCurrentPage(pageParam as Page);
    }
  }, [searchParams]);

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
        setIsUpdatingStatus(true);
        await updateCorporateStatus(id, status, note);
        await fetchCorporates();
    } catch (error) {
        const errorMessage = errorHandler.handleApiError(error as Error, { component: 'App', action: 'updateStatus', corporateId: id });
        logError(`Failed to update status for corporate ${id}`, { error: errorMessage }, 'App');
    } finally {
        setIsUpdatingStatus(false);
    }
  };

  const handleViewHistory = async (corporateId: string) => {
    try {
      setIsLoadingHistory(true);
      const fullData = await getCorporateById(corporateId);
      setSelectedCorporateForHistory(fullData);
      setIsHistoryModalVisible(true);
    } catch (error) {
      const errorMessage = errorHandler.handleApiError(error as Error, { component: 'App', action: 'fetchHistory', corporateId });
      logError(`Failed to fetch history for corporate ${corporateId}`, { error: errorMessage }, 'App');
    } finally {
      setIsLoadingHistory(false);
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
        const errorMessage = errorHandler.handleApiError(error as Error, { component: 'App', action: 'deleteCorporate', corporateId: corporateToDeleteId });
        logError(`Failed to delete corporate ${corporateToDeleteId}`, { error: errorMessage }, 'App');
      } finally {
        setIsConfirmDeleteModalVisible(false);
        setCorporateToDeleteId(null);
      }
    }
  };

  const handleSendEcommercialTermLink = async (id: string) => {
    try {
      setIsSendingLink(true);
      const corporate = await getCorporateById(id);
      if (!corporate || !corporate.contacts || corporate.contacts.length === 0) {
      setErrorModalContent(`No contact information found for corporate ${id}. Cannot send approver link.`);
        setIsErrorModalVisible(true);
        return;
      }

      const hasValidEmail = corporate.contacts.some((contact: Contact) => contact.email && contact.email !== 'N/A');

      if (!hasValidEmail) {
        setErrorModalContent(`No valid contact email found for corporate ${id}. Cannot send approver link.`);
        setIsErrorModalVisible(true);
        return;
      }
      // Route based on status: Draft/Pending 1st -> first approver; Pending 2nd -> second approver
      if (corporate.status === 'Pending 2nd Approval') {
        await sendEcommericialTermlink(id, 'second');
      } else {
        await sendEcommericialTermlink(id, 'first');
        await submitCorporateForFirstApproval(id);
      }
      await fetchCorporates(); // Refresh the list of corporates
      setSuccessModalContent({
        title: 'Success',
        message: `E-Commercial Terms link has been sent to the approver for corporate ${id}.`,
      });
      setIsSuccessModalVisible(true);
    } catch (error) {
      const errorMessage = errorHandler.handleApiError(error as Error, { component: 'App', action: 'sendApproverLink', corporateId: id });
      setErrorModalContent(`Failed to send approver link for corporate ${id}. Please try again.`);
      setIsErrorModalVisible(true);
      logError(`Failed to resend registration link for corporate ${id}`, { error: errorMessage }, 'App');
    } finally {
      setIsSendingLink(false);
    }
  };

  const handleSaveRemark = async (corporateId: string, note: string) => {
    try {
      setIsSavingRemark(true);
      // Fetch current corporate data to get its status
      const currentCorporateData = await getCorporateById(corporateId);
      const currentStatus = currentCorporateData?.status;

      await addRemark(corporateId, note, currentStatus, currentStatus); // Pass current status
      // Refresh history data
      const fullData = await getCorporateById(corporateId);
      setSelectedCorporateForHistory(fullData);
      await fetchCorporates(); // Also refresh the main list
    } catch (error) {
      const errorMessage = errorHandler.handleApiError(error as Error, { component: 'App', action: 'saveRemark', corporateId });
      logError(`Failed to save remark for corporate ${corporateId}`, { error: errorMessage }, 'App');
    } finally {
      setIsSavingRemark(false);
    }
  };
  const renderMainContent = () => {
    switch (currentPage) {
      case 'CRT Corporate':
        return (
            <ErrorBoundary>
                <CRTCorporatePage 
                    onAddNew={handleAddNewCorporate}
                    onView={handleViewCorporateWrapper}
                    onViewHistory={handleViewHistory}
                    corporates={corporates}
                    updateStatus={handleUpdateStatus}
                    corporateToAutoSendLink={corporateToAutoSendLink}
                    setCorporateToAutoSendLink={setCorporateToAutoSendLink}
                    onDeleteCorporate={handleDeleteCorporate}
                    onSendEcommericialTermlink={handleSendEcommercialTermLink}
                    fetchCorporates={fetchCorporates}
                    isLoadingCorporates={isLoadingCorporates}
                    isUpdatingStatus={isUpdatingStatus}
                    isLoadingHistory={isLoadingHistory}
                    isSendingLink={isSendingLink}
                    isSavingRemark={isSavingRemark}
                />
            </ErrorBoundary>
        );
      case 'Dashboard':
      default:
        return <Dashboard />;
    }
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
      <MainLayout
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
        userRole={userRole}
        onLogout={handleLogout}
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
    </ErrorBoundary>
  );
};

export default App;
