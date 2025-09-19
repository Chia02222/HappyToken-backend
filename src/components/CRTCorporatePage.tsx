"use client";

import { getCorporateById } from '../services/api';
import React, { useState, useEffect } from 'react';
import { Corporate, CorporateStatus, Contact } from '../types';
import StatusBadge from './common/StatusBadge';
import ChangeStatusModal from './modals/ChangeStatusModal';
import CopyLinkModal from './modals/CopyLinkModal';
import ResendModal from './modals/ResendModal';
import EllipsisMenu from './common/EllipsisMenu';

interface CorporatePageProps {
    onAddNew: () => void;
    onView: (corporate: Corporate) => void;
    onViewHistory: (corporateId: string) => void;
    corporates: Corporate[];
    updateStatus: (id: string, status: CorporateStatus, note?: string) => Promise<void>;
    corporateToAutoSendLink: Corporate | null;
    setCorporateToAutoSendLink: React.Dispatch<React.SetStateAction<Corporate | null>>;
    onDeleteCorporate: (id: string) => Promise<void>;
    onResendRegistrationLink: (id: string) => Promise<void>;
    onSendRegistrationLink: (id: string) => Promise<void>;
}

const CRTCorporatePage: React.FC<CorporatePageProps> = ({
    onAddNew,
    onView,
    onViewHistory,
    corporates,
    updateStatus,
    corporateToAutoSendLink,
    setCorporateToAutoSendLink,
    onDeleteCorporate,
    onResendRegistrationLink,
    onSendRegistrationLink,
}) => {
    const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(null);
    const [targetStatus, setTargetStatus] = useState<CorporateStatus | null>(null);
    const [isChangeStatusModalVisible, setIsChangeStatusModalVisible] = useState(false);
    const [isCopyLinkModalVisible, setIsCopyLinkModalVisible] = useState(false);
    const [isResendModalVisible, setIsResendModalVisible] = useState(false);
    const [remainingTimes, setRemainingTimes] = useState<{ [corporateId: string]: number }>({});

    useEffect(() => {
        if (corporateToAutoSendLink) {
            handleOpenCopyLinkModal(corporateToAutoSendLink);
            setCorporateToAutoSendLink(null);
        }
    }, [corporateToAutoSendLink, setCorporateToAutoSendLink]);

    const handleOpenCopyLinkModal = (corporate: Corporate) => {
        setSelectedCorporate(corporate);
        setIsCopyLinkModalVisible(true);
    };

    useEffect(() => {
        const intervals = new Map<string, NodeJS.Timeout>();

        corporates.forEach((corporate) => {
            if (corporate.status === 'Cooling Period' && corporate.cooling_period_end) {
                const endTime = new Date(corporate.cooling_period_end).getTime();

                const updateRemainingTime = () => {
                    const now = new Date().getTime();
                    const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
                    setRemainingTimes(prev => ({ ...prev, [corporate.id]: timeLeft }));

                    if (timeLeft <= 0) {
                        clearInterval(intervals.get(`countdown_${corporate.id}`));
                        // Trigger the fraud investigation logic if needed
                        getCorporateById(corporate.id).then(details => {
                            if (details.contacts.some((c: Contact) => c.contact_number === '0123456789')) {
                                updateStatus(corporate.id, 'Under Fraud Investigation');
                            }
                        });
                    }
                };

                // Initial call
                updateRemainingTime();

                // Set up countdown interval
                const countdownInterval = setInterval(updateRemainingTime, 1000);
                intervals.set(`countdown_${corporate.id}`, countdownInterval);

                // Set up polling interval to check for status changes
                const pollingInterval = setInterval(async () => {
                    try {
                        const updatedCorporate = await getCorporateById(corporate.id);
                        if (updatedCorporate.status !== 'Cooling Period') {
                            clearInterval(intervals.get(`polling_${corporate.id}`));
                            clearInterval(intervals.get(`countdown_${corporate.id}`));
                            setRemainingTimes(prev => ({ ...prev, [corporate.id]: 0 }));
                        }
                    } catch (error) {
                        console.error('Failed to poll corporate status:', error);
                    }
                }, 3000);
                intervals.set(`polling_${corporate.id}`, pollingInterval);
            }
        });

        return () => {
            intervals.forEach((interval) => clearInterval(interval));
        };
    }, [corporates, updateStatus]);





    

    const handleCloseModals = () => {
        setIsChangeStatusModalVisible(false);
        setIsCopyLinkModalVisible(false);
        setIsResendModalVisible(false);
        setSelectedCorporate(null);
        setTargetStatus(null);
    };

    const handleSaveStatusChange = async (note?: string) => {
        if (selectedCorporate && targetStatus) {
            await updateStatus(selectedCorporate.id, targetStatus, note);
            handleCloseModals();
        }
    };

    const renderActions = (corporate: Corporate) => {
        const remainingTime = remainingTimes[corporate.id];

        switch (corporate.status) {


            case 'Cooling Period':
                return (
                    <span className="text-gray-500 text-xs">
                        Cooling Period (Auto-processing in {remainingTime !== undefined ? remainingTime : '...'}s...)
                    </span>
                );
            case 'Rejected':
                return <span className="text-gray-400 text-xs">No actions</span>;
            case 'Closed':
                return <span className="text-gray-400 text-xs">No actions</span>;
            default:
                return <span className="text-gray-400 text-xs">No actions</span>;
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h2 className="text-lg font-semibold text-ht-gray-dark">CRT Corporate Accounts</h2>
                    <button
                        onClick={onAddNew}
                        className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark transition-colors"
                    >
                        Add New CRT Corporate
                    </button>
                </div>
                <div className="overflow-auto flex-grow">
                    <table className="min-w-full divide-y divide-gray-200 h-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Company Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reg. Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Remark
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {corporates.map((corporate) => (
                                <tr
                                    key={corporate.id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => onView(corporate)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {corporate.company_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {corporate.reg_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatTimestamp(corporate.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <StatusBadge status={corporate.status} />
                                    </td>
                                    <td
                                        className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {renderActions(corporate)}
                                    </td>
                                    <td
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => onViewHistory(corporate.id)}
                                            className="text-sm text-ht-blue hover:text-ht-blue-dark font-semibold"
                                        >
                                            View
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <EllipsisMenu
                                            items={[
                                                {
                                                    label: 'Copy Link',
                                                    onClick: () => handleOpenCopyLinkModal(corporate),
                                                },
                                                {
                                                    label: 'Send to Approval',
                                                    onClick: () => onSendRegistrationLink(corporate.id),
                                                },
                                                {
                                                    label: 'Delete',
                                                    onClick: () => onDeleteCorporate(corporate.id),
                                                },
                                            ]}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ChangeStatusModal
                isOpen={isChangeStatusModalVisible}
                onClose={handleCloseModals}
                corporate={selectedCorporate}
                targetStatus={targetStatus}
                onSave={handleSaveStatusChange}
            />

            <CopyLinkModal
                isOpen={isCopyLinkModalVisible}
                onClose={handleCloseModals}
                corporate={selectedCorporate}
            />

            <ResendModal
                isOpen={isResendModalVisible}
                onClose={handleCloseModals}
                corporate={selectedCorporate}
                onResend={onResendRegistrationLink}
            />
        </>
    );
};

export default CRTCorporatePage;