
import React from 'react';

interface InputFieldProps {
    label: string;
    name: string;
    id: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    type?: string;
    placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, id, value, onChange, required = false, type = 'text', placeholder = '' }) => (
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
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-ht-blue focus:border-ht-blue bg-white dark:bg-white"
        />
    </div>
);

export default InputField;
