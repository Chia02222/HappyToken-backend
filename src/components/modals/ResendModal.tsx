import React from 'react';
import Modal from '../common/Modal';
import { Corporate } from '../../types';

interface ResendModalProps {
    isOpen: boolean;
    onClose: () => void;
    corporate: Corporate | null;
    onResend: (corporateId: string) => void;
}

const ResendModal: React.FC<ResendModalProps> = ({ isOpen, onClose, corporate, onResend }) => {
    if (!corporate) return null;

    const handleResend = () => {
        if (corporate) {
            onResend(corporate.id);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Resend Registration Link">
            <div>
                <p className="text-sm text-gray-600 mb-4">Are you sure you want to resend the registration link to <span className="font-medium">{corporate.company_name}</span>?</p>
                
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="text-sm bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleResend} className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark">Resend Email</button>
                </div>
            </div>
        </Modal>
    );
};

export default ResendModal;
