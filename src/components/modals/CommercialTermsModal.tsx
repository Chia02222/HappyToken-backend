import React from 'react';

interface CommercialTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommercialTermsModal: React.FC<CommercialTermsModalProps> = ({ isOpen, onClose }) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b bg-ht-blue rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Commercial Terms & Conditions</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        <div 
          className="flex-1 overflow-y-auto p-6"
        >
          <div className="prose prose-sm max-w-none">
            <h4 className="font-semibold">Commercial Agreement Terms</h4>
            <p>By proceeding, the Client acknowledges and agrees to the commercial terms specified herein, including but not limited to the agreed-upon fees, credit limits, and payment schedules. These terms form a legally binding part of the service agreement between the Client and HT Voucher Trading Sdn Bhd.</p>
            
            <h4 className="font-semibold mt-6">Transaction Fees</h4>
            <p>The specified percentage will be applied to the total value of each transaction processed through the platform. This fee structure is designed to cover operational costs and platform maintenance. Transaction fees are calculated on a per-transaction basis and are non-refundable.</p>
            
            <h4 className="font-semibold mt-6">Credit Terms</h4>
            <p>Invoices are due within the number of days specified from the invoice date. Late payments will incur interest as per the agreed rate. The Company reserves the right to suspend services for overdue accounts. Credit terms may be subject to review and adjustment based on payment history.</p>
            
            <h4 className="font-semibold mt-6">Service Fees</h4>
            <p>Additional fees for services like White Labeling or Custom Feature Requests are applicable only upon request and will be billed separately as incurred. These services require separate agreements and pricing structures. All custom development work is subject to additional terms and conditions.</p>
            
            <h4 className="font-semibold mt-6">Confidentiality</h4>
            <p>All commercial terms, including pricing and fee structures, are confidential and shall not be disclosed to any third party without prior written consent from both parties. This confidentiality extends to all business discussions and negotiations. Breach of confidentiality may result in immediate termination of the agreement.</p>
            
            <h4 className="font-semibold mt-6">Payment Processing</h4>
            <p>All payments must be processed through the designated payment channels. The Company reserves the right to implement additional security measures for payment processing as deemed necessary. Payment methods may be restricted based on risk assessment and compliance requirements.</p>
            
            <h4 className="font-semibold mt-6">Dispute Resolution</h4>
            <p>Any disputes arising from commercial terms shall be resolved through good faith negotiations. If negotiations fail, disputes shall be subject to binding arbitration in accordance with Malaysian law. The arbitration process shall be conducted in English and the decision shall be final and binding.</p>
            
            <h4 className="font-semibold mt-6">Service Level Agreements</h4>
            <p>The Company will provide services in accordance with the agreed service level agreements. Service availability targets and performance metrics are outlined in the technical specifications. The Client acknowledges that service interruptions may occur due to maintenance, upgrades, or unforeseen circumstances.</p>
            
            <h4 className="font-semibold mt-6">Compliance and Regulatory</h4>
            <p>Both parties agree to comply with all applicable laws and regulations. The Client is responsible for ensuring their use of the services complies with local and international regulations. The Company reserves the right to modify services to ensure regulatory compliance.</p>
            
            <h4 className="font-semibold mt-6">Termination and Suspension</h4>
            <p>Either party may terminate this agreement with written notice as specified in the terms. The Company reserves the right to suspend or terminate services immediately in case of breach of terms, non-payment, or regulatory requirements. Upon termination, all outstanding fees become immediately due.</p>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommercialTermsModal;