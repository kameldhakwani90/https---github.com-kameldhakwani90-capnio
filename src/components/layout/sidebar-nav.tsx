"use client";

import type { NavItem as NavItemType } from "@/types";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { StatusBadge } from "@/components/common/status-badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  items: NavItemType[];
  onSelectItem: (item: NavItemType) => void;
  selectedItemId?: string;
  level?: number;
}

export function SidebarNav({ items, onSelectItem, selectedItemId, level = 0 }: SidebarNavProps) {
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({});

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };
  
  if (!items?.length) {
    return null;
  }

  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = item.icon;
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openItems[item.id] || false;
        const isActive = selectedItemId === item.id;

        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              onClick={() => {
                if (hasChildren) toggleItem(item.id);
                onSelectItem(item);
                if(item.onClick) item.onClick();
              }}
              className={cn("justify-between", isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90")}
              tooltip={{ content: item.label, side: 'right', align: 'center' }}
              isActive={isActive}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.status && <StatusBadge status={item.status} />}
                {hasChildren && (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
              </div>
            </SidebarMenuButton>
            {hasChildren && isOpen && (
              <SidebarMenuSub style={{ marginLeft: `${level * 0.5}rem`}}>
                <SidebarNav items={item.children!} onSelectItem={onSelectItem} selectedItemId={selectedItemId} level={level + 1} />
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
