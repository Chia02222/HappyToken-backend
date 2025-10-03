/**
 * Reusable form field component
 * Eliminates duplicate form field patterns
 */

import React from 'react';
import InputField from './InputField';
import SelectField from './SelectField';
import SearchableCallingCodeField from './SearchableCallingCodeField';

export interface FormFieldProps {
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'calling-code' | 'textarea';
  id: string;
  name: string;
  label: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  type,
  id,
  name,
  label,
  value,
  onChange,
  onValueChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  options = [],
  rows = 3,
  className = ''
}) => {
  const commonProps = {
    id,
    name,
    label,
    value,
    onChange,
    required,
    disabled,
    error,
    className
  };

  switch (type) {
    case 'calling-code':
      return (
        <SearchableCallingCodeField
          value={value}
          onChange={onValueChange || (() => {})}
          id={id}
        />
      );
    
    case 'select':
      return (
        <SelectField {...commonProps}>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      );
    
    case 'textarea':
      return (
        <div className={className}>
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:ring-ht-blue focus:border-ht-blue sm:text-sm ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            } ${error ? 'border-red-500' : 'border-gray-300'}`}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );
    
    default:
      return (
        <InputField
          {...commonProps}
          type={type}
          placeholder={placeholder}
        />
      );
  }
};

export default FormField;
