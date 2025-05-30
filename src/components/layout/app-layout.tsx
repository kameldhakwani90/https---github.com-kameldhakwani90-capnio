
"use client";
import type { NavItem } from "@/types";
import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "./header";
import { AppSidebar } from "./app-sidebar";
import { LayoutGrid, ShieldAlert, Bell, Network } from "lucide-react"; // Updated icons
import { siteConfig } from "@/config/site";
import { usePathname } from 'next/navigation'; // To hide sidebar on login page

// Simplified main navigation tree for a cleaner sidebar
const mainNavTree: NavItem[] = [
  {
    id: 'dashboard-link',
    label: 'Dashboard',
    type: 'group', // Treated as a direct link
    icon: LayoutGrid,
    href: '/',
    onClick: () => window.location.href = '/',
  },
  {
    id: 'monitoring-link',
    label: 'Monitoring',
    type: 'group',
    icon: ShieldAlert,
    href: '/monitoring',
    onClick: () => window.location.href = '/monitoring',
  },
  {
    id: 'notifications-link',
    label: 'Notifications',
    type: 'group',
    icon: Bell,
    href: '/notifications',
    onClick: () => window.location.href = '/notifications',
    // Example of showing a count, you'd fetch this data
    // data: { notificationCount: 5 } 
  },
  {
    id: 'assets-link',
    label: 'Asset Management',
    type: 'group',
    icon: Network, // Icon for managing sites/machines/zones
    href: '/assets',
    onClick: () => window.location.href = '/assets',
  },
  // Placeholder for an expandable "Configuration" or "Settings" section if needed at top level
  // For now, admin links are handled separately in AppSidebar based on siteConfig.adminNav
];


interface AppLayoutProps {
  children: React.ReactNode;
  onSelectItem?: (item: NavItem) => void;
  selectedItem?: NavItem | null;
}

export function AppLayout({ children, onSelectItem, selectedItem: initialSelectedItem }: AppLayoutProps) {
  const [currentItem, setCurrentItem] = React.useState<NavItem | null>(initialSelectedItem || null);
  const pathname = usePathname();

  // Do not render AppLayout structure for login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  const handleSelectItem = (item: NavItem) => {
    setCurrentItem(item);
    if (onSelectItem) {
      onSelectItem(item);
    }
    // If item has an href and no specific onClick, navigate
    if (item.href && !item.onClick) {
      window.location.href = item.href;
    }
  };
  
  return (
    <SidebarProvider defaultOpen={true} open={undefined} onOpenChange={undefined}>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1">
          <AppSidebar 
            navTree={mainNavTree} 
            onSelectItem={handleSelectItem} 
            selectedItemId={currentItem?.id}
          />
          <SidebarInset>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                  if (typeof child.type === 'string') {
                    return child;
                  }
                  // It's a React component, pass selectedItem if it's not the InfoPanel on dashboard
                  // Or if the component is expecting it.
                  // For now, pass to all custom components.
                  return React.cloneElement(child as React.ReactElement<any>, { selectedItem: currentItem });
                }
                return child;
              })}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
