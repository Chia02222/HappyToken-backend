
import { CorporateDetails } from '../types';

const API_BASE_URL = 'http://localhost:3001';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
    }
    return response.json();
};

export const getCorporates = async () => {
    const response = await fetch(`${API_BASE_URL}/corporates`);
    return handleResponse(response);
};

export const getCorporateById = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/corporates/${id}`);
    return handleResponse(response);
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
