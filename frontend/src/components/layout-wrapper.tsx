'use client';

import { usePathname } from 'next/navigation';
import AppSidebar from './Navbar/Desktop-Navbar/app-sidebar';
import MobileNavbar from './Navbar/Mobile-Navbar/mobile-navbar';
import { SidebarInset, SidebarProvider } from './ui/sidebar';

type LayoutWrapperProps = {
  children: React.ReactNode;
};

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  if (pathname?.startsWith('/scan')) {
    return (
      <div className="pb-24 md:pb-0">
        {children}
        <div className="md:hidden">
          <MobileNavbar />
        </div>
      </div>
    );
  }
  
  // Show sidebar only on dashboard, inventory, and analytics routes
  const showSidebar =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/inventory') ||
    pathname?.startsWith('/analytics') || 
    pathname?.startsWith('/archive');

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
