"use client";

import React from 'react';
import TimelineEntry from './TimelineEntry';

interface LogEntry {
  timestamp: string;
  action: string;
  details: string;
  status: 'completed' | 'pending' | 'rejected' | 'draft';
  amendmentId?: string;
}

interface ProcessTimelineProps {
  logs: LogEntry[];
  isTimelineOpen: boolean;
  setIsTimelineOpen: (open: boolean) => void;
  getAmendmentIdForTimelineEntry: (timelineEntry: LogEntry) => string | null;
  getAmendmentNumber: (timelineEntry: LogEntry) => number;
}

const ProcessTimeline: React.FC<ProcessTimelineProps> = ({
  logs,
  isTimelineOpen,
  setIsTimelineOpen,
  getAmendmentIdForTimelineEntry,
  getAmendmentNumber,
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">Process Timeline</h4>
        <button
          type="button"
          onClick={() => setIsTimelineOpen(!isTimelineOpen)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-ht-blue rounded-md px-3 py-2 border border-gray-300 hover:bg-gray-50"
        >
          {isTimelineOpen ? 'Hide Timeline' : 'View Timeline'}
          <svg className={`ml-1 w-4 h-4 transition-transform ${isTimelineOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {isTimelineOpen && (
        <div className="space-y-3 mt-3">
          {logs.map((log, index) => (
            <TimelineEntry
              key={index}
              log={log}
              getAmendmentIdForTimelineEntry={getAmendmentIdForTimelineEntry}
              getAmendmentNumber={getAmendmentNumber}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProcessTimeline;
