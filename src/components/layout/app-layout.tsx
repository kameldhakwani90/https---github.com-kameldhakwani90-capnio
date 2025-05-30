
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
    id: 'site-1',
    label: 'Headquarters',
    type: 'site',
    status: 'green',
    icon: Home,
    data: { location: 'New York, USA', zones: 2, machines: 5 },
    children: [
      {
        id: 'zone-1-1',
        label: 'Manufacturing Floor',
        type: 'zone',
        status: 'green',
        icon: LayoutGrid,
        data: { area: '1000 sqm', machines: 3 },
        children: [
          {
            id: 'machine-1-1-1',
            label: 'CNC Mill A01',
            type: 'machine',
            status: 'orange',
            icon: Cpu,
            data: { serial: 'SN123', model: 'X500', statusDetails: 'Vibration sensor exceeds threshold.' },
            children: [
              { id: 'sensor-1-1-1-1', label: 'Temperature', type: 'sensor', status: 'orange', icon: Thermometer, data: { value: '85', unit: '°C', threshold: '80°C' } },
              { id: 'sensor-1-1-1-2', label: 'Vibration', type: 'sensor', status: 'green', icon: Activity, data: { value: '0.2', unit: 'g', threshold: '0.5g' } },
            ],
          },
          { id: 'machine-1-1-2', label: 'Robot Arm B02', type: 'machine', status: 'green', icon: Cpu, data: { serial: 'SN456', model: 'R200' } },
        ],
      },
      {
        id: 'zone-1-2',
        label: 'Server Room',
        type: 'zone',
        status: 'red',
        icon: LayoutGrid,
        data: { area: '50 sqm', machines: 2, statusDetails: 'Main AC Unit Offline.' },
        children: [
          { id: 'machine-1-2-1', label: 'Main Server Rack', type: 'machine', status: 'red', icon: HardDrive, data: { serial: 'SRV001', model: 'Dell R740' } },
          { id: 'pi-1-2-1', label: 'RPi Gateway 01', type: 'raspberrypi', status: 'white', icon: HardDrive, data: { ip: '192.168.1.10', statusDetails: 'Offline' } },
        ],
      },
    ],
  },
  {
    id: 'site-2',
    label: 'Warehouse Alpha',
    type: 'site',
    status: 'white',
    icon: Home,
    data: { location: 'Remote Location', statusDetails: 'Offline' },
  },
   {
    id: 'sites-management',
    label: 'Site Management',
    type: 'group',
    icon: Home, // Changed from Cog to Home for site management
    href: '/sites', // Link to main sites page, not register
    onClick: () => window.location.href = '/sites',
  },
  {
    id: 'machines-management',
    label: 'Machine Management',
    type: 'group',
    icon: ClipboardList,
    href: '/machines', // Link to main machines page, not register
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
  
  const fullNavTree = [...dummyTreeData]; // Admin items are now handled directly in AppSidebar

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
                  if (typeof child.type === 'string') {
                    return child;
                  }
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
