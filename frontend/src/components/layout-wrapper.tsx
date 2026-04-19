'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppSidebar from './Navbar/Desktop-Navbar/app-sidebar';
import MobileNavbar from './Navbar/Mobile-Navbar/mobile-navbar';
import { SidebarInset, SidebarProvider } from './ui/sidebar';

type LayoutWrapperProps = {
  children: React.ReactNode;
};

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showSidebar =
    mounted && (
      pathname?.startsWith('/dashboard') ||
      pathname?.startsWith('/inventory') ||
      pathname?.startsWith('/transactions') 
    );

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider style={{ '--sidebar-width': '14rem' } as React.CSSProperties}>
      <div className="hidden md:contents">
        <AppSidebar />
      </div>
      <SidebarInset>
        <div className="pb-24 md:pb-0">{children}</div>
      </SidebarInset>
      <div className="md:hidden">
        <MobileNavbar />
      </div>
    </SidebarProvider>
  );
}