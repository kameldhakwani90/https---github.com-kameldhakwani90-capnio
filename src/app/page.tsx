"use client";

import React from "react";
import type { NavItem } from "@/types";
import { AppLayout } from "@/components/layout/app-layout";
import { InfoPanel } from "@/components/dashboard/info-panel";

interface DashboardPageProps {
  // selectedItem might be passed if SSR or routing sets it
  selectedItem?: NavItem | null; 
}

export default function DashboardPage({ selectedItem: initialSelectedItem }: DashboardPageProps) {
  const [selectedItem, setSelectedItem] = React.useState<NavItem | null>(initialSelectedItem || null);

  const handleSelectItem = (item: NavItem) => {
    setSelectedItem(item);
  };

  return (
    <AppLayout onSelectItem={handleSelectItem} selectedItem={selectedItem}>
      <InfoPanel item={selectedItem} />
    </AppLayout>
  );
}
