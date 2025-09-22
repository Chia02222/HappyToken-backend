"use client";

import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Corporate } from '../../types';
import { CopyIcon, CheckIcon } from '../Icons';

interface CopyLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    corporate: Corporate | null;
}

const CopyLinkModal: React.FC<CopyLinkModalProps> = ({ isOpen, onClose, corporate }) => {
    const [isCopied, setIsCopied] = useState(false);

    if (!corporate) return null;

    const approvalLink = `localhost:3002/?role=client&page=Approver%20Corporate&corporateId=${corporate.id}&formMode=approve`;

    const handleCopy = () => {
        navigator.clipboard.writeText(approvalLink).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Copy Registration Link">
            <div>
                <p className="text-sm text-gray-600 mb-4">An approval link for <span className="font-medium">{corporate.company_name}</span> has been generated. Copy this link and share it with the approver to review and approve the corporate account.</p>
                
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        readOnly
                        value={approvalLink}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm bg-gray-100 focus:outline-none"
                        aria-label="Approval Link"
                    />
                    <button 
                        onClick={handleCopy}
                        className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-ht-blue"
                        aria-label="Copy link"
                    >
                        {isCopied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5 text-gray-600" />}
                    </button>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="text-sm bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Close</button>
                </div>
            </div>
        </Modal>
    );
};

export default CopyLinkModal;
