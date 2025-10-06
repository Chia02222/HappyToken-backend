'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import FormLayout from '../../../components/layout/FormLayout';
import AmendmentRequestForm from '@/components/forms/AmendmentRequestForm';
import SuccessModal from '../../../components/modals/SuccessModal';
import { getCorporateById, createAmendmentRequest, getAmendmentRequestsByCorporate } from '@/services/api';
import { logError } from '@/utils/logger';
import { errorHandler } from '@/utils/errorHandler';

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
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<{ originalData: any; amendedData: any } | null>(null);
  const [isFinalSubmitting, setIsFinalSubmitting] = useState(false);

  useEffect(() => {
    const fetchCorporateData = async () => {
      try {
        setLoading(true);
        const data = await getCorporateById(corporateId);
        setCorporateData(data);
      } catch (err) {
        const errorMessage = errorHandler.handleApiError(err as Error, { component: 'AmendmentRequestPage', action: 'fetchCorporateData', corporateId });
        logError('Error fetching corporate data', { error: errorMessage }, 'AmendmentRequestPage');
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
    // Use onSave for preview; no API call here
    setPreviewData({
      originalData: amendmentData.originalData,
      amendedData: amendmentData.amendedData,
    });
    setIsPreviewing(true);
  };

  const handleFinalSubmit = async () => {
    if (!previewData) return;
    try {
      setIsFinalSubmitting(true);
      const result = await createAmendmentRequest(corporateId, {
        originalData: previewData.originalData,
        amendedData: previewData.amendedData,
      });
      const newId = result?.amendmentId ? String(result.amendmentId) : null;
      if (newId) setCreatedAmendmentId(newId);
      setSuccessTitle('Amendment Submitted');
      setSuccessMessage('Your amendment request has been submitted successfully.');
      setSuccessOpen(true);
    } catch (err) {
      const errorMessage = errorHandler.handleApiError(err as Error, { component: 'AmendmentRequestPage', action: 'submitAmendmentRequest', corporateId });
      logError('Error submitting amendment request', { error: errorMessage }, 'AmendmentRequestPage');
      throw err;
    } finally {
      setIsFinalSubmitting(false);
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

  if (isPreviewing && previewData && corporateData) {
    const original = previewData.originalData;
    const amended = previewData.amendedData;

    const Field: React.FC<{ label: string; value: any; highlight?: boolean }> = ({ label, value, highlight }) => (
      <div className={`p-3 rounded-md ${highlight ? 'bg-amber-50' : ''}`}>
        <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
        <div className={`text-sm p-2 rounded ${highlight ? 'text-amber-900 bg-amber-50' : 'text-gray-900'}`}>{value ?? ''}</div>
      </div>
    );

    const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
      <div className="bg-white p-4 rounded-lg">
        <h2 className="text-base font-semibold text-ht-gray-dark mb-3">{title}</h2>
        <div className="space-y-4">{children}</div>
      </div>
    );

    const rawDate = (value: any): string => (value == null ? '' : String(value));

    const renderCompanySection = (data: any, other: any) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Company Name" value={data?.company_name} highlight={data?.company_name !== other?.company_name} />
        <Field label="Official Registration Number" value={data?.reg_number} highlight={data?.reg_number !== other?.reg_number} />
        <Field label="Website" value={data?.website} highlight={data?.website !== other?.website} />
        <Field label="Office Address 1" value={data?.office_address1} highlight={data?.office_address1 !== other?.office_address1} />
        <Field label="Office Address 2" value={data?.office_address2} highlight={data?.office_address2 !== other?.office_address2} />
        <Field label="Postcode" value={data?.postcode} highlight={data?.postcode !== other?.postcode} />
        <Field label="City" value={data?.city} highlight={data?.city !== other?.city} />
        <Field label="State" value={data?.state} highlight={data?.state !== other?.state} />
        <Field label="Country" value={data?.country} highlight={data?.country !== other?.country} />
        <div className="md:col-span-2">
          <Field label="Account Note" value={data?.account_note} highlight={data?.account_note !== other?.account_note} />
        </div>
      </div>
    );

    const renderContactsSection = (data: any, other: any) => (
      <div className="space-y-4">
        {(data?.contacts || []).map((c: any, i: number) => (
          <div key={i} className="p-3 rounded-md bg-gray-50 border">
            <div className="text-xs font-semibold text-gray-700 mb-2">Contact Person {i + 1}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Salutation" value={c?.salutation} highlight={c?.salutation !== other?.contacts?.[i]?.salutation} />
              <div></div>
              <Field label="First Name" value={c?.first_name} highlight={c?.first_name !== other?.contacts?.[i]?.first_name} />
              <Field label="Last Name" value={c?.last_name} highlight={c?.last_name !== other?.contacts?.[i]?.last_name} />
              <Field label="Contact Number" value={c?.contact_number} highlight={c?.contact_number !== other?.contacts?.[i]?.contact_number} />
              <Field label="Email Address" value={c?.email} highlight={c?.email !== other?.contacts?.[i]?.email} />
              <Field label="Company Role" value={c?.company_role} highlight={c?.company_role !== other?.contacts?.[i]?.company_role} />
              <Field label="System Role" value={c?.system_role} highlight={c?.system_role !== other?.contacts?.[i]?.system_role} />
            </div>
          </div>
        ))}
      </div>
    );

    const renderSubsidiariesSection = (data: any, other: any) => (
      <div className="space-y-4">
        {(data?.subsidiaries || []).map((s: any, i: number) => (
          <div key={i} className="p-3 rounded-md bg-gray-50 border">
            <div className="text-xs font-semibold text-gray-700 mb-2">Subsidiary {i + 1}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Company Name" value={s?.company_name} highlight={s?.company_name !== other?.subsidiaries?.[i]?.company_name} />
              <Field label="Official Registration Number" value={s?.reg_number} highlight={s?.reg_number !== other?.subsidiaries?.[i]?.reg_number} />
              <Field label="Office Address 1" value={s?.office_address1} highlight={s?.office_address1 !== other?.subsidiaries?.[i]?.office_address1} />
              <Field label="Office Address 2" value={s?.office_address2} highlight={s?.office_address2 !== other?.subsidiaries?.[i]?.office_address2} />
              <Field label="Postcode" value={s?.postcode} highlight={s?.postcode !== other?.subsidiaries?.[i]?.postcode} />
              <Field label="City" value={s?.city} highlight={s?.city !== other?.subsidiaries?.[i]?.city} />
              <Field label="State" value={s?.state} highlight={s?.state !== other?.subsidiaries?.[i]?.state} />
              <Field label="Country" value={s?.country} highlight={s?.country !== other?.subsidiaries?.[i]?.country} />
              <Field label="Website" value={s?.website} highlight={s?.website !== other?.subsidiaries?.[i]?.website} />
              <Field label="Account Note" value={s?.account_note} highlight={s?.account_note !== other?.subsidiaries?.[i]?.account_note} />
            </div>
          </div>
        ))}
      </div>
    );

    const renderBillingSection = (data: any, other: any) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Same as Official Address" value={String(Boolean(data?.billing_same_as_official))} highlight={Boolean(data?.billing_same_as_official) !== Boolean(other?.billing_same_as_official)} />
        <div></div>
        <Field label="Billing Address 1" value={data?.billing_address1} highlight={data?.billing_address1 !== other?.billing_address1} />
        <Field label="Billing Address 2" value={data?.billing_address2} highlight={data?.billing_address2 !== other?.billing_address2} />
        <Field label="Billing Postcode" value={data?.billing_postcode} highlight={data?.billing_postcode !== other?.billing_postcode} />
        <Field label="Billing City" value={data?.billing_city} highlight={data?.billing_city !== other?.billing_city} />
        <Field label="Billing State" value={data?.billing_state} highlight={data?.billing_state !== other?.billing_state} />
        <Field label="Billing Country" value={data?.billing_country} highlight={data?.billing_country !== other?.billing_country} />
      </div>
    );

    const renderTaxSection = (data: any, other: any) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Company TIN" value={data?.company_tin} highlight={data?.company_tin !== other?.company_tin} />
        <Field label="SST Number" value={data?.sst_number} highlight={data?.sst_number !== other?.sst_number} />
      </div>
    );

    const renderCommercialSection = (data: any, other: any) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Agreement From" value={rawDate(data?.agreement_from)} highlight={rawDate(data?.agreement_from) !== rawDate(other?.agreement_from)} />
        <Field label="Agreement To" value={rawDate(data?.agreement_to)} highlight={rawDate(data?.agreement_to) !== rawDate(other?.agreement_to)} />
        <Field label="Credit Limit" value={data?.credit_limit} highlight={data?.credit_limit !== other?.credit_limit} />
        <Field label="Credit Terms" value={data?.credit_terms} highlight={data?.credit_terms !== other?.credit_terms} />
        <Field label="Transaction Fee" value={data?.transaction_fee} highlight={data?.transaction_fee !== other?.transaction_fee} />
        <Field label="Late Payment Interest" value={data?.late_payment_interest} highlight={data?.late_payment_interest !== other?.late_payment_interest} />
        <Field label="White Labeling Fee" value={data?.white_labeling_fee} highlight={data?.white_labeling_fee !== other?.white_labeling_fee} />
        <Field label="Custom Feature Fee" value={data?.custom_feature_fee} highlight={data?.custom_feature_fee !== other?.custom_feature_fee} />
      </div>
    );

    return (
      <FormLayout title="Amendment Request - Preview">
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Amendment Comparison</h1>
                <p className="text-sm text-gray-600">Left: Original • Right: Amendment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <SectionCard title="Original (Read-only)">
                  {renderCompanySection(original, amended)}
                  <SectionCard title="Contact Person">{renderContactsSection(original, amended)}</SectionCard>
                  <SectionCard title="Subsidiaries">{renderSubsidiariesSection(original, amended)}</SectionCard>
                  <SectionCard title="Billing Address">{renderBillingSection(original, amended)}</SectionCard>
                  <SectionCard title="Tax Information">{renderTaxSection(original, amended)}</SectionCard>
                  <SectionCard title="Commercial Terms">{renderCommercialSection(original, amended)}</SectionCard>
                </SectionCard>
              </div>

              <div>
                <SectionCard title="Amendment (Read-only)">
                  {renderCompanySection(amended, original)}
                  <SectionCard title="Contact Person">{renderContactsSection(amended, original)}</SectionCard>
                  <SectionCard title="Subsidiaries">{renderSubsidiariesSection(amended, original)}</SectionCard>
                  <SectionCard title="Billing Address">{renderBillingSection(amended, original)}</SectionCard>
                  <SectionCard title="Tax Information">{renderTaxSection(amended, original)}</SectionCard>
                  <SectionCard title="Commercial Terms">{renderCommercialSection(amended, original)}</SectionCard>
                </SectionCard>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsPreviewing(false)}
                className="px-6 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Back
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isFinalSubmitting}
                className={`px-6 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-ht-blue ${
                  isFinalSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-ht-blue hover:bg-ht-blue-dark'
                }`}
              >
                {isFinalSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>

            {/* Success modal shown after final submit, then redirect back to ecommercial terms form */}
            <SuccessModal
              isOpen={successOpen}
              onClose={() => {
                setSuccessOpen(false);
                // Redirect back to e-Commercial Terms form with mode based on previous status
                const prevStatus = (corporateData as any)?.status;
                let mode = 'edit';
                if (prevStatus === 'Pending 1st Approval') mode = 'approve';
                else if (prevStatus === 'Pending 2nd Approval') mode = 'approve-second';
                router.push(`/corporate/${corporateId}?mode=${mode}&step=2`);
              }}
              title={successTitle}
              message={successMessage}
            />
          </div>
        </div>
      </FormLayout>
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
              const errorMessage = errorHandler.handleApiError(error as Error, { component: 'AmendmentRequestPage', action: 'fetchAmendmentRequests', corporateId });
              logError('Error fetching amendment requests', { error: errorMessage }, 'AmendmentRequestPage');
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
