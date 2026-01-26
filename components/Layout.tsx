import React from 'react';
import { useData } from '../contexts/DataContext.tsx';
import { UserRole } from '../types.ts';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, logout, notification } = useData();

  if (!currentUser) return <>{children}</>;

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const NavItem = ({ id, label, icon }: { id: string, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-3 w-full text-left transition-colors duration-200 ${
        activeTab === id 
          ? 'bg-blue-600 text-white' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="font-medium tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white animate-fade-in-down ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-600'
        }`}>
          {notification.message}
        </div>
      )}

      <aside className="hidden md:flex flex-col w-64 bg-white shadow-xl h-screen sticky top-0 z-10">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-blue-700 leading-tight">專案行銷<br/>加班補休系統</h1>
          <p className="text-sm text-slate-500 mt-2">你好, {currentUser.username}</p>
          <div className="mt-2 text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block">
            {isAdmin ? '系統管理員' : `補休餘額: ${currentUser.compTimeBalance}小時`}
          </div>
        </div>
        <nav className="flex-1 py-4">
          <NavItem id="dashboard" label="儀表板" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} />
          <NavItem id="apply" label="申請加班/補休" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>} />
          {isAdmin && (
             <NavItem id="admin" label="管理後台" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
          )}
          <NavItem id="settings" label="個人設定" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={logout} className="flex items-center text-red-600 hover:bg-red-50 px-4 py-2 w-full rounded transition font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            登出系統
          </button>
        </div>
      </aside>

      <div className="md:hidden bg-white shadow-md sticky top-0 z-20">
        <div className="flex justify-between items-center p-4">
            <div>
                 <h1 className="font-bold text-blue-700 text-lg">專案行銷加班補休系統</h1>
                 <span className="text-xs text-gray-500">餘額: {currentUser.compTimeBalance}小時</span>
            </div>
          
          <button onClick={() => {
              const menu = document.getElementById('mobile-menu');
              if(menu) menu.classList.toggle('hidden');
          }} className="text-slate-600 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
        <div id="mobile-menu" className="hidden bg-slate-50 border-t border-slate-200 animate-fade-in-down">
           <NavItem id="dashboard" label="儀表板" icon={<span />} />
           <NavItem id="apply" label="申請加班/補休" icon={<span />} />
           {isAdmin && <NavItem id="admin" label="管理後台" icon={<span />} />}
           <NavItem id="settings" label="個人設定" icon={<span />} />
           <button onClick={logout} className="block w-full text-left px-8 py-3 text-red-600 font-medium border-t">登出系統</button>
        </div>
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;