
import React from 'react';

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
    rightAction?: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children, rightAction }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between border-b pb-3 mb-6">
            <h2 className="text-base font-semibold text-ht-gray-dark">{title}</h2>
            {rightAction ? (
                <div className="ml-4">{rightAction}</div>
            ) : null}
        </div>
        {children}
    </div>
);

export default FormSection;
