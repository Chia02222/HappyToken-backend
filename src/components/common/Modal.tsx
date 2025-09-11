
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
    size?: 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        md: 'max-w-md',
        lg: 'max-w-lg',
    };

    return (
        <div 
            className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50" 
            role="dialog" 
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={onClose}
        >
            <div className={`bg-white rounded-lg shadow-xl p-6 w-full ${sizeClasses[size]}`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 id="modal-title" className="text-lg font-semibold text-ht-gray-dark">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Close modal">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
