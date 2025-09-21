"use client";

import React, { useState } from 'react';
import { Corporate, CorporateStatus } from '../types';
import StatusBadge from './common/StatusBadge';
import ChangeStatusModal from './modals/ChangeStatusModal';
import CopyLinkModal from './modals/CopyLinkModal';
import ResendModal from './modals/ResendModal';
import EllipsisMenu from './common/EllipsisMenu';


interface ApproverCorporatePageProps {
    onAddNew: () => void;
    onView: (corporate: Corporate) => void;
    onViewHistory: (corporateId: string) => void;
    corporates: Corporate[];
    updateStatus: (id: string, status: CorporateStatus, note?: string) => Promise<void>;
    onDeleteCorporate: (id: string) => Promise<void>;
    onResendRegistrationLink: (id: string) => Promise<void>;
    onSendRegistrationLink: (id: string) => Promise<void>;
}

const ApproverCorporatePage: React.FC<ApproverCorporatePageProps> = ({
    onAddNew,
    onView,
    onViewHistory,
    corporates,
    updateStatus,
    onDeleteCorporate,
    onResendRegistrationLink,
    onSendRegistrationLink,
}) => {
    const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(null);
    const [targetStatus, setTargetStatus] = useState<CorporateStatus | null>(null);
    const [isChangeStatusModalVisible, setIsChangeStatusModalVisible] = useState(false);
    const [isCopyLinkModalVisible, setIsCopyLinkModalVisible] = useState(false);
    const [isResendModalVisible, setIsResendModalVisible] = useState(false);
    const [isRejectingStatus, setIsRejectingStatus] = useState(false); // New state variable

    const handleOpenChangeStatusModal = (corporate: Corporate, status: CorporateStatus) => {
        setSelectedCorporate(corporate);
        setTargetStatus(status);
        setIsRejectingStatus(status === 'Rejected' || status === 'Under Fraud Investigation');
        setIsChangeStatusModalVisible(true);
    };

    const handleOpenCopyLinkModal = (corporate: Corporate) => {
        setSelectedCorporate(corporate);
        setIsCopyLinkModalVisible(true);
    };

    const handleOpenResendModal = (corporate: Corporate) => {
        setSelectedCorporate(corporate);
        setIsResendModalVisible(true);
    };

    const handleCloseModals = () => {
        setIsChangeStatusModalVisible(false);
        setIsCopyLinkModalVisible(false);
        setIsResendModalVisible(false);
        setSelectedCorporate(null);
        setTargetStatus(null);
        setIsRejectingStatus(false);
    };

    const handleSaveStatusChange = (corporateId: string, status: CorporateStatus, note: string) => {
        updateStatus(corporateId, status, note);
        handleCloseModals();
    };

    

    const renderActions = (corporate: Corporate) => {

        switch (corporate.status) {
            case 'Pending Contract Setup':
                return (
                    <div className="relative">
                        <select
                            defaultValue=""
                            onChange={(e) => {
                                const newStatus = e.target.value as CorporateStatus;
                                if (newStatus === 'Approved') {
                                    updateStatus(corporate.id, 'Pending 2nd Approval');
                                } else if (newStatus === 'Rejected') {
                                    handleOpenChangeStatusModal(corporate, 'Rejected');
                                }
                                e.target.value = '';
                            }}
                            className="text-sm border border-gray-300 rounded-md p-2 focus:ring-ht-blue focus:border-ht-blue bg-white"
                            aria-label="Select action for pending contract setup account"
                        >
                            <option value="" disabled>
                                Select Action...
                            </option>
                            <option value="Approved">Approve and Send to 2nd Approver</option>
                            <option value="Rejected">Reject</option>
                        </select>
                    </div>
                );
            case 'Sent':
            case 'Pending 1st Approval':
                return (
                    <div className="relative">
                        <select
                            defaultValue=""
                            onChange={(e) => {
                                const newStatus = e.target.value as CorporateStatus;
                                if (newStatus === 'Approved') {
                                    updateStatus(corporate.id, 'Pending 2nd Approval');
                                } else if (newStatus === 'Rejected') {
                                    handleOpenChangeStatusModal(corporate, 'Rejected');
                                }
                                e.target.value = '';
                            }}
                            className="text-sm border border-gray-300 rounded-md p-2 focus:ring-ht-blue focus:border-ht-blue bg-white"
                            aria-label="Select action for 1st approval account"
                        >
                            <option value="" disabled>
                                Select Action...
                            </option>
                            <option value="Approved">Approve</option>
                            <option value="Rejected">Reject</option>
                        </select>
                    </div>
                );
            case 'Pending 2nd Approval':
                return (
                    <div className="relative">
                        <select
                            defaultValue=""
                            onChange={(e) => {
                                const newStatus = e.target.value as CorporateStatus;
                                if (newStatus === 'Approved') {
                                    updateStatus(corporate.id, 'Cooling Period');
                                } else if (newStatus === 'Rejected') {
                                    handleOpenChangeStatusModal(corporate, 'Rejected');
                                }
                                e.target.value = '';
                            }}
                            className="text-sm border border-gray-300 rounded-md p-2 focus:ring-ht-blue focus:border-ht-blue bg-white"
                            aria-label="Select action for 2nd approval account"
                        >
                            <option value="" disabled>
                                Select Action...
                            </option>
                            <option value="Approved">Approve</option>
                            <option value="Rejected">Reject</option>
                        </select>
                    </div>
                );
            case 'Cooling Period':
                return <span className="text-gray-400 text-xs">No actions</span>;
            case 'Rejected':
                return <span className="text-gray-400 text-xs">No actions</span>;
            case 'Under Fraud Investigation':
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
                    <h2 className="text-lg font-semibold text-ht-gray-dark">Approver Corporate Accounts</h2>
                    <button
                        onClick={onAddNew}
                        className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark transition-colors"
                    >
                        Add New Approver Corporate
                    </button>
                </div>
                <div className="overflow-auto flex-grow">
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
                                                    label: 'Resend',
                                                    onClick: () => handleOpenResendModal(corporate),
                                                },
                                                {
                                                    label: 'Delete',
                                                    onClick: () => onDeleteCorporate(corporate.id),
                                                },
                                                {
                                                    label: 'Send to Approval',
                                                    onClick: () => onSendRegistrationLink(corporate.id),
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
                isRejecting={isRejectingStatus}
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

export default ApproverCorporatePage;

