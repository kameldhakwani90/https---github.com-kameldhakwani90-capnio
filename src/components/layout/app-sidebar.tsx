
"use client";

import type { NavItem } from "@/types";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { siteConfig } from "@/config/site";
import { Logo } from "../common/logo";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { LogOut, Settings, FileText, Cog, FlaskConical, UserPlus, ShieldAlert, Bell, Home, Network, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';

interface AppSidebarProps {
  // navTree prop is less relevant now as we build it based on role
  // navTree: NavItem[]; 
  onSelectItem: (item: NavItem) => void;
  selectedItemId?: string;
}

const getAdminIcon = (href: string) => {
  if (href.includes('/admin/sensors')) return Cog;
  if (href.includes('/admin/formulas/validate')) return FlaskConical;
  if (href.includes('/admin/formulas')) return FileText;
  if (href.includes('/admin/clients/create')) return UserPlus;
  return FileText;
};

export function AppSidebar({ onSelectItem, selectedItemId }: AppSidebarProps) {
  const pathname = usePathname();
  const isClientView = pathname.startsWith('/client/');
  // Fallback for login page, though AppLayout handles not rendering sidebar there.
  // This check ensures we don't try to build nav if pathname is null during SSR or weird states.
  const isLoginPage = pathname === '/login';


  let currentNavTree: NavItem[] = [];
  let showAdminToolsSection = false;

  if (!isLoginPage) {
    if (isClientView) {
      currentNavTree = [
        {
          id: 'client-dashboard-link',
          label: 'Dashboard',
          type: 'group',
          icon: LayoutGrid,
          href: '/client/dashboard',
          onClick: () => window.location.href = '/client/dashboard',
        },
        {
          id: 'client-monitoring-link',
          label: 'Monitoring',
          type: 'group',
          icon: ShieldAlert,
          href: '/monitoring', // Path needs to be client-specific or data filtered
          onClick: () => window.location.href = '/monitoring',
        },
        {
          id: 'client-notifications-link',
          label: 'Notifications',
          type: 'group',
          icon: Bell,
          href: '/notifications', // Path needs to be client-specific or data filtered
          onClick: () => window.location.href = '/notifications',
        },
        {
          id: 'client-assets-link',
          label: 'Asset Management',
          type: 'group',
          icon: Network,
          href: '/assets', // Path needs tobe client-specific or data filtered
          onClick: () => window.location.href = '/assets',
        },
      ];
      showAdminToolsSection = false;
    } else { // Admin View (or default if not client and not login)
      currentNavTree = [
        {
          id: 'admin-dashboard-link',
          label: 'Dashboard',
          type: 'group',
          icon: LayoutGrid,
          href: '/', // Admin dashboard is the root
          onClick: () => window.location.href = '/',
        },
        {
          id: 'admin-monitoring-link',
          label: 'Monitoring',
          type: 'group',
          icon: ShieldAlert,
          href: '/monitoring',
          onClick: () => window.location.href = '/monitoring',
        },
        {
          id: 'admin-notifications-link',
          label: 'Notifications',
          type: 'group',
          icon: Bell,
          href: '/notifications',
          onClick: () => window.location.href = '/notifications',
        },
        // Admin does NOT see "Asset Management" in their main nav
      ];
      showAdminToolsSection = true; // Admins see the admin tools
    }
  }


  const adminNavItemsWithIcons = siteConfig.adminNav.map(item => ({
    ...item,
    id: item.href, 
    label: item.title,
    icon: getAdminIcon(item.href),
    type: 'group' as NavItem['type'], 
    onClick: () => { if(item.href) window.location.href = item.href; }
  }));

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r">
      <SidebarHeader className="p-4 border-b">
        <Logo className="group-data-[collapsible=icon]:hidden" />
        <Logo className="hidden group-data-[collapsible=icon]:flex justify-center w-full" />
      </SidebarHeader>
      <SidebarContent className="p-0">
        {currentNavTree.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">Navigation</SidebarGroupLabel>
            <SidebarNav items={currentNavTree} onSelectItem={onSelectItem} selectedItemId={selectedItemId} />
          </SidebarGroup>
        )}
        
        {showAdminToolsSection && (
          <>
            <Separator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">Admin Tools</SidebarGroupLabel>
              <SidebarNav 
                items={adminNavItemsWithIcons} 
                onSelectItem={(item) => { if(item.href) window.location.href = item.href; }} 
                selectedItemId={selectedItemId} 
              />
            </SidebarGroup>
          </>
        )}

      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
        <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center" asChild>
          <Link href="/settings"> 
            <Settings className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Settings</span>
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center" asChild>
          <Link href="/login"> 
            <LogOut className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
