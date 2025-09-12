"use client";

import React, { useState, useEffect } from 'react';
import { Corporate, CorporateStatus } from '../types';
import StatusBadge from './common/StatusBadge';
import ChangeStatusModal from './modals/ChangeStatusModal';
import SendLinkModal from './modals/SendLinkModal';

interface CorporatePageProps {
    onAddNew: () => void;
    onView: (corporate: Corporate) => void;
    onFirstApprove: (corporate: Corporate) => void;
    onSecondApprove: (corporate: Corporate) => void;
    onViewHistory: (corporateId: string) => void;
    corporates: Corporate[];
    updateStatus: (id: string, status: CorporateStatus, note?: string) => Promise<void>;
    corporateToAutoSendLink: Corporate | null;
    setCorporateToAutoSendLink: React.Dispatch<React.SetStateAction<Corporate | null>>;
}

const CorporatePage: React.FC<CorporatePageProps> = ({
    onAddNew,
    onView,
    onFirstApprove,
    onSecondApprove,
    onViewHistory,
    corporates,
    updateStatus,
    corporateToAutoSendLink,
    setCorporateToAutoSendLink,
}) => {
    const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(null);
    const [targetStatus, setTargetStatus] = useState<CorporateStatus | null>(null);
    const [isChangeStatusModalVisible, setIsChangeStatusModalVisible] = useState(false);
    const [isSendLinkModalVisible, setIsSendLinkModalVisible] = useState(false);

    useEffect(() => {
        if (corporateToAutoSendLink) {
            handleOpenSendLinkModal(corporateToAutoSendLink);
            setCorporateToAutoSendLink(null);
        }
    }, [corporateToAutoSendLink, setCorporateToAutoSendLink]);

    const handleOpenChangeStatusModal = (corporate: Corporate, status: CorporateStatus) => {
        setSelectedCorporate(corporate);
        setTargetStatus(status);
        setIsChangeStatusModalVisible(true);
    };

    const handleOpenSendLinkModal = (corporate: Corporate) => {
        setSelectedCorporate(corporate);
        setIsSendLinkModalVisible(true);
    };

    const handleCloseModals = () => {
        setIsChangeStatusModalVisible(false);
        setIsSendLinkModalVisible(false);
        setSelectedCorporate(null);
        setTargetStatus(null);
    };

    const handleSaveStatusChange = (corporateId: string, status: CorporateStatus, note: string) => {
        updateStatus(corporateId, status, note);
        handleCloseModals();
    };

    const handleSendLink = (corporateId: string) => {
        updateStatus(corporateId, 'Send', 'Registration link generated and status updated.');
        handleCloseModals();
    };

    const renderActions = (corporate: Corporate) => {
        switch (corporate.status) {
            case 'New':
                return (
                    <button
                        onClick={() => handleOpenSendLinkModal(corporate)}
                        className="text-sm text-ht-blue hover:text-ht-blue-dark font-semibold"
                    >
                        Send Link
                    </button>
                );
            case 'Send':
            case 'Pending 1st Approval':
                return (
                    <button
                        onClick={() => onFirstApprove(corporate)}
                        className="text-sm text-ht-blue hover:text-ht-blue-dark font-semibold"
                    >
                        Approve (1st)
                    </button>
                );
            case 'Pending 2nd Approval':
                return (
                    <button
                        onClick={() => onSecondApprove(corporate)}
                        className="text-sm text-ht-blue hover:text-ht-blue-dark font-semibold"
                    >
                        Approve (2nd)
                    </button>
                );
            case 'Cooling Period':
                return (
                    <div className="relative">
                        <select
                            defaultValue=""
                            onChange={(e) => {
                                const newStatus = e.target.value as CorporateStatus;
                                if (['Approved', 'Rejected'].includes(newStatus)) {
                                    updateStatus(corporate.id, newStatus);
                                }
                                e.target.value = '';
                            }}
                            className="text-sm border border-gray-300 rounded-md p-2 focus:ring-ht-blue focus:border-ht-blue bg-white"
                            aria-label="Select action for cooling period account"
                        >
                            <option value="" disabled>
                                Select Action...
                            </option>
                            <option value="Approved">Approve</option>
                            <option value="Rejected">Reject</option>
                        </select>
                    </div>
                );
            case 'Rejected':
                return (
                    <div className="relative">
                        <select
                            defaultValue=""
                            onChange={(e) => {
                                const newStatus = e.target.value as CorporateStatus;
                                if (['Resolved', 'Closed', 'Reopened'].includes(newStatus)) {
                                    handleOpenChangeStatusModal(corporate, newStatus);
                                }
                                e.target.value = '';
                            }}
                            className="text-sm border border-gray-300 rounded-md p-2 focus:ring-ht-blue focus:border-ht-blue bg-white"
                            aria-label="Select action for rejected account"
                        >
                            <option value="" disabled>
                                Select Action...
                            </option>
                            <option value="Resolved">Resolve</option>
                            <option value="Closed">Close</option>
                            <option value="Reopened">Reopen</option>
                        </select>
                    </div>
                );
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
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h2 className="text-lg font-semibold text-ht-gray-dark">Corporate Accounts</h2>
                    <button
                        onClick={onAddNew}
                        className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark transition-colors"
                    >
                        Add New Corporate
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
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

            <SendLinkModal
                isOpen={isSendLinkModalVisible}
                onClose={handleCloseModals}
                corporate={selectedCorporate}
                onSend={handleSendLink}
            />
        </>
    );
};

export default CorporatePage;
