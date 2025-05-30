
"use client";
import type { NavItem } from "@/types";
import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "./header";
import { AppSidebar } from "./app-sidebar";
import { Home, Cpu, Thermometer, Activity, LayoutGrid, HardDrive, Settings, BarChart, Bell, ShieldAlert, FileText, Cog, ClipboardList, FlaskConical, UserPlus } from "lucide-react";
import { siteConfig } from "@/config/site";
import { usePathname } from 'next/navigation'; // To hide sidebar on login page

const dummyTreeData: NavItem[] = [
  {
    id: 'dashboard-link',
    label: 'Dashboard',
    type: 'group',
    icon: BarChart,
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
  },
  {
    id: 'site-1', // Main Site example
    label: 'Headquarters',
    type: 'site',
    status: 'green',
    icon: Home,
    data: { location: 'New York, USA', zones: 2, machines: 5 },
    // Simplified children:
    children: [
      {
        id: 'machine-hq-cnc',
        label: 'CNC Mill A01 (HQ)',
        type: 'machine',
        status: 'orange',
        icon: Cpu,
        data: { serial: 'SN123', model: 'X500', statusDetails: 'Vibration sensor high.' },
        children: [ // Sensors can still be nested if needed for detail on click
           { id: 'sensor-hq-cnc-temp', label: 'Temperature', type: 'sensor', status: 'orange', icon: Thermometer, data: { value: '85', unit: '°C' } },
           { id: 'sensor-hq-cnc-vib', label: 'Vibration', type: 'sensor', status: 'green', icon: Activity, data: { value: '0.2', unit: 'g' } },
        ]
      },
      {
        id: 'machine-hq-robot',
        label: 'Robot Arm B02 (HQ)',
        type: 'machine',
        status: 'green',
        icon: Cpu,
        data: { serial: 'SN456', model: 'R200' },
      },
      {
        id: 'zone-hq-server',
        label: 'Server Room (HQ)',
        type: 'zone',
        status: 'red',
        icon: LayoutGrid,
        data: { area: '50 sqm', machines: 1, statusDetails: 'AC Offline'},
        children: [
           { id: 'machine-hq-server-rack', label: 'Main Server Rack', type: 'machine', status: 'red', icon: HardDrive, data: { serial: 'SRV001', model: 'Dell R740' } },
        ]
      }
    ],
  },
  {
    id: 'site-2', // Another site, maybe without children initially
    label: 'Warehouse Alpha',
    type: 'site',
    status: 'white', // Offline status
    icon: Home,
    data: { location: 'Chicago, USA', statusDetails: 'Offline' },
  },
   {
    id: 'sites-management',
    label: 'Site Management',
    type: 'group',
    icon: Home, 
    href: '/sites', 
    onClick: () => window.location.href = '/sites',
  },
  {
    id: 'machines-management',
    label: 'Machine Management',
    type: 'group',
    icon: ClipboardList,
    href: '/machines', 
    onClick: () => window.location.href = '/machines',
  }
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
  };
  
  const fullNavTree = [...dummyTreeData]; 

  return (
    <SidebarProvider defaultOpen={true} open={undefined} onOpenChange={undefined}>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1">
          <AppSidebar 
            navTree={fullNavTree} 
            onSelectItem={handleSelectItem} 
            selectedItemId={currentItem?.id}
          />
          <SidebarInset>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                  // Check if the child is a DOM element (e.g., 'div', 'span')
                  // or a React component.
                  if (typeof child.type === 'string') {
                    // It's a DOM element, don't pass selectedItem
                    return child;
                  }
                  // It's a React component, pass selectedItem
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
