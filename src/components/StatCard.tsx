
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from './Icons';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon }) => {
  const isIncrease = changeType === 'increase';
  const changeColor = isIncrease ? 'text-green-500' : 'text-red-500';
  const ChangeIcon = isIncrease ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-ht-gray-dark">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{title}</p>
        <div className={`flex items-center text-xs mt-2 ${changeColor}`}>
          <ChangeIcon className="w-3 h-3 mr-1" />
          <span>{change}</span>
        </div>
      </div>
      <div className="text-gray-300">
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
