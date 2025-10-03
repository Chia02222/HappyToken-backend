"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface LogEntry {
  timestamp: string;
  action: string;
  details: string;
  status: 'completed' | 'pending' | 'rejected' | 'draft';
  amendmentId?: string;
}

interface TimelineEntryProps {
  log: LogEntry;
  getAmendmentIdForTimelineEntry: (timelineEntry: LogEntry) => string | null;
  getAmendmentNumber: (timelineEntry: LogEntry) => number;
}

const TimelineEntry: React.FC<TimelineEntryProps> = ({ 
  log, 
  getAmendmentIdForTimelineEntry, 
  getAmendmentNumber 
}) => {
  const router = useRouter();

  return (
    <div className="flex items-start space-x-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">
            {log.action}
            {log.action === 'Amendment Requested' && getAmendmentIdForTimelineEntry(log) && (
              <button
                type="button"
                onClick={() => router.push(`/amendment/view/${getAmendmentIdForTimelineEntry(log)}`)}
                className="ml-2 inline-flex items-center text-xs text-ht-blue hover:text-ht-blue-dark"
              >
                View #{getAmendmentNumber(log)}
              </button>
            )}
          </p>
          <p className="text-xs text-gray-500">{log.timestamp}</p>
        </div>
        <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{log.details}</p>
      </div>
    </div>
  );
};

export default TimelineEntry;
