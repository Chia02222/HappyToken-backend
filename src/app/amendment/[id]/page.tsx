'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import FormLayout from '../../../components/layout/FormLayout';
import AmendmentRequestForm from '@/components/forms/AmendmentRequestForm';
import SuccessModal from '../../../components/modals/SuccessModal';
import { getCorporateById, createAmendmentRequest, getAmendmentRequestsByCorporate } from '@/services/api';

interface CorporateData {
  id: string;
  company_name: string;
  reg_number: string;
  credit_limit: string;
  agreement_from?: string;
  agreement_to?: string;
  office_address1: string;
  office_address2: string;
  postcode: string;
  city: string;
  state: string;
  country: string;
  website: string;
  account_note: string;
}

const AmendmentRequestPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const corporateId = params.id as string;
  const mode = searchParams.get('mode') as 'approve' | 'approve-second' | null;
  
  const [corporateData, setCorporateData] = useState<CorporateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [createdAmendmentId, setCreatedAmendmentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCorporateData = async () => {
      try {
        setLoading(true);
        const data = await getCorporateById(corporateId);
        setCorporateData(data);
      } catch (err) {
        console.error('Error fetching corporate data:', err);
        setError('Failed to load corporate data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (corporateId) {
      fetchCorporateData();
    }
  }, [corporateId]);

  const handleSave = async (amendmentData: any) => {
    try {
      // Send both snapshots so view pages can use original_data/amended_data directly
      const minimalPayload = {
        originalData: amendmentData.originalData,
        amendedData: amendmentData.amendedData
      };
      const result = await createAmendmentRequest(corporateId, minimalPayload);
      const newId = result?.amendmentId ? String(result.amendmentId) : null;
      if (newId) setCreatedAmendmentId(newId);
      setSuccessTitle('Amendment Submitted');
      setSuccessMessage('Your amendment request has been submitted successfully.');
      setSuccessOpen(true);
    } catch (err) {
      console.error('Error submitting amendment request:', err);
      throw err;
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ht-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading corporate data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!corporateData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Corporate Not Found</h2>
          <p className="text-gray-600 mb-4">The requested corporate record could not be found.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-ht-blue text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-ht-blue"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <FormLayout title="Amendment Request">
      <AmendmentRequestForm
        corporateId={corporateId}
        originalData={corporateData}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      <SuccessModal
        isOpen={successOpen}
        onClose={async () => {
          setSuccessOpen(false);
          
          // Redirect all users to Amendment View page
          if (createdAmendmentId) {
            router.push(`/amendment/view/${createdAmendmentId}`);
          } else {
            // If no amendment ID was captured, try to fetch the latest amendment request
            try {
              const amendments = await getAmendmentRequestsByCorporate(corporateId);
              if (amendments && amendments.length > 0) {
                // Get the most recent amendment request
                const latestAmendment = amendments[amendments.length - 1];
                router.push(`/amendment/view/${latestAmendment.id}`);
              } else {
                // Fallback: redirect to corporate page
                router.push(`/corporate/${corporateId}?step=2`);
              }
            } catch (error) {
              console.error('Error fetching amendment requests:', error);
              // Fallback: redirect to corporate page
              router.push(`/corporate/${corporateId}?step=2`);
            }
          }
        }}
        title={successTitle}
        message={successMessage}
      />
    </FormLayout>
  );
};

export default AmendmentRequestPage;
