
"use client";

import * as React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, PlusCircle, Home, Building, Info } from "lucide-react";
import type { Site, Status } from "@/lib/client-data"; 
import { DUMMY_CLIENT_SITES_DATA, getSiteOverallStatus } from "@/lib/client-data"; 
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const getStatusColorClass = (status: string) => {
  switch (status) {
    case "green": return "bg-green-500";
    case "orange": return "bg-orange-500";
    case "red": return "bg-red-500";
    default: return "bg-gray-400";
  }
};


export default function AssetManagementPage() {
  const manageableSites = DUMMY_CLIENT_SITES_DATA;

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Network className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Gestion des Actifs</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/sites/register"> 
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Site
              </Link>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Information sur les Sites">
                  <Info className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" side="bottom" align="end">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Qu'est-ce qu'un Site ?</h4>
                    <p className="text-sm text-muted-foreground">
                      Un site représente votre emplacement physique principal ou une grande entité que vous souhaitez surveiller.
                    </p>
                    <p className="text-sm font-semibold">Exemples :</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Magasin "Les Halles Centrales"</li>
                      <li>Entrepôt "Logistique Sud"</li>
                      <li>Restaurant "Le Gourmet Paris"</li>
                      <li>Usine "Alpha Production"</li>
                      <li>Campus Universitaire</li>
                    </ul>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {manageableSites.length === 0 ? (
          <Card className="shadow-xl">
            <CardContent className="py-10 text-center">
                <Network className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold">Aucun actif configuré pour le moment.</p>
                <p className="text-muted-foreground">Commencez par ajouter votre premier site.</p>
                <Button asChild className="mt-6">
                    <Link href="/sites/register">Ajouter un Nouveau Site</Link>
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
                        {site.zones.length} zone(s), {site.subSites?.length || 0} sous-site(s).
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Cliquez pour gérer ce site.</p>
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
