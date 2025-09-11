
import React from 'react';

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-base font-semibold text-ht-gray-dark border-b pb-3 mb-6">{title}</h2>
        {children}
    </div>
);

export default FormSection;
