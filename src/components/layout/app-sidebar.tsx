
"use client";

import type { NavItem } from "@/types";
import React, { useState, useEffect, useMemo } from "react";
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
import { LogOut, Settings, FileText, Cog, FlaskConical, Users, ShieldAlert, Bell, Home, Network, LayoutGrid, Cpu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation'; 

interface AppSidebarProps {
  onSelectItem: (item: NavItem) => void;
  selectedItemId?: string;
}

const getAdminIcon = (href?: string) => {
  if (!href) return FileText;
  if (href.includes('/admin/clients')) return Users;
  if (href.includes('/admin/sensors')) return Cog;
  if (href.includes('/admin/controls')) return Settings;
  if (href.includes('/admin/machine-types')) return Cpu;
  if (href.includes('/admin/formulas/validate')) return FlaskConical;
  return FileText;
};

export function AppSidebar({ onSelectItem, selectedItemId }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter(); 
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setCurrentUserRole(role);
  }, [pathname]);

  const isLoginPage = pathname === '/login';

  const { mainNavItems, adminToolsNavItems, showAdminToolsSection } = useMemo(() => {
    let mainNIs: NavItem[] = [];
    let adminTIs: NavItem[] = [];
    let showATS = false;

    const currentRoleIsClient = currentUserRole === 'client';

    if (!isLoginPage) {
      if (currentRoleIsClient) {
        mainNIs = [
          {
            id: 'client-assets-link',
            label: 'Gestion des Actifs', // Changed label
            type: 'group',
            icon: Network, 
            href: '/assets',
            onClick: () => window.location.href = '/assets',
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
        ];
        showATS = false;
      } else { // Admin View (or default if role is null or 'admin')
        mainNIs = [
          {
            id: 'admin-dashboard-link',
            label: 'Dashboard',
            type: 'group',
            icon: LayoutGrid,
            href: '/',
            onClick: () => window.location.href = '/',
          },
        ];
        if (siteConfig.adminNav) {
            adminTIs = siteConfig.adminNav.map(item => ({
            ...item,
            id: item.href || `admin-tool-${item.title.replace(/\s+/g, '-').toLowerCase()}`, 
            label: item.title,
            icon: getAdminIcon(item.href),
            type: 'group' as NavItem['type'],
            onClick: () => { if(item.href) window.location.href = item.href; }
            }));
            showATS = true;
        } else {
            adminTIs = [];
            showATS = false;
        }
      }
    }
    return { mainNavItems: mainNIs, adminToolsNavItems: adminTIs, showAdminToolsSection: showATS };
  }, [currentUserRole, pathname, isLoginPage]);


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
                onSelectItem={(item) => { if(item.href) { window.location.href = item.href; } else if (item.onClick) { item.onClick(); } }} 
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
        <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center" onClick={() => {
            localStorage.removeItem('userRole');
            router.push('/login');
        }}>
            <LogOut className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
