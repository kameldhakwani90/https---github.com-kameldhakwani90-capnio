
"use client";

import * as React from "react";
import Link from "next/link";
import type { LucideIcon } from 'lucide-react';
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { Home, Building, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Simplified interfaces for this page
type Status = 'green' | 'orange' | 'red' | 'white';

interface Machine {
  id: string;
  name: string;
  type: string;
  status: Status;
}

interface Zone {
  id: string;
  name: string;
  machines: Machine[];
}

interface Site {
  id: string;
  name: string;
  location: string;
  zones: Zone[];
  subSites?: Site[];
  isConceptualSubSite?: boolean; // A top-level site that is conceptually a branch
}

// Dummy data - this would ideally come from a shared service or context
const dummyClientSites: Site[] = [
  {
    id: "site-campus-central",
    name: "Campus Central Opérations",
    location: "Ville Principale, HQ",
    zones: [
      {
        id: "zone-cc-admin",
        name: "Bâtiment Administratif Central (Zones Directes)",
        machines: [
          { id: "machine-cc-admin-srv", name: "Serveur Principal Admin", type: "Serveur", status: "green" },
          { id: "machine-cc-admin-hvac", name: "Climatisation Centrale HVAC", type: "HVAC", status: "green" },
        ],
      },
    ],
    subSites: [
      {
        id: "subsite-batiment-a",
        name: "Bâtiment A - Production",
        location: "Campus Central - Zone Nord",
        zones: [
          {
            id: "zone-ba-atelier1",
            name: "Atelier d'Assemblage Alpha",
            machines: [
              { id: "machine-ba-a1-presse", name: "Presse Hydraulique P-100", type: "Presse", status: "green" },
              { id: "machine-ba-a1-robot", name: "Robot Soudeur R-50", type: "Robot", status: "orange" },
            ],
          },
          {
            id: "zone-ba-stock",
            name: "Zone de Stockage Composants",
            machines: [
              { id: "machine-ba-stock-frigo", name: "Réfrigérateur Industriel F-01", type: "Frigo", status: "red" },
            ],
          },
        ],
      },
      {
        id: "subsite-batiment-b",
        name: "Bâtiment B - Logistique",
        location: "Campus Central - Zone Est",
        zones: [
          {
            id: "zone-bb-quai",
            name: "Quai de Chargement",
            machines: [
              { id: "machine-bb-quai-pont", name: "Pont Roulant PR-20", type: "Grue", status: "green" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "site-entrepot-distant",
    name: "Entrepôt Distant Delta",
    location: "Zone Industrielle Externe",
    isConceptualSubSite: true,
    zones: [
      {
        id: "zone-ed-rack",
        name: "Zone Racks Élevés",
        machines: [
          { id: "machine-ed-chariot", name: "Chariot Élévateur CE-05", type: "Véhicule", status: "green" },
           { id: "machine-ed-frigo-zone2", name: "Congélateur Zone 2", type: "Frigo", status: "orange" },
        ],
      },
    ],
  },
];

const getCombinedStatus = (statuses: Status[]): Status => {
  if (statuses.length === 0) return 'green';
  if (statuses.includes('red')) return 'red';
  if (statuses.includes('orange')) return 'orange';
  return 'green';
};

const getZoneOverallStatus = (zone: Zone): Status => {
  if (!zone.machines || zone.machines.length === 0) return 'green';
  return getCombinedStatus(zone.machines.map(m => m.status));
};

const getSiteOverallStatus = (site: Site): Status => {
  const statuses: Status[] = [];
  site.zones.forEach(zone => statuses.push(getZoneOverallStatus(zone)));
  if (site.subSites) {
    site.subSites.forEach(subSite => statuses.push(getSiteOverallStatus(subSite)));
  }
  return getCombinedStatus(statuses);
};

const getStatusIcon = (status: Status, className?: string): React.ReactNode => {
  const defaultClassName = "h-5 w-5";
  const combinedClassName = className ? `${defaultClassName} ${className}` : defaultClassName;
  switch (status) {
    case 'red':
      return <AlertTriangle className={`${combinedClassName} text-red-500`} />;
    case 'orange':
      return <Info className={`${combinedClassName} text-orange-500`} />;
    case 'green':
      return <CheckCircle2 className={`${combinedClassName} text-green-500`} />;
    default:
      return <Info className={`${combinedClassName} text-gray-400`} />;
  }
};

const getStatusText = (status: Status): string => {
    switch (status) {
        case 'red': return 'Problème Critique';
        case 'orange': return 'Avertissement';
        case 'green': return 'Opérationnel';
        default: return 'Indéterminé';
    }
};


const SiteCard: React.FC<{ site: Site; isTopLevel?: boolean }> = ({ site, isTopLevel = false }) => {
  const siteStatus = getSiteOverallStatus(site);
  const SiteIcon = site.isConceptualSubSite ? Building : Home;
  const href = isTopLevel ? `/client/sites/${site.id}` : `/client/sites/${site.id}`; // Simplified for now, will be part of path in dynamic page

  return (
    <Link href={href} className="block group">
      <Card className="shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl mb-1 flex items-center gap-2 group-hover:text-primary transition-colors">
              <SiteIcon className="h-6 w-6 text-primary" />
              {site.name}
            </CardTitle>
            <CardDescription>{site.location}</CardDescription>
          </div>
          <div className="flex flex-col items-end">
            {getStatusIcon(siteStatus, "h-7 w-7")}
            <span className={cn("text-xs font-semibold mt-1",
              siteStatus === 'red' ? 'text-red-600' : 
              siteStatus === 'orange' ? 'text-orange-600' : 
              siteStatus === 'green' ? 'text-green-600' : 'text-gray-500'
            )}>
              {getStatusText(siteStatus)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">
            {site.zones.length} zone(s) directe(s), {site.subSites?.length || 0} sous-site(s).
          </p>
          <p className="text-xs text-muted-foreground mt-2">Cliquez pour voir les détails.</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function ClientDashboardPage() {
  // For this page, we only display top-level sites.
  // The actual dummyClientSites might contain nested structures, but we iterate over its first level.
  const topLevelSites = dummyClientSites;

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="pb-2">
          <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Client</h1>
          <p className="text-muted-foreground">Vue d'ensemble de l'état de vos actifs principaux.</p>
        </header>

        {topLevelSites.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {topLevelSites.map((site) => (
              <SiteCard key={site.id} site={site} isTopLevel={true} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-semibold">Aucun site à afficher.</p>
              <p className="text-muted-foreground">Commencez par configurer vos sites dans la section "Asset Management".</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
