
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
import { LogOut, Settings, FileText, Cog, FlaskConical, UserPlus, ShieldAlert, Bell, Home, Network, LayoutGrid, Users } from "lucide-react"; // Added Users
import Link from "next/link";
import { usePathname } from 'next/navigation';

interface AppSidebarProps {
  onSelectItem: (item: NavItem) => void;
  selectedItemId?: string;
}

const getAdminIcon = (href: string) => {
  // if (href.includes('/admin/clients/create')) return UserPlus; // No longer needed here
  if (href.includes('/admin/clients')) return Users; // Icon for List Clients
  if (href.includes('/admin/sensors')) return Cog;
  if (href.includes('/admin/formulas/validate')) return FlaskConical;
  if (href.includes('/admin/formulas')) return FileText;
  return FileText; // Default admin icon
};

export function AppSidebar({ onSelectItem, selectedItemId }: AppSidebarProps) {
  const pathname = usePathname();
  const isClientView = pathname.startsWith('/client/');
  const isLoginPage = pathname === '/login';

  let mainNavItems: NavItem[] = [];
  let adminToolsNavItems: NavItem[] = [];
  let showAdminToolsSection = false;

  if (!isLoginPage) {
    if (isClientView) {
      mainNavItems = [
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
          href: '/monitoring',
          onClick: () => window.location.href = '/monitoring',
        },
        {
          id: 'client-notifications-link',
          label: 'Notifications',
          type: 'group',
          icon: Bell,
          href: '/notifications',
          onClick: () => window.location.href = '/notifications',
        },
        {
          id: 'client-assets-link',
          label: 'Asset Management',
          type: 'group',
          icon: Network,
          href: '/assets',
          onClick: () => window.location.href = '/assets',
        },
      ];
      showAdminToolsSection = false;
    } else { // Admin View (or default if not client and not login)
      mainNavItems = [
        {
          id: 'admin-dashboard-link',
          label: 'Dashboard',
          type: 'group',
          icon: LayoutGrid,
          href: '/', 
          onClick: () => window.location.href = '/',
        },
        // Admin does NOT see Monitoring or Notifications in main nav here
      ];
      adminToolsNavItems = siteConfig.adminNav.map(item => ({
        ...item,
        id: item.href, 
        label: item.title,
        icon: getAdminIcon(item.href),
        type: 'group' as NavItem['type'], 
        onClick: () => { if(item.href) window.location.href = item.href; }
      }));
      showAdminToolsSection = true;
    }
  }

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r">
      <SidebarHeader className="p-4 border-b">
        <Logo className="group-data-[collapsible=icon]:hidden" />
        <Logo className="hidden group-data-[collapsible=icon]:flex justify-center w-full" />
      </SidebarHeader>
      <SidebarContent className="p-0">
        {mainNavItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">Navigation</SidebarGroupLabel>
            <SidebarNav items={mainNavItems} onSelectItem={onSelectItem} selectedItemId={selectedItemId} />
          </SidebarGroup>
        )}
        
        {showAdminToolsSection && adminToolsNavItems.length > 0 && (
          <>
            <Separator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">Admin Tools</SidebarGroupLabel>
              <SidebarNav 
                items={adminToolsNavItems} 
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
