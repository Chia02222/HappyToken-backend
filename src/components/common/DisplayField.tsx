
import React from 'react';

interface DisplayFieldProps {
    label: string;
    value: string | React.ReactNode;
}

const DisplayField: React.FC<DisplayFieldProps> = ({ label, value }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <div className="p-2 w-full bg-white dark:bg-white border border-gray-300 rounded-md text-sm min-h-[38px] flex items-center">
      {value || <span className="text-gray-400">N/A</span>}
    </div>
  </div>
);

export default DisplayField;
