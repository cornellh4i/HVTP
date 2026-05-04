'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppSidebar from './Navbar/Desktop-Navbar/app-sidebar';
import MobileNavbar from './Navbar/Mobile-Navbar/mobile-navbar';
import { SidebarInset, SidebarProvider } from './ui/sidebar';
import { useAuth } from '@/utils/AuthContext';

const PROTECTED_PATHS = ['/dashboard', '/inventory', '/transactions'];

type LayoutWrapperProps = {
  children: React.ReactNode;
};

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  const isProtected = PROTECTED_PATHS.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isProtected && !loading && !user) {
      router.push('/login');
    }
  }, [isProtected, loading, user, router]);

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

  const showSidebar =
    mounted && (
      pathname?.startsWith('/dashboard') ||
      pathname?.startsWith('/inventory') ||
      pathname?.startsWith('/transactions')
    );

  if (isProtected && (loading || !user)) {
    return null;
  }

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
      {/* Temp disabled mobile navbar */}
      {/* <div className="md:hidden">
        <MobileNavbar />
      </div> */}
    </SidebarProvider>
  );
}
