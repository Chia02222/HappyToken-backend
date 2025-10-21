import React from 'react';

interface GenericTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GenericTermsModal: React.FC<GenericTermsModalProps> = ({ isOpen, onClose }) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b bg-ht-blue rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Generic Terms & Conditions</h2>
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
            <p className="text-xs text-gray-500 mb-4">Last Updated: [Insert Date]</p>
                     <p>These Standard Terms and Conditions (&quot;Terms&quot;) govern the relationship between HT Voucher Trading Sdn Bhd (Company No. [Insert], trading as HappieToken, hereinafter referred to as the &quot;Company&quot;) and any party (&quot;Client&quot;) who enters into a commercial arrangement with the Company for the use of its products or services, whether by signing an order form, accepting a quotation, or registering via an online form. These Terms are legally binding and apply to all Clients unless otherwise agreed in writing.</p>
            
            <h4 className="font-semibold mt-6">1. Definitions</h4>
            <ul className="list-disc pl-6">
              <li>&quot;Agreement&quot; means the binding contract between the Company and the Client, consisting of these Terms and any applicable Order Form or Commercial Terms Schedule.</li>
              <li>&quot;Services&quot; means the platform access, features, tools, APIs, or solutions provided by the Company.</li>
              <li>&quot;Client Data&quot; means any information, material, or content uploaded, submitted, or shared by the Client through the Services.</li>
              <li>&quot;Effective Date&quot; means the date on which the Client first accepts or is deemed to accept these Terms.</li>
            </ul>
            
            <h4 className="font-semibold mt-6">2. Provision of Services</h4>
            <p>The Company shall provide the Services described in the relevant Commercial Terms Schedule or online order form. The Company reserves the right to improve, modify, or discontinue any part of the Services with reasonable notice.</p>
            
            <h4 className="font-semibold mt-6">3. Use of the Platform</h4>
            <p>The Client shall use the Services solely for its internal business purposes and shall not:</p>
            <ul className="list-disc pl-6">
              <li>Copy, resell, or license the platform or its features;</li>
              <li>Interfere with the performance or security of the system;</li>
              <li>Use the Services to conduct unlawful or unethical activities.</li>
            </ul>
            
            <h4 className="font-semibold mt-6">4. Fees and Payment</h4>
            <p>Fees, charges, credit terms, and payout details are specified in the Commercial Terms Schedule or Order Form. All invoices must be settled within the agreed credit term. The Company reserves the right to:</p>
            <ul className="list-disc pl-6">
              <li>Charge interest on late payments;</li>
              <li>Suspend or limit Services for overdue accounts;</li>
              <li>Withhold settlement payouts in case of breach.</li>
            </ul>
            
            <h4 className="font-semibold mt-6">5. Intellectual Property</h4>
            <p>All intellectual property rights in the Services, software, designs, and documentation shall remain the sole property of the Company. The Client is granted a limited, non-exclusive, non-transferable license to use the Services in accordance with this Agreement.</p>
            
            <h4 className="font-semibold mt-6">6. Client Data &amp; Confidentiality</h4>
            <p>The Client retains ownership of its data. The Company will not disclose or use Client Data except as required to provide the Services or by law. Both parties agree to maintain the confidentiality of all non-public information exchanged during the course of this Agreement for a period of twelve (12) months after termination.</p>
            
            <h4 className="font-semibold mt-6">7. Data Protection</h4>
            <p>The Company shall take reasonable steps to comply with Malaysia&apos;s Personal Data Protection Act 2010 (PDPA) in handling personal data collected during the provision of Services.</p>
            
            <h4 className="font-semibold mt-6">8. Warranties and Disclaimers</h4>
            <p>The Company provides the Services &quot;as is&quot; and disclaims all warranties not expressly stated herein. The Company does not guarantee uninterrupted or error-free operation.</p>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericTermsModal;