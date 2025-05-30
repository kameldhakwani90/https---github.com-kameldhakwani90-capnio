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
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";

interface AppSidebarProps {
  navTree: NavItem[];
  onSelectItem: (item: NavItem) => void;
  selectedItemId?: string;
}

export function AppSidebar({ navTree, onSelectItem, selectedItemId }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r">
      <SidebarHeader className="p-4 border-b">
         {/* Logo for collapsed sidebar can be different, or text hidden */}
        <Logo className="group-data-[collapsible=icon]:hidden" />
        <Logo className="hidden group-data-[collapsible=icon]:flex justify-center w-full" /> {/* Icon only for collapsed */}
      </SidebarHeader>
      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">Navigation</SidebarGroupLabel>
          <SidebarNav items={navTree} onSelectItem={onSelectItem} selectedItemId={selectedItemId} />
        </SidebarGroup>
        <Separator className="my-2" />
        <SidebarGroup>
           <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">Admin</SidebarGroupLabel>
           <SidebarNav 
             items={siteConfig.adminNav.map(item => ({...item, type: 'group', id: item.href, label: item.title, onClick: () => {console.log(`Navigating to ${item.href}`)}}))} 
             onSelectItem={(item) => { if(item.href) window.location.href = item.href; }} 
             selectedItemId={selectedItemId} 
            />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
        <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center" asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Settings</span>
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center">
          <LogOut className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
