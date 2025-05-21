import React from 'react';
import type { ReactNode } from 'react';
import Header from './Header';
import NetworkStatus from './NetworkStatus';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content container">
        {children}
      </main>
      <NetworkStatus />
    </div>
  );
};

export default Layout; 