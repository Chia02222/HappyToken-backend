
import React from 'react';

interface SelectFieldProps {
    label: string;
    name: string;
    id: string;
    value: string | number | null;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    children: React.ReactNode;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, name, id, value, onChange, required = false, children }) => (
    <div>
        <label htmlFor={id || name} className="block text-xs font-medium text-gray-700 mb-1">
            {required && <span className="text-red-500">*</span>}{label}
        </label>
        <select
            id={id || name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-ht-blue focus:border-ht-blue bg-white dark:bg-white"
        >
            {children}
        </select>
    </div>
);

export default SelectField;
