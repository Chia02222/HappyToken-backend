"use client";

import React from 'react';
import GenericTermsModal from '../../modals/GenericTermsModal';
import CommercialTermsModal from '../../modals/CommercialTermsModal';

interface TermsModalsProps {
  isGenericTermsModalOpen: boolean;
  setIsGenericTermsModalOpen: (open: boolean) => void;
  isCommercialTermsModalOpen: boolean;
  setIsCommercialTermsModalOpen: (open: boolean) => void;
}

const TermsModals: React.FC<TermsModalsProps> = ({
  isGenericTermsModalOpen,
  setIsGenericTermsModalOpen,
  isCommercialTermsModalOpen,
  setIsCommercialTermsModalOpen,
}) => {
  return (
    <>
      <GenericTermsModal
        isOpen={isGenericTermsModalOpen}
        onClose={() => setIsGenericTermsModalOpen(false)}
      />
      
      <CommercialTermsModal
        isOpen={isCommercialTermsModalOpen}
        onClose={() => setIsCommercialTermsModalOpen(false)}
      />
    </>
  );
};

export default TermsModals;
