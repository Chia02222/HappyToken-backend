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
            <p className="text-xs text-gray-500 mb-4">Last Updated: [Insert Date]</p>
            <p>These Standard Terms and Conditions (&quot;Terms&quot;) govern the relationship between HT Voucher Trading Sdn Bhd (Company No. [Insert], trading as HappieToken, hereinafter referred to as the &quot;Company&quot;) and any party (&quot;Client&quot;) who enters into a commercial arrangement with the Company for the use of its products or services, whether by signing an order form, accepting a quotation, or registering via an online form. These Terms are legally binding and apply to all Clients unless otherwise agreed in writing.</p>
            
            <h4 className="font-semibold mt-6">1. Definitions</h4>
            <p>&quot;Agreement&quot; means the binding contract between the Company and the Client, consisting of these Terms and any applicable Order Form or Commercial Terms Schedule.</p>
            <p>&quot;Services&quot; means the platform access, features, tools, APIs, or solutions provided by the Company.</p>
            <p>&quot;Client Data&quot; means any information, material, or content uploaded, submitted, or shared by the Client through the Services.</p>
            <p>&quot;Effective Date&quot; means the date on which the Client first accepts or is deemed to accept these Terms.</p>
            
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
            
            <h4 className="font-semibold mt-6">9. Limitation of Liability</h4>
            <p>The Company&apos;s total liability under this Agreement shall not exceed the amount paid by the Client for Services in the preceding six (6) months. The Company shall not be liable for indirect, incidental, or consequential losses.</p>
            
            <h4 className="font-semibold mt-6">10. Indemnity</h4>
            <p>The Client agrees to indemnify and hold harmless the Company from any third-party claims, damages, or liabilities arising from the Client&apos;s breach of this Agreement or misuse of the Services.</p>
            
            <h4 className="font-semibold mt-6">11. Termination</h4>
            <p>Either party may terminate this Agreement by giving thirty (30) days&apos; written notice. The Company may terminate immediately in the event of:</p>
            <ul className="list-disc pl-6">
              <li>Breach of terms by the Client;</li>
              <li>Fraud, abuse, or illegal activity;</li>
              <li>Insolvency or cessation of business by either party.</li>
            </ul>
            
            <h4 className="font-semibold mt-6">12. Force Majeure</h4>
            <p>Neither party shall be held liable for failure to perform obligations due to events beyond its reasonable control, including but not limited to natural disasters, war, government restrictions, or Internet disruptions.</p>
            
            <h4 className="font-semibold mt-6">13. Governing Law and Jurisdiction</h4>
            <p>This Agreement shall be governed by the laws of Malaysia, and any disputes shall be subject to the exclusive jurisdiction of the courts of Kuala Lumpur.</p>
            
            <h4 className="font-semibold mt-6">14. Dispute Resolution</h4>
            <p>Parties shall attempt to resolve disputes through good faith negotiations. If unresolved, the dispute shall proceed to mediation and, if necessary, to arbitration administered by the Asian International Arbitration Centre (AIAC) under its applicable rules.</p>
            
            <h4 className="font-semibold mt-6">15. Notices</h4>
            <p>All notices shall be in writing and sent by email or registered post to the addresses provided by the Parties in the relevant Order Form or registration record.</p>
            
            <h4 className="font-semibold mt-6">16. Entire Agreement</h4>
            <p>This Agreement, including any referenced schedules or forms, constitutes the entire agreement between the Parties and supersedes all prior agreements, representations, or communications.</p>
            
            <h4 className="font-semibold mt-6">17. Amendments</h4>
            <p>These Terms may be updated by the Company from time to time. Continued use of the Services after such updates constitutes acceptance of the revised Terms.</p>
            
            <h4 className="font-semibold mt-6">18. Severability</h4>
            <p>If any provision of this Agreement is held to be invalid or unenforceable, the remainder shall remain in full force and effect.</p>
            
            <h4 className="font-semibold mt-6">19. Waiver</h4>
            <p>No failure or delay by either Party in exercising any right shall constitute a waiver of that right.</p>
            
            <h4 className="font-semibold mt-6">Agreement Acceptance</h4>
            <p>By proceeding to use the Company&apos;s Services or confirming your agreement via an online form or signed order, you acknowledge and accept these Standard Terms and Conditions.</p>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommercialTermsModal;