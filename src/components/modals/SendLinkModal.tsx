
"use client";

import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Corporate } from '../../types';
import { CopyIcon, CheckIcon } from '../Icons';

interface SendLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    corporate: Corporate | null;
    onSend: (corporateId: number) => void;
}

const SendLinkModal: React.FC<SendLinkModalProps> = ({ isOpen, onClose, corporate, onSend }) => {
    const [isCopied, setIsCopied] = useState(false);

    if (!corporate) return null;

    const registrationLink = `https://happietoken.com/register?token=${btoa(`corp_${corporate.id}`)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(registrationLink).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        });
    };

    const handleSend = () => {
        if (corporate) {
            onSend(corporate.id);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Send Registration Link">
            <div>
                <p className="text-sm text-gray-600 mb-4">A unique registration link for <span className="font-medium">{corporate.company_name}</span> has been generated. Send this link to the corporate client to proceed with their account setup.</p>
                
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        readOnly
                        value={registrationLink}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm bg-gray-100 focus:outline-none"
                        aria-label="Registration Link"
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
                    <button onClick={onClose} className="text-sm bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSend} className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark">Send & Update Status</button>
                </div>
            </div>
        </Modal>
    );
};

export default SendLinkModal;
