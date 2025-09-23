
import React from 'react';

interface InputFieldProps {
    label: string;
    name: string;
    id: string;
    value: string | number | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    type?: string;
    placeholder?: string;
    error?: string;
    min?: string;
    max?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, id, value, onChange, required = false, type = 'text', placeholder = '', error, min, max }) => (
    <div>
        {label && (
            <label htmlFor={id || name} className="block text-xs font-medium text-gray-700 mb-1">
                {required && <span className="text-red-500">*</span>}{label}
            </label>
        )}
        <input
            type={type}
            id={id || name}
            name={name}
            value={value ?? ''}
            onChange={onChange}
            placeholder={placeholder}
            min={min}
            max={max}
            className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 text-sm focus:ring-ht-blue focus:border-ht-blue bg-white dark:bg-white`}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

export default InputField;
