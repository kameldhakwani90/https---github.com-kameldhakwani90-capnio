
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { LucideIcon } from 'lucide-react';
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { Home, Layers, Server, AlertTriangle, CheckCircle2, Info, Building, ChevronRight, PackageOpen } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Interfaces (should be in a shared types file eventually)
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

// Dummy data - This should be fetched from a central place or API in a real app
const DUMMY_CLIENT_SITES_DATA: Site[] = [
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
         subSites: [ // Nested sub-site example
          {
            id: "subsite-etage1-batA",
            name: "Étage 1 - Bâtiment A",
            location: "Bâtiment A",
            zones: [
              {
                id: "zone-etage1-bureau",
                name: "Bureaux Études",
                machines: [{id: "pc-dev-01", name: "PC Dev 01", type: "Ordinateur", status: "green"}]
              }
            ]
          }
        ]
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

// Helper functions for status and display (duplicate from dashboard for now)
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
    case 'red': return <AlertTriangle className={`${combinedClassName} text-red-500`} />;
    case 'orange': return <Info className={`${combinedClassName} text-orange-500`} />;
    case 'green': return <CheckCircle2 className={`${combinedClassName} text-green-500`} />;
    default: return <Info className={`${combinedClassName} text-gray-400`} />;
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

// Helper function to find a site by its path
interface FoundSiteInfo {
  site: Site;
  path: { id: string; name: string }[]; // For breadcrumbs
}

const findSiteByPath = (
  pathArray: string[],
  sites: Site[]
): FoundSiteInfo | undefined => {
  let currentSites = sites;
  let currentSite: Site | undefined = undefined;
  const breadcrumbPath: { id: string; name: string }[] = [];

  for (const segment of pathArray) {
    const found = currentSites.find(s => s.id === segment);
    if (found) {
      currentSite = found;
      breadcrumbPath.push({ id: found.id, name: found.name });
      currentSites = found.subSites || [];
    } else {
      return undefined; // Path segment not found
    }
  }
  return currentSite ? { site: currentSite, path: breadcrumbPath } : undefined;
};


// UI Components (reused from dashboard for consistency)
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

const SubSiteCard: React.FC<{ site: Site; currentPath: string[] }> = ({ site, currentPath }) => {
  const siteStatus = getSiteOverallStatus(site);
  const SiteIcon = site.isConceptualSubSite ? Building : Home;
  const href = `/client/sites/${[...currentPath, site.id].join('/')}`;

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


export default function SiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { sitePath } = params as { sitePath: string[] }; // path segments

  const [currentSiteInfo, setCurrentSiteInfo] = React.useState<FoundSiteInfo | null | undefined>(undefined); // undefined for loading

  React.useEffect(() => {
    if (sitePath && Array.isArray(sitePath) && sitePath.length > 0) {
      const found = findSiteByPath(sitePath, DUMMY_CLIENT_SITES_DATA);
      setCurrentSiteInfo(found || null); // null if not found
    } else {
      setCurrentSiteInfo(null); // Invalid path
    }
  }, [sitePath]);

  if (currentSiteInfo === undefined) {
    return (
      <AppLayout>
        <div className="p-6 text-center">Chargement des détails du site...</div>
      </AppLayout>
    );
  }

  if (!currentSiteInfo) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-destructive">Site non trouvé</h1>
          <p className="text-muted-foreground">Le site ou sous-site que vous cherchez n'existe pas.</p>
          <Button onClick={() => router.push('/client/dashboard')} className="mt-6">
            Retour au Tableau de Bord
          </Button>
        </div>
      </AppLayout>
    );
  }

  const { site: currentSite, path: breadcrumbPath } = currentSiteInfo;
  const currentSiteStatus = getSiteOverallStatus(currentSite);
  const SiteIcon = currentSite.isConceptualSubSite ? Building : Home;


  const generateBreadcrumbUrl = (index: number) => {
    const pathSegments = breadcrumbPath.slice(0, index + 1).map(p => p.id);
    return `/client/sites/${pathSegments.join('/')}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
          <Link href="/client/dashboard" className="hover:text-primary">Tableau de Bord</Link>
          {breadcrumbPath.map((segment, index) => (
            <React.Fragment key={segment.id}>
              <ChevronRight className="h-4 w-4" />
              {index === breadcrumbPath.length - 1 ? (
                <span className="font-medium text-foreground">{segment.name}</span>
              ) : (
                <Link href={generateBreadcrumbUrl(index)} className="hover:text-primary">
                  {segment.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        <header className="pb-2 border-b mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <SiteIcon className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{currentSite.name}</h1>
                    <p className="text-muted-foreground">{currentSite.location}</p>
                </div>
            </div>
            <div className="flex flex-col items-end">
                {getStatusIcon(currentSiteStatus, "h-8 w-8")}
                <span className={cn("text-sm font-semibold mt-1",
                currentSiteStatus === 'red' ? 'text-red-600' : 
                currentSiteStatus === 'orange' ? 'text-orange-600' : 
                currentSiteStatus === 'green' ? 'text-green-600' : 'text-gray-500'
                )}>
                {getStatusText(currentSiteStatus)}
                </span>
            </div>
          </div>
        </header>

        {/* Direct Zones */}
        {currentSite.zones.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Zones Directes</h2>
            <Accordion type="multiple" className="w-full space-y-1 bg-card p-3 rounded-lg shadow">
              {currentSite.zones.map((zone) => (
                <ZoneItem key={zone.id} zone={zone} parentId={currentSite.id} />
              ))}
            </Accordion>
          </section>
        )}

        {/* Sub-Sites */}
        {currentSite.subSites && currentSite.subSites.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-3">Sous-Sites</h2>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {currentSite.subSites.map((subSite) => (
                <SubSiteCard key={subSite.id} site={subSite} currentPath={sitePath} />
              ))}
            </div>
          </section>
        )}

        {currentSite.zones.length === 0 && (!currentSite.subSites || currentSite.subSites.length === 0) && (
           <Card>
            <CardContent className="py-10 text-center">
              <Layers className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-semibold">Aucune zone ou sous-site direct.</p>
              <p className="text-muted-foreground">Ce site ne contient pas de zones ou de sous-sites directement configurés.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

