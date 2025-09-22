
import React from 'react';

interface SelectFieldProps {
    label: string;
    name: string;
    id: string;
    value: string | number | null;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
    error?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, name, id, value, onChange, required = false, children, className, error }) => (
    <div className={className}>
        <label htmlFor={id || name} className="block text-xs font-medium text-gray-700 mb-1">
            {required && <span className="text-red-500">*</span>}{label}
        </label>
        <select
            id={id || name}
            name={name}
            value={value ?? ''}
            onChange={onChange}
            className={`w-full border rounded-md shadow-sm p-2 text-sm focus:ring-ht-blue focus:border-ht-blue bg-white dark:bg-white ${error ? 'border-red-500' : 'border-gray-300'}`}
        >
            {children}
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

export default SelectField;
