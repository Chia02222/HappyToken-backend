"use client";

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { CorporateDetails } from '../../types';

interface HistoryLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    corporate: CorporateDetails | null;
    onSave: (corporateId: string, note: string) => void;
}

const HistoryLogModal: React.FC<HistoryLogModalProps> = ({ isOpen, onClose, corporate, onSave }) => {
    const [logNote, setLogNote] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setLogNote('');
        }
    }, [isOpen]);

    const handleSave = () => {
        console.log('handleSave called');
        if (corporate && logNote.trim()) {
            onSave(corporate.id, logNote);
            onClose(); // Add this line to close the modal
        }
    };

    if (!corporate) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`History & Log for ${corporate.company_name}`} size="lg">
            <div className="space-y-4">
                {/* History Section */}
                <div className="max-h-64 overflow-y-auto pr-2 space-y-4 border rounded-md p-3 bg-gray-50">
                    {corporate.investigation_log && corporate.investigation_log.length > 0 ? (
                        [...corporate.investigation_log].map((log) => (
                            <div key={log.id} className="p-3 border rounded-md bg-white shadow-sm">
                                <p className="text-xs text-gray-500 mb-1">{log.timestamp}</p>
                                {log.from_status && log.to_status ? (
                                    <p className="text-sm font-semibold text-ht-gray-dark">
                                        Status changed from <StatusBadge status={log.from_status} /> to <StatusBadge status={log.to_status} />
                                    </p>
                                ) : (
                                    <p className="text-sm font-semibold text-ht-gray-dark">Log Added</p>
                                )}
                                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: log.note }} />
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No investigation history found.</p>
                    )}
                </div>

                {/* Add Log Section */}
                <div>
                    <h4 className="text-sm font-semibold text-ht-gray-dark mb-2">Add New Log</h4>
                    <textarea
                        value={logNote}
                        onChange={(e) => setLogNote(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-ht-blue focus:border-ht-blue"
                        placeholder="Add a new investigation note..."
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-3 mt-2 border-t">
                    <button onClick={onClose} className="text-sm bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Close</button>
                    <button onClick={handleSave} disabled={!logNote.trim()} className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark disabled:bg-ht-gray">Save Log</button>
                </div>
            </div>
        </Modal>
    );
};

export default HistoryLogModal;