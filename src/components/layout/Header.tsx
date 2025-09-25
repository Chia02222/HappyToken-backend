
import React from 'react';

interface HeaderProps {
    userRole: 'admin' | 'client';
    onLogout?: () => void;
    currentPage?: string;
}

const Header: React.FC<HeaderProps> = ({ userRole, onLogout, currentPage }) => {
    return (
        <header className="h-16 w-full bg-ht-blue flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
                {currentPage && (
                    <div className="text-white text-lg font-semibold ">
                        {currentPage}
                    </div>
                )}
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-white text-sm">
                    {userRole === 'admin' ? 'Admin' : 'Client'}
                </span>
                {onLogout && (
                    <button
                        onClick={onLogout}
                        className="text-white hover:text-gray-200 text-sm px-3 py-1 rounded-md hover:bg-ht-blue-dark transition-colors"
                    >
                        Logout
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
