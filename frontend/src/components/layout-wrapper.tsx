'use client';

import { usePathname } from 'next/navigation';
import AppSidebar from './app-sidebar';
import { SidebarInset, SidebarProvider } from './ui/sidebar';

type LayoutWrapperProps = {
  children: React.ReactNode;
};

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Show sidebar only on dashboard, inventory, and analytics routes
  const showSidebar =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/inventory') ||
    pathname?.startsWith('/analytics');

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
