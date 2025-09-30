
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
    disabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, name, id, value, onChange, required = false, children, className, error, disabled = false }) => (
    <div className={className}>
        <label htmlFor={id || name} className="block text-xs font-medium text-gray-700 mb-1">
            {required && <span className="text-red-500">*</span>}{label}
        </label>
        <select
            id={id || name}
            name={name}
            value={value ?? ''}
            onChange={onChange}
            disabled={disabled}
            className={`w-full ${disabled ? 'border-0' : `border ${error ? 'border-red-500' : 'border-gray-300'}`} rounded-md shadow-sm p-2 text-sm focus:ring-ht-blue focus:border-ht-blue ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white dark:bg-white'}`}
        >
            {children}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

export default SelectField;
