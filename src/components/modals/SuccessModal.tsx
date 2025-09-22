import React from 'react';
import Modal from '../common/Modal'; 

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-4">
        <p className="text-sm text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: message }}></p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-ht-blue rounded-md hover:bg-ht-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue"
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;
