
import React from 'react';
import { Page, NavItem } from '../types';
import { NAV_ITEMS, SETTINGS_ITEMS, REPORTS_ITEMS } from '../constants';
import { ChevronDoubleLeftIcon } from './Icons';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userRole: 'admin' | 'client';
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isCollapsed, onToggleCollapse, userRole }) => {

  const NavLink: React.FC<{ item: NavItem }> = ({ item }) => {
    const isActive = currentPage === item.name;
    return (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setCurrentPage(item.name);
        }}
        className={`flex items-center py-2.5 text-ht-gray-dark rounded-md hover:bg-white transition-colors duration-200 ${isActive ? 'bg-white font-semibold' : ''} ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}
        title={isCollapsed ? item.name : ''}
      >
        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-ht-blue' : 'text-ht-gray'} ${isCollapsed ? '' : 'mr-3'}`} />
        {!isCollapsed && <span>{item.name}</span>}
      </a>
    );
  };
  
  const ReportLinks: React.FC<{ item: NavItem }> = ({ item }) => {
    return (
      <div>
        <div className={`flex items-center py-2.5 text-ht-gray-dark ${isCollapsed ? 'justify-center px-2' : 'px-4'}`} title={isCollapsed ? item.name : ''}>
          <item.icon className={`w-5 h-5 flex-shrink-0 text-ht-gray ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && <span>{item.name}</span>}
        </div>
        {!isCollapsed && (
          <div className="pl-8 flex flex-col space-y-1 mt-1">
            {item.subItems?.map((subItem) => (
              <a href="#" key={subItem} className="text-ht-gray-dark hover:text-ht-blue text-xs py-1">
                {subItem}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (userRole === 'admin' && item.name === 'Approver Corporate') {
        return false;
    }
    if (userRole === 'client' && item.name === 'CRT Corporate') {
        return false;
    }
    return true;
  });

  return (
    <aside className={`bg-ht-blue-light flex flex-col ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out`}>
      <div className="text-2xl font-bold text-ht-blue-dark py-4 text-center p-4">
        {isCollapsed ? (userRole === 'admin' ? 'A' : 'C') : (userRole === 'admin' ? 'ADMIN' : 'CLIENT')}
      </div>
      <nav className="flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden p-4">
        <div>
            <div className="space-y-2">
                {filteredNavItems.map((item) => <NavLink key={item.name} item={item} />)}
            </div>
            
            <div className="mt-8">
                {!isCollapsed && <h3 className="px-4 text-xs font-semibold text-ht-gray uppercase tracking-wider">Settings</h3>}
                <div className="mt-2 space-y-2">
                    {SETTINGS_ITEMS.map((item) => <NavLink key={item.name} item={item} />)}
                </div>
            </div>

            <div className="mt-8">
                {!isCollapsed && <h3 className="px-4 text-xs font-semibold text-ht-gray uppercase tracking-wider">Reports</h3>}
                <div className="mt-2">
                    <ReportLinks item={REPORTS_ITEMS} />
                </div>
            </div>
        </div>

        <div className="mt-4">
          <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center p-2 text-ht-gray-dark rounded-md hover:bg-white transition-colors duration-200"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
              <ChevronDoubleLeftIcon className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
