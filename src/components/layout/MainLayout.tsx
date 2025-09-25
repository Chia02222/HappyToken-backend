
import React from 'react';
import Sidebar from '../Sidebar';
import Header from './Header';
import Footer from './Footer';
import { Page } from '../../types';

interface MainLayoutProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    isSidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    children: React.ReactNode;
    userRole: 'admin' | 'client';
    onLogout?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ currentPage, setCurrentPage, isSidebarCollapsed, onToggleSidebar, children, userRole, onLogout }) => {
    return (
        <div className="flex h-screen bg-ht-gray-light font-sans text-sm">
            <Sidebar
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={onToggleSidebar}
                userRole={userRole}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header userRole={userRole} onLogout={onLogout} currentPage={currentPage} />
                <main className={`flex-1 overflow-y-auto ${currentPage === 'CRT Corporate' ? '' : 'p-6'}`}>
                    {children}
                </main>
                {currentPage !== 'CRT Corporate' && <Footer />}
            </div>
        </div>
    );
};

export default MainLayout;
