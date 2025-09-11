
"use client";

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Corporate } from '../../types';

interface AddRemarkModalProps {
    isOpen: boolean;
    onClose: () => void;
    corporate: Corporate | null;
    onSave: (corporateId: number, note: string) => void;
}

const AddRemarkModal: React.FC<AddRemarkModalProps> = ({ isOpen, onClose, corporate, onSave }) => {
    const [logNote, setLogNote] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setLogNote('');
        }
    }, [isOpen]);
    
    const handleSave = () => {
        if (corporate && logNote) {
            onSave(corporate.id, logNote);
            onClose();
        }
    };

    if (!corporate) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Investigation Remark">
            <div>
                <p className="text-sm text-gray-600 mb-4">Company: <span className="font-medium">{corporate.companyName}</span></p>
                <textarea
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-ht-blue focus:border-ht-blue"
                    placeholder="Add a new investigation note..."
                ></textarea>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="text-sm bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSave} disabled={!logNote.trim()} className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark disabled:bg-ht-gray">Save Remark</button>
                </div>
            </div>
        </Modal>
    );
};

export default AddRemarkModal;
