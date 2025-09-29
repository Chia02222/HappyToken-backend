'use client';

import React from 'react';
import { Page } from '../../types';

interface HeaderProps {
    userRole: 'admin' | 'client';
    onLogout?: () => void;
    currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ userRole, onLogout, currentPage }) => {
    return (
        <div className="bg-ht-blue shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-white">{currentPage}</h1>
            <div className="flex items-center gap-3">
                <span className="text-white text-sm">{userRole === 'admin' ? 'Admin' : 'Client'}</span>
                {onLogout && (
                    <button
                        onClick={onLogout}
                        className="text-sm bg-white text-ht-blue px-3 py-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue"
                    >
                        Logout
                    </button>
                )}
            </div>
        </div>
    );
};

export default Header;