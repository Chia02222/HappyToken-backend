
import React from 'react';

interface ContentSectionProps {
    title: string;
    children: React.ReactNode;
}

const ContentSection: React.FC<ContentSectionProps> = ({ title, children }) => (
  <div className="mt-8">
    <h2 className="text-sm font-semibold border-b-2 border-gray-800 pb-1 mb-4 uppercase tracking-wider">{title}</h2>
    {children}
  </div>
);

export default ContentSection;
