
import { CorporateDetails } from '../types';

const API_BASE_URL = 'http://localhost:3001';

const handleResponse = async (response: Response) => {
    // Read raw text once and safely parse JSON when possible
    let raw = '';
    try {
        raw = await response.text();
    } catch {}
    const hasBody = typeof raw === 'string' && raw.trim().length > 0;

    let parsed: any = null;
    if (hasBody) {
        try {
            parsed = JSON.parse(raw);
        } catch {
            parsed = raw; // non-JSON payload
        }
    }

    if (!response.ok) {
        // Build best-possible message
        let msg = response.statusText || 'Request failed';
        if (parsed && typeof parsed === 'object') {
            const m = (parsed.message ?? parsed.error ?? parsed.errors);
            if (Array.isArray(m)) msg = m.join('; ');
            else if (typeof m === 'string') msg = m;
            else msg = JSON.stringify(parsed);
        } else if (typeof parsed === 'string' && parsed.trim()) {
            msg = parsed.trim();
        }
        throw new Error(msg);
    }

    // Successful: return parsed JSON if present, else null
    return hasBody ? parsed : null;
};

const mapCorporate = (c: any) => ({
    ...c,
    id: c.id ?? c.uuid,
});

const mapCorporateDetails = (c: any) => ({
    ...c,
    id: c.id ?? c.uuid,
    secondary_approver_id: c.secondary_approver_id ?? c.secondary_approver_uuid ?? null,
    contacts: Array.isArray(c.contacts)
        ? c.contacts.map((ct: any) => ({ ...ct, id: ct.id ?? ct.uuid }))
        : [],
    subsidiaries: Array.isArray(c.subsidiaries)
        ? c.subsidiaries.map((s: any) => ({ ...s, id: s.id ?? s.uuid }))
        : [],
});

const mapLog = (l: any) => ({
    ...l,
    id: l.id ?? l.uuid,
    corporate_id: l.corporate_id ?? l.corporate_uuid,
});

export const getCorporates = async () => {
    const response = await fetch(`${API_BASE_URL}/corporates`);
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(mapCorporate) : data;
};

export const getCorporateById = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/corporates/${id}`);
    const data = await handleResponse(response);
    return data ? mapCorporateDetails(data) : data;
};

export const createCorporate = async (data: Omit<CorporateDetails, 'id' | 'created_at' | 'investigation_log' | 'contacts' | 'subsidiaries' | 'contactIdsToDelete' | 'subsidiaryIdsToDelete'>) => {
    const response = await fetch(`${API_BASE_URL}/corporates`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const updateCorporate = async (id: string, data: CorporateDetails) => {
    const response = await fetch(`${API_BASE_URL}/corporates/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const updateCorporateStatus = async (id: string, status: string, note?: string) => {
    const response = await fetch(`${API_BASE_URL}/corporates/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, note }),
    });
    return handleResponse(response);
};

export const submitCorporateForFirstApproval = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/corporates/${id}/submit`, {
        method: 'PUT',
    });
    return handleResponse(response);
};

export const addRemark = async (corporateId: string, note: string, fromStatus?: string, toStatus?: string) => {
    const response = await fetch(`${API_BASE_URL}/corporates/${corporateId}/investigation-logs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note, timestamp: new Date().toISOString(), from_status: fromStatus, to_status: toStatus }),
    });
    return handleResponse(response);
};

export const deleteCorporate = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/corporates/${id}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
};

export const sendEcommericialTermlink = async (id: string, approver: 'first' | 'second' = 'first') => {
    const q = approver ? `?approver=${approver}` : '';
    const response = await fetch(`${API_BASE_URL}/corporates/${id}/resend-link${q}`, {
        method: 'POST',
    });
    return handleResponse(response);
};

export const sendAmendmentEmail = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/corporates/${id}/send-amendment-email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return handleResponse(response);
};

export const sendAmendRejectEmail = async (id: string, note?: string) => {
    const response = await fetch(`${API_BASE_URL}/corporates/${id}/send-amend-reject-email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
    });
    return handleResponse(response);
};

// Amendment Request API functions
export const createAmendmentRequest = async (corporateId: string, amendmentData: any) => {
    const response = await fetch(`${API_BASE_URL}/corporates/${corporateId}/amendment-requests`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(amendmentData),
    });
    return handleResponse(response) as Promise<{ success: boolean; message?: string; amendmentId: string }>;
};

export const getAmendmentRequests = async (corporateId?: string) => {
    const url = corporateId 
        ? `${API_BASE_URL}/corporates/amendment-requests?corporateId=${corporateId}`
        : `${API_BASE_URL}/corporates/amendment-requests`;
    const response = await fetch(url);
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(mapLog) : data;
};

export const getAmendmentById = async (amendmentId: string) => {
    const response = await fetch(`${API_BASE_URL}/corporates/amendment-requests/${amendmentId}`);
    const data = await handleResponse(response);
    return data ? mapLog(data) : data;
};

export const getAmendmentRequestsByCorporate = async (corporateId: string) => {
    const response = await fetch(`${API_BASE_URL}/corporates/${corporateId}/amendment-requests`);
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(mapLog) : data;
};

export const updateAmendmentStatus = async (corporateId: string, amendmentId: string, status: 'approved' | 'rejected', reviewNotes?: string) => {
    const response = await fetch(`${API_BASE_URL}/corporates/${corporateId}/amendment-requests/${amendmentId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, reviewNotes }),
    });
    return handleResponse(response);
};
