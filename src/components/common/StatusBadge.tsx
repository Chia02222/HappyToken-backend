
import React from 'react';
import { CorporateStatus } from '../../types';

interface StatusBadgeProps {
    status: CorporateStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const colorClasses: Record<CorporateStatus, string> = {
        'New': 'bg-gray-100 text-gray-800',
        'Sent': 'bg-blue-100 text-blue-800',
        'Pending 1st Approval': 'bg-yellow-100 text-yellow-800',
        'Pending 2nd Approval': 'bg-yellow-100 text-yellow-800',
        'Approved': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800',
        'Cooling Period': 'bg-purple-100 text-purple-800',
        'Resolved': 'bg-teal-100 text-teal-800',
        'Closed': 'bg-gray-500 text-white',
        'Reopened': 'bg-orange-100 text-orange-800',
        'Pending Contract Setup': 'bg-yellow-100 text-yellow-800',
        'Under Fraud Investigation': 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[status]}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
