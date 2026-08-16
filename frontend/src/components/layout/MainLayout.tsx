import React, { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Sidebar />
      <Header />
      
      {/* Main Content Area */}
      <main className="ml-64 mt-16 p-8 bg-gray-50 dark:bg-gray-800 min-h-screen transition-colors">
        {children}
      </main>
    </div>
  );
};
