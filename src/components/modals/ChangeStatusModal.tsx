
"use client";

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Corporate, CorporateStatus } from '../../types';

interface ChangeStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    corporate: Corporate | null;
    targetStatus: CorporateStatus | null;
    onSave: (corporateId: string, status: CorporateStatus, note: string) => void;
    isRejecting?: boolean; // New prop
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({ isOpen, onClose, corporate, targetStatus, onSave, isRejecting = false }) => {
    const [logNote, setLogNote] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setLogNote('');
        }
    }, [isOpen]);

    const handleSave = () => {
        if (corporate && targetStatus && logNote) {
            onSave(corporate.id, targetStatus, logNote);
            onClose();
        }
    };

    if (!corporate || !targetStatus) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isRejecting ? "Reject Corporate" : "Add Investigation Note"}>
            <div>
                <p className="text-sm text-gray-600 mb-1">Company: <span className="font-medium">{corporate.company_name}</span></p>
                <p className="text-sm text-gray-600 mb-4">Action: <span className="font-medium">{corporate.status} → {targetStatus}</span></p>
                
                <textarea
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-ht-blue focus:border-ht-blue"
                    placeholder={isRejecting ? "Enter reason for rejection..." : "Enter details of the investigation and reason for the status change..."}
                ></textarea>
                
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="text-sm bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSave} disabled={!logNote.trim()} className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark disabled:bg-ht-gray">{isRejecting ? "Reject Corporate" : "Save Note & Update"}</button>
                </div>
            </div>
        </Modal>
    );
};

export default ChangeStatusModal;
