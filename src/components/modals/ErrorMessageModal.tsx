import React from 'react';
import Modal from '../common/Modal';

interface ErrorMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const ErrorMessageModal: React.FC<ErrorMessageModalProps> = ({ isOpen, onClose, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Error">
      <div className="p-4">
        <p className="text-sm text-red-600 mb-4">{message}</p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ErrorMessageModal;
