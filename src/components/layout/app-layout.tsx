
"use client";
import type { NavItem } from "@/types";
import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "./header";
import { AppSidebar } from "./app-sidebar";
// Icons for AppSidebar will be managed there based on role
// import { LayoutGrid, ShieldAlert, Bell, Network } from "lucide-react"; 
import { siteConfig } from "@/config/site";
import { usePathname } from 'next/navigation';

// mainNavTree is less relevant here now, as AppSidebar constructs its own
// navigation based on role. This can be removed or kept minimal.
// For now, AppSidebar doesn't directly use a navTree prop from here.

interface AppLayoutProps {
  children: React.ReactNode;
  onSelectItem?: (item: NavItem) => void;
  selectedItem?: NavItem | null;
}

export function AppLayout({ children, onSelectItem, selectedItem: initialSelectedItem }: AppLayoutProps) {
  const [currentItem, setCurrentItem] = React.useState<NavItem | null>(initialSelectedItem || null);
  const pathname = usePathname();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  const handleSelectItem = (item: NavItem) => {
    setCurrentItem(item);
    if (onSelectItem) {
      onSelectItem(item);
    }
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
            // navTree={mainNavTree} // Not strictly needed as AppSidebar builds its own tree
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
                  // Pass selectedItem prop to custom React components
                  // This was refined to avoid passing to DOM elements directly
                  if (typeof child.type !== 'string') {
                     return React.cloneElement(child as React.ReactElement<any>, { selectedItem: currentItem });
                  }
                  return child;
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
