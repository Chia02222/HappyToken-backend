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
            
            <h4 className="font-semibold mt-6">3. Client Obligations</h4>
            <p>The Client agrees to use the Services in accordance with these Terms and any applicable laws and regulations. The Client is responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.</p>
            
            <h4 className="font-semibold mt-6">4. Payment Terms</h4>
            <p>Payment terms are as specified in the Commercial Terms Schedule. The Client agrees to pay all fees and charges in accordance with the agreed payment schedule.</p>
            
            <h4 className="font-semibold mt-6">5. Limitation of Liability</h4>
            <p>The Company&apos;s liability is limited to the maximum extent permitted by law. The Company shall not be liable for any indirect, incidental, special, or consequential damages.</p>
            
            <h4 className="font-semibold mt-6">6. Termination</h4>
            <p>Either party may terminate this Agreement with written notice as specified in the Commercial Terms Schedule. Upon termination, the Client&apos;s access to the Services will be discontinued.</p>
            
            <h4 className="font-semibold mt-6">7. Governing Law</h4>
            <p>This Agreement shall be governed by and construed in accordance with the laws of Malaysia. Any disputes shall be subject to the exclusive jurisdiction of the Malaysian courts.</p>
            
            <h4 className="font-semibold mt-6">8. Intellectual Property</h4>
            <p>All intellectual property rights in the Services remain with the Company. The Client may not copy, modify, or distribute any part of the Services without prior written consent.</p>
            
            <h4 className="font-semibold mt-6">9. Data Protection</h4>
            <p>The Company will handle Client Data in accordance with applicable data protection laws and the Company&apos;s Privacy Policy. The Client consents to the collection, use, and processing of their data as described in the Privacy Policy.</p>
            
            <h4 className="font-semibold mt-6">10. Force Majeure</h4>
            <p>The Company shall not be liable for any failure or delay in performance due to circumstances beyond its reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, or government actions.</p>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericTermsModal;