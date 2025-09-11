"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import StatCard from './StatCard';
import { UserGroupIcon, KeyIcon, TicketIcon } from './Icons';
import ChartCard from './common/ChartCard';

const corporateRevenueData = [
  { name: 'Item 1', value: 25 },
  { name: 'Item 2', value: 28 },
  { name: 'Item 3', value: 24 },
  { name: 'Item 4', value: 35 },
  { name: 'Item 5', value: 42 },
];

const merchantCommissionData = [
  { name: 'Item 1', value: 20 },
  { name: 'Item 2', value: 29 },
  { name: 'Item 3', value: 22 },
  { name: 'Item 4', value: 38 },
  { name: 'Item 5', value: 34 },
];

const totalRevenueData = [
    { name: 'Item 1', value: 12, fill: '#8884d8' },
    { name: 'Item 2', value: 19, fill: '#83a6ed' },
    { name: 'Item 3', value: 22, fill: '#8dd1e1' },
    { name: 'Item 4', value: 25, fill: '#82ca9d' },
    { name: 'Item 5', value: 8, fill: '#a4de6c' },
    { name: 'Item 6', value: 33, fill: '#d0ed57' },
    { name: 'Item 7', value: 41, fill: '#ffc658' },
    { name: 'Item 8', value: 15, fill: '#ff8042' },
    { name: 'Item 9', value: 21, fill: '#f55d5d' },
    { name: 'Item 10', value: 24, fill: '#f776a0' },
    { name: 'Item 11', value: 18, fill: '#c678dd' },
    { name: 'Item 12', value: 48, fill: '#8884d8' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Active Merchant" value="123" change="+10" changeType="increase" icon={<UserGroupIcon className="w-10 h-10" />} />
        <StatCard title="Total Corporate Key Account" value="45" change="-2" changeType="decrease" icon={<KeyIcon className="w-10 h-10" />} />
        <StatCard title="Total Active Buyer" value="250" change="+2" changeType="increase" icon={<UserGroupIcon className="w-10 h-10" />} />
        <StatCard title="Total Active Vouchers" value="45" change="" changeType="increase" icon={<TicketIcon className="w-10 h-10" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
            title="Platform Corporate Revenue"
            footer={<>
                <p>Month-To-Date: MYR 476,000.00</p>
                <p>Year-To-Date: MYR 1,098,000.00</p>
            </>}
        >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={corporateRevenueData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} dy={10} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#00BCD4" strokeWidth={2} dot={{ r: 4, fill: '#00BCD4' }} />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>

         <ChartCard 
            title="Platform Merchant Commission Revenue"
            footer={<>
                <p>Month-To-Date: MYR 869,000.00</p>
                <p>Year-To-Date: MYR 2,698,000.00</p>
            </>}
        >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={merchantCommissionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} dy={10} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4, fill: '#82ca9d' }} />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-semibold text-ht-gray-dark mb-4">Platform Total Revenue</h3>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
            {totalRevenueData.map((item, index) => (
                <div key={index} className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.fill }}></span>
                    <span className="text-xs">{item.name}</span>
                </div>
            ))}
        </div>
        <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={totalRevenueData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} dy={10} />
                    <YAxis tickLine={false} axisLine={false}/>
                    <Tooltip cursor={{fill: 'rgba(245, 245, 245, 0.5)'}}/>
                    <Bar dataKey="value" />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
