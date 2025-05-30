
"use client";

import * as React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, PlusCircle, Home, Building } from "lucide-react"; // Added Home, Building
import type { Site, Status } from "@/app/client/sites/[...sitePath]/page"; // Assuming types can be imported
import { DUMMY_CLIENT_SITES_DATA } from "@/app/client/sites/[...sitePath]/page"; // Import dummy data for now

// For Asset Management, we might only show top-level sites or all sites client has access to.
// For this example, let's use the same DUMMY_CLIENT_SITES_DATA as the dashboard
// but only render the top-level entries.

const getSiteOverallStatus = (site: Site): Status => {
  // Simplified status for asset management card for now, can be expanded later
  // This is just to have some visual cue, actual status calculation might be complex
  if (site.zones.some(z => z.machines.some(m => m.status === 'red'))) return 'red';
  if (site.zones.some(z => z.machines.some(m => m.status === 'orange'))) return 'orange';
  return 'green';
};

const getStatusColorClass = (status: string) => {
  switch (status) {
    case "green": return "bg-green-500";
    case "orange": return "bg-orange-500";
    case "red": return "bg-red-500";
    default: return "bg-gray-400";
  }
};


export default function AssetManagementPage() {
  // Filter for top-level sites (sites that are not subSites of another explicitly listed site)
  // Or simply use all sites from DUMMY_CLIENT_SITES_DATA if it's structured as top-level.
  // For this example, we consider all entries in DUMMY_CLIENT_SITES_DATA as manageable top-level asset groups.
  const manageableSites = DUMMY_CLIENT_SITES_DATA;

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Network className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Asset Management</h1>
          </div>
          <Button asChild>
            <Link href="/sites/register"> {/* Link to existing admin-styled page for now */}
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Site
            </Link>
          </Button>
        </header>

        {manageableSites.length === 0 ? (
          <Card className="shadow-xl">
            <CardContent className="py-10 text-center">
                <Network className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold">No assets configured yet.</p>
                <p className="text-muted-foreground">Start by adding your first site.</p>
                <Button asChild className="mt-6">
                    <Link href="/sites/register">Add New Site</Link>
                </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {manageableSites.map(site => {
              const siteStatus = getSiteOverallStatus(site);
              const SiteIcon = site.isConceptualSubSite ? Building : Home;
              return (
                <Link key={site.id} href={`/client/assets/manage/${site.id}`} className="block group">
                  <Card className="shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl mb-1 flex items-center gap-2 group-hover:text-primary transition-colors">
                          <SiteIcon className="h-6 w-6 text-primary" />
                          {site.name}
                        </CardTitle>
                        <span className={`w-3 h-3 rounded-full ${getStatusColorClass(siteStatus)}`} title={`Status: ${siteStatus}`}></span>
                      </div>
                      <CardDescription>{site.location}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground">
                        {/* Placeholder for brief stats, e.g., zones/machines count */}
                        {site.zones.length} zone(s), {site.subSites?.length || 0} sub-site(s).
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Click to manage this site.</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
