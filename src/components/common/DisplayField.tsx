
import React from 'react';

interface DisplayFieldProps {
    label: string;
    value: string | React.ReactNode;
    borderless?: boolean;
}

const DisplayField: React.FC<DisplayFieldProps> = ({ label, value, borderless = false }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <div className={`p-2 w-full bg-white dark:bg-white text-sm min-h-[38px] flex items-center ${borderless ? '' : 'border border-gray-300 rounded-md'}`}>
      {value || ''}
    </div>
  </div>
);

export default DisplayField;
