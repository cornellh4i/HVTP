import Link from 'next/link';
import { Clock4, BarChart3, Home, ArchiveX} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

export default function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setSidebarState } = useSidebar();

  const items = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: <Clock4 className="h-4 w-4" />,
    },
    {
      title: 'Analytics',
      url: '/analytics',
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      title: 'Inventory',
      url: '/inventory',
      icon: <Home className="h-4 w-4" />,
    }, 
    { 
      title: 'Archive',
      url: '/archive',
      icon: <ArchiveX className='h-4 w-4' />
    }
  ];

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      onMouseEnter={() => {
        if (!isMobile) {
          setSidebarState(true);
        }
      }}
      onMouseLeave={() => {
        if (!isMobile) {
          setSidebarState(false);
        }
      }}
    >
      <SidebarHeader className="bg-gray-100 border-b">
        <div className="flex items-center gap-2 px-3 py-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
          <div className="min-w-0 flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
            <h1 className="text-lg font-bold leading-tight tracking-tight whitespace-nowrap text-gray-800">
              The Wool Road
            </h1>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url || pathname?.startsWith(item.url + '/');
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}