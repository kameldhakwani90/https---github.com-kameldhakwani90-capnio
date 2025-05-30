
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
import { LogOut, Settings, FileText, Cog, FlaskConical, UserPlus, ShieldAlert, Bell, Home, ClipboardList, BarChart } from "lucide-react"; // Added UserPlus
import Link from "next/link";

interface AppSidebarProps {
  navTree: NavItem[];
  onSelectItem: (item: NavItem) => void;
  selectedItemId?: string;
}

// Helper to map href to Lucide icons for admin items
const getAdminIcon = (href: string) => {
  if (href.includes('/admin/sensors')) return Cog;
  if (href.includes('/admin/formulas/validate')) return FlaskConical;
  if (href.includes('/admin/formulas')) return FileText;
  if (href.includes('/admin/clients/create')) return UserPlus;
  return FileText; // Default admin icon
};

export function AppSidebar({ navTree, onSelectItem, selectedItemId }: AppSidebarProps) {
  
  const adminNavItemsWithIcons = siteConfig.adminNav.map(item => ({
    ...item,
    id: item.href, // Use href as unique ID for nav items
    label: item.title,
    icon: getAdminIcon(item.href),
    type: 'group' as NavItem['type'], // Explicitly type as 'group'
    onClick: () => { if(item.href) window.location.href = item.href; }
  }));

  // Placeholder for determining if user is admin.
  // In a real app, this would come from an auth context.
  const isAdmin = true; // Assume admin for now to show all links

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r">
      <SidebarHeader className="p-4 border-b">
        <Logo className="group-data-[collapsible=icon]:hidden" />
        <Logo className="hidden group-data-[collapsible=icon]:flex justify-center w-full" />
      </SidebarHeader>
      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">Navigation</SidebarGroupLabel>
          <SidebarNav items={navTree} onSelectItem={onSelectItem} selectedItemId={selectedItemId} />
        </SidebarGroup>
        
        {isAdmin && (
          <>
            <Separator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">Admin</SidebarGroupLabel>
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
          <Link href="/settings"> {/* TODO: Create /settings page */}
            <Settings className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Settings</span>
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center" asChild>
          {/* In a real app, LogOut would trigger an action. For now, links to login */}
          <Link href="/login"> 
            <LogOut className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
