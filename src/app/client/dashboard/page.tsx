
"use client";

import * as React from "react";
import type { LucideIcon } from 'lucide-react';
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { Home, Layers, Server, AlertTriangle, CheckCircle2, Info, Building, ChevronDown, ChevronRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

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
  subSites?: Site[]; // Added for nesting
  isConceptualSubSite?: boolean; // To style top-level sites that are conceptually branches
}

const dummyClientSites: Site[] = [
  {
    id: "site-campus-central",
    name: "Campus Central Opérations",
    location: "Ville Principale, HQ",
    zones: [ // Direct zones of Campus Central
      {
        id: "zone-cc-admin",
        name: "Bâtiment Administratif Central",
        machines: [
          { id: "machine-cc-admin-srv", name: "Serveur Principal Admin", type: "Serveur", status: "green" },
          { id: "machine-cc-admin-hvac", name: "Climatisation Centrale HVAC", type: "HVAC", status: "green" },
        ],
      },
    ],
    subSites: [ // Sub-sites within Campus Central
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
        name: "Bâtiment B - Logistique & Stockage",
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
    isConceptualSubSite: true, // This is a top-level card but represents a branch
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
  if (statuses.length === 0) return 'green'; // Default if no elements to check
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
    site.subSites.forEach(subSite => statuses.push(getSiteOverallStatus(subSite))); // Recursive call
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

const MachineItem: React.FC<{ machine: Machine }> = ({ machine }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50">
    <div className="flex items-center gap-2">
      <Server className="h-4 w-4 text-muted-foreground" />
      <span>{machine.name} <span className="text-xs text-muted-foreground">({machine.type})</span></span>
    </div>
    <StatusBadge status={machine.status} />
  </div>
);

const ZoneItem: React.FC<{ zone: Zone; parentId: string }> = ({ zone, parentId }) => {
  const zoneStatus = getZoneOverallStatus(zone);
  return (
    <AccordionItem value={`${parentId}-${zone.id}`} className="border-b-0 mb-1 last:mb-0">
      <AccordionTrigger className="py-2 px-3 hover:no-underline hover:bg-muted/30 rounded-md data-[state=open]:bg-muted/40 transition-colors">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary/80" />
            <span className="font-medium text-sm">{zone.name}</span>
          </div>
          <StatusBadge status={zoneStatus} />
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-6 pr-2 pb-0 pt-1">
        {zone.machines.length > 0 ? (
          <div className="space-y-0.5">
            {zone.machines.map((machine) => (
              <MachineItem key={machine.id} machine={machine} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-2 px-3">Aucune machine dans cette zone.</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

const SubSiteDisplay: React.FC<{ site: Site, parentId: string }> = ({ site, parentId }) => {
  const subSiteStatus = getSiteOverallStatus(site);
  const SubSiteIcon = Building;

  return (
    <div className="ml-1 pl-3 border-l-2 border-border/70 pt-3 bg-card rounded-r-md shadow-sm mt-3">
      <div className="flex items-center justify-between mb-2 px-2">
        <h4 className="text-md font-semibold flex items-center gap-2 text-foreground/90">
          <SubSiteIcon className="h-5 w-5 text-primary/90" />
          {site.name}
        </h4>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-medium", 
            subSiteStatus === 'red' ? 'text-red-600' :
            subSiteStatus === 'orange' ? 'text-orange-600' :
            subSiteStatus === 'green' ? 'text-green-600' : 'text-gray-500'
          )}>
            {getStatusText(subSiteStatus)}
          </span>
          {getStatusIcon(subSiteStatus, "h-5 w-5")}
        </div>
      </div>
      <div className="px-1">
        {site.zones.length > 0 ? (
            <Accordion type="multiple" className="w-full space-y-1">
            {site.zones.map((zone) => (
                <ZoneItem key={zone.id} zone={zone} parentId={`${parentId}-${site.id}`} />
            ))}
            </Accordion>
        ) : (
            <div className="text-center py-3">
            <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Aucune zone configurée pour ce sous-site.</p>
            </div>
        )}
      </div>
      {/* Recursive call for sub-sub-sites if needed, though not implemented in this iteration */}
      {/* {site.subSites && site.subSites.length > 0 && (
        <div className="mt-2 space-y-2">
          {site.subSites.map(subSubSite => (
            <SubSiteDisplay key={subSubSite.id} site={subSubSite} parentId={`${parentId}-${site.id}`} />
          ))}
        </div>
      )} */}
    </div>
  );
};


const SiteCard: React.FC<{ site: Site }> = ({ site }) => {
  const siteStatus = getSiteOverallStatus(site);
  const SiteIcon = site.isConceptualSubSite ? Building : Home;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl mb-1 flex items-center gap-2">
            <SiteIcon className="h-6 w-6 text-primary" />
            {site.name}
          </CardTitle>
          <CardDescription>{site.location}</CardDescription>
        </div>
        <div className="flex flex-col items-end">
          {getStatusIcon(siteStatus, "h-7 w-7")}
          <span className={`text-xs font-semibold mt-1 ${
            siteStatus === 'red' ? 'text-red-600' : 
            siteStatus === 'orange' ? 'text-orange-600' : 'text-green-600'
          }`}>
            {getStatusText(siteStatus)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {site.zones.length > 0 ? (
          <Accordion type="multiple" className="w-full space-y-1">
            {site.zones.map((zone) => (
              <ZoneItem key={zone.id} zone={zone} parentId={site.id} />
            ))}
          </Accordion>
        ) : (
          (!site.subSites || site.subSites.length === 0) && ( // Show "no direct zones" only if no sub-sites either
            <div className="text-center py-4 text-sm text-muted-foreground">
                Aucune zone directe configurée pour ce site.
            </div>
          )
        )}

        {site.subSites && site.subSites.length > 0 && (
          <div className={cn("space-y-3", site.zones.length > 0 ? "mt-4 pt-3 border-t" : "mt-0")}>
             <h3 className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">Sous-Sites</h3>
            {site.subSites.map(subSite => (
              <SubSiteDisplay key={subSite.id} site={subSite} parentId={site.id} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function ClientDashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="pb-2">
          <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Client</h1>
          <p className="text-muted-foreground">Vue d'ensemble de l'état de vos actifs.</p>
        </header>

        {dummyClientSites.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2"> {/* Adjusted for potentially wider cards */}
            {dummyClientSites.map((site) => (
              <SiteCard key={site.id} site={site} />
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

    