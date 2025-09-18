"use client";

import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (role: 'admin' | 'client') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [role, setRole] = useState<'admin' | 'client'>('admin');

  const handleLogin = () => {
    onLogin(role);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <div className="mb-4">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'client')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ht-blue focus:border-ht-blue"
          >
            <option value="admin">Admin</option>
            <option value="client">Client</option>
          </select>
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-ht-blue text-white py-2 px-4 rounded-md hover:bg-ht-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
