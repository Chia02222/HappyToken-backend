
import React from 'react';

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
    footer: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, footer }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-ht-gray-dark">{title}</h3>
        </div>
        <div style={{ height: '250px' }}>{children}</div>
        <div className="mt-4 border-t pt-4 text-ht-gray-dark text-sm">
          {footer}
        </div>
    </div>
);

export default ChartCard;
