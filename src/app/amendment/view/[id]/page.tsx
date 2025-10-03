'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FormLayout from '../../../../components/layout/FormLayout';
import { getAmendmentById, getCorporateById } from '@/services/api';
import { logError } from '@/utils/logger';
import { errorHandler } from '@/utils/errorHandler';

interface AmendmentData {
  id: string;
  corporate_id: string;
  timestamp: string;
  note: string;
  from_status: string;
  to_status: string;
  amendment_data: any;
  created_at: string;
}

const AmendmentViewPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const amendmentId = params.id as string;
  
  const [amendmentData, setAmendmentData] = useState<AmendmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalCorporate, setOriginalCorporate] = useState<any | null>(null);
  const [isOriginalLoading, setIsOriginalLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchAmendmentData = async () => {
      try {
        setLoading(true);
        const data = await getAmendmentById(amendmentId);
        setAmendmentData(data);
      } catch (err) {
        const errorMessage = errorHandler.handleApiError(err as Error, { component: 'AmendmentViewPage', action: 'fetchAmendmentData', amendmentId });
        logError('Error fetching amendment data', { error: errorMessage }, 'AmendmentViewPage');
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    if (amendmentId) {
      fetchAmendmentData();
    }
  }, [amendmentId]);

  useEffect(() => {
    const fetchOriginal = async () => {
      if (!amendmentData?.corporate_id) return;
      try {
        setIsOriginalLoading(true);
        const corp = await getCorporateById(String(amendmentData.corporate_id));
        setOriginalCorporate(corp);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load corporate data for comparison');
      } finally {
        setIsOriginalLoading(false);
      }
    };
    fetchOriginal();
  }, [amendmentData?.corporate_id]);

  const Field: React.FC<{ label: string; value: any; highlight?: boolean }> = ({ label, value, highlight }) => (
    <div className={`p-3 rounded-md ${highlight ? 'bg-amber-50' : ''}`}>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className={`text-sm p-2 rounded ${highlight ? 'text-amber-900 bg-amber-50' : 'text-gray-900'}`}>
        {value ?? ''}
      </div>
    </div>
  );

  const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg">
      <h2 className="text-base font-semibold text-ht-gray-dark mb-3">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );

  // Use raw DATE values as returned by backend (DATE type, no timezone)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ht-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amendment data...</p>
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

  if (!amendmentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Amendment Not Found</h2>
          <p className="text-gray-600 mb-4">The requested amendment could not be found.</p>
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

  // Wait for original corporate to load to prevent blank values in comparison
  if (isOriginalLoading || !originalCorporate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ht-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading corporate baseline for comparison...</p>
        </div>
      </div>
    );
  }

  const changedFields = amendmentData?.amendment_data?.changed_fields || null;
  const status = amendmentData?.amendment_data?.status || 'pending';

  const buildViewPair = () => {
    // Prefer explicit original/amended snapshots when provided by backend
    const storedOriginal = amendmentData?.amendment_data?.original_data || null;
    const storedAmended = amendmentData?.amendment_data?.amended_data || null;
    const hasStoredSnapshots = storedOriginal && typeof storedOriginal === 'object' && Object.keys(storedOriginal).length > 0;
    
    if (hasStoredSnapshots) {
      // Use stored snapshots - these are the true original vs amended data
      return { original: storedOriginal, amended: storedAmended || storedOriginal };
    }

    // Fallback: If no stored snapshots, reconstruct from current corporate data + changes
    // Note: This may show no changes if the amendment was already approved and applied
    const delta = (amendmentData?.amendment_data?.changed_fields && Object.keys(amendmentData.amendment_data.changed_fields || {}).length > 0)
      ? amendmentData.amendment_data.changed_fields
      : (amendmentData?.amendment_data?.amendedData && typeof amendmentData.amendment_data.amendedData === 'object')
        ? amendmentData.amendment_data.amendedData
        : (amendmentData?.amendment_data?.amended_data && typeof amendmentData.amendment_data.amended_data === 'object')
          ? amendmentData.amendment_data.amended_data
          : null;

    const original = originalCorporate || {};

    const deepMerge = (base: any, patch: any): any => {
      if (Array.isArray(base) && Array.isArray(patch)) {
        // If array provided in delta, take it as authoritative
        return patch;
      }
      if (base && typeof base === 'object' && patch && typeof patch === 'object') {
        const out: any = Array.isArray(base) ? [...base] : { ...base };
        Object.entries(patch).forEach(([key, value]) => {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            (out as any)[key] = deepMerge((base as any)[key], value);
          } else {
            (out as any)[key] = value as any;
          }
        });
        return out;
      }
      return patch ?? base;
    };

    if (delta && typeof delta === 'object') {
      const amended = deepMerge(original, delta);
      return { original, amended };
    }

    // Fallback: show original on both sides so the page is not empty
    return { original, amended: original };
  };

  const { original: original_data, amended: amended_data } = buildViewPair();

  return (
    <FormLayout title="Amendment View">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Amendment Comparison</h1>
              <p className="text-sm text-gray-600">Left: Original • Right: Amendment</p>
            </div>
            <button
              onClick={() => {
                if (originalCorporate?.uuid) {
                  // Prefer previous status from amendment (from_status) if available
                  const prevStatus = amendmentData?.from_status || originalCorporate.status;
                  let mode = 'edit';

                  if (prevStatus === 'Pending 1st Approval') {
                    mode = 'approve';
                  } else if (prevStatus === 'Pending 2nd Approval') {
                    mode = 'approve-second';
                  }

                  router.push(`/corporate/${originalCorporate.uuid}?mode=${mode}&step=2`);
                } else {
                  router.back();
                }
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <SectionCard title="Original (Read-only)">
                {renderCompanySection(original_data, amended_data)}
                <SectionCard title="Contact Person">{renderContactsSection(original_data, amended_data)}</SectionCard>
                <SectionCard title="Subsidiaries">{renderSubsidiariesSection(original_data, amended_data)}</SectionCard>
                <SectionCard title="Billing Address">{renderBillingSection(original_data, amended_data)}</SectionCard>
                <SectionCard title="Tax Information">{renderTaxSection(original_data, amended_data)}</SectionCard>
                <SectionCard title="Commercial Terms">{renderCommercialSection(original_data, amended_data)}</SectionCard>
              </SectionCard>
            </div>

            <div>
              <SectionCard title="Amendment (Read-only)">
                {renderCompanySection(amended_data, original_data)}
                <SectionCard title="Contact Person">{renderContactsSection(amended_data, original_data)}</SectionCard>
                <SectionCard title="Subsidiaries">{renderSubsidiariesSection(amended_data, original_data)}</SectionCard>
                <SectionCard title="Billing Address">{renderBillingSection(amended_data, original_data)}</SectionCard>
                <SectionCard title="Tax Information">{renderTaxSection(amended_data, original_data)}</SectionCard>
                <SectionCard title="Commercial Terms">{renderCommercialSection(amended_data, original_data)}</SectionCard>
              </SectionCard>
            </div>
          </div>

          {/* Status Display */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Amendment Status</h3>
            <p className="text-sm text-gray-600">
              This amendment request is currently {status}. 
              {status === 'pending' && ' It is awaiting review by the CRT team.'}
              {status === 'approved' && ' It has been approved and the changes have been applied.'}
              {status === 'rejected' && ' It has been declined by the CRT team.'}
            </p>
          </div>
        </div>
      </div>
    </FormLayout>
  );
};

export default AmendmentViewPage;
