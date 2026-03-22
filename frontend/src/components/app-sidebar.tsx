import Link from 'next/link';
import { Clock4, BarChart3, Home } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar';
import { usePathname } from 'next/navigation';

export default function AppSidebar() {
  const pathname = usePathname();

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
    }
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="bg-gray-100 border-b">
        <div className="px-4 py-4">
          <h1 className="text-sm font-semibold text-gray-800">The Wool Road</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url || pathname?.startsWith(item.url + '/');
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton 
                  asChild 
                  className={`${
                    isActive 
                      ? 'bg-blue-50 border-l-4 border-l-blue-500 text-blue-600' 
                      : 'hover:bg-gray-50'
                  }`}
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
      </SidebarContent>
    </Sidebar>
  );
}