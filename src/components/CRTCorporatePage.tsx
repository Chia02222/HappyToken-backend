"use client";

import React, { useState, useEffect } from 'react';
import { Corporate, CorporateStatus } from '../types';
import StatusBadge from './common/StatusBadge';
import ChangeStatusModal from './modals/ChangeStatusModal';
import CopyLinkModal from './modals/CopyLinkModal';
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
    onSendEcommericialTermlink: (id: string) => Promise<void>;
    fetchCorporates: () => Promise<void>;
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
    onSendEcommericialTermlink,
}) => {
    const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(null);
    const [targetStatus, setTargetStatus] = useState<CorporateStatus | null>(null);
    const [isChangeStatusModalVisible, setIsChangeStatusModalVisible] = useState(false);
    const [isCopyLinkModalVisible, setIsCopyLinkModalVisible] = useState(false);
    const [featuredCorporateIds, setFeaturedCorporateIds] = useState<Set<string>>(new Set());
    const [isRejectingStatus] = useState(false);

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


    const handleCloseModals = () => {
        setIsChangeStatusModalVisible(false);
        setIsCopyLinkModalVisible(false);
        setSelectedCorporate(null);
        setTargetStatus(null);
    };

    const handleSaveStatusChange = async (corporateId: string, status: CorporateStatus, note?: string) => {
        if (corporateId && status) {
            await updateStatus(corporateId, status, note);
            handleCloseModals();
        }
    };

    const renderActions = (corporate: Corporate) => {
        switch (corporate.status) {
            case 'Cooling Period':
                return (
                    <span className="text-gray-500 text-xs">
                        Cooling Period 
                    </span>
                );
            case 'Rejected':
                return <span className="text-gray-400 text-xs">No actions</span>;
            default:
                return <span className="text-gray-400 text-xs">No actions</span>;
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    const orderedCorporates = React.useMemo(() => {
        if (!featuredCorporateIds.size) return corporates;
        const featured: typeof corporates = [];
        const rest: typeof corporates = [];
        for (const c of corporates) {
            if (featuredCorporateIds.has(c.id)) featured.push(c); else rest.push(c);
        }
        return [...featured, ...rest];
    }, [corporates, featuredCorporateIds]);

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
                                    Updated At
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Log
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orderedCorporates.map((corporate) => (
                                <tr
                                    key={corporate.id}
                                    className={`${featuredCorporateIds.has(corporate.id) ? 'bg-ht-blue-light hover:bg-ht-blue-light' : 'hover:bg-gray-50'} cursor-pointer`}
                                    onClick={() => onView(corporate)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {corporate.company_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {corporate.reg_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatTimestamp(corporate.updated_at)}
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
                                                    label: 'Send to Approver',
                                                    onClick: () => onSendEcommericialTermlink(corporate.id),
                                                },
                                                {
                                                    label: featuredCorporateIds.has(corporate.id) ? 'Unfeature' : 'Feature',
                                                    onClick: () => setFeaturedCorporateIds(prev => {
                                                        const next = new Set(prev);
                                                        if (next.has(corporate.id)) next.delete(corporate.id); else next.add(corporate.id);
                                                        return next;
                                                    }),
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
                isRejecting={isRejectingStatus}
            />

            <CopyLinkModal
                isOpen={isCopyLinkModalVisible}
                onClose={handleCloseModals}
                corporate={selectedCorporate}
            />

            {/* Resend modal removed */}
        </>
    );
};

export default CRTCorporatePage;