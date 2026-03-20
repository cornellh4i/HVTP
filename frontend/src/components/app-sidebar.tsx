import Link from 'next/link';
import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from './ui/sidebar';
import { usePathname } from 'next/navigation';

export default function AppSidebar() {
  const pathname = usePathname();
  const { state, setSidebarState } = useSidebar();

  const items = [
    {
      title: 'Dashboard',
      url: '/dashboard',
    },
    {
      title: 'Inventory',
      url: '/inventory',
    }
  ];

  return (
    <>
    </>
  );
} 