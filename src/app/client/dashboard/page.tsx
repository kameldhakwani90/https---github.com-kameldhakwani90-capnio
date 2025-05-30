
"use client";

import * as React from "react";
import type { LucideIcon } from 'lucide-react';
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { Home, Layers, Server, AlertTriangle, CheckCircle2, Info, Building } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
  isSubSite?: boolean; // Optional flag to denote a sub-site if needed for styling/logic later
}

const dummyClientSites: Site[] = [
  {
    id: "site-campus-central",
    name: "Campus Central",
    location: "Ville Principale",
    zones: [
      {
        id: "zone-cc-admin",
        name: "Bâtiment Administratif",
        machines: [
          { id: "machine-cc-admin-srv", name: "Serveur Principal Admin", type: "Serveur", status: "green" },
          { id: "machine-cc-admin-hvac", name: "Climatisation Centrale", type: "HVAC", status: "green" },
        ],
      },
    ],
  },
  {
    id: "subsite-batiment-a",
    name: "Bâtiment A - Production",
    location: "Campus Central - Zone Nord",
    isSubSite: true,
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
    isSubSite: true,
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
  {
    id: "subsite-labo",
    name: "Laboratoire de Recherche (Annexe)",
    location: "Campus Central - Aile Sud",
    isSubSite: true,
    zones: [
       {
        id: "zone-lab-analyse",
        name: "Salle d'Analyse",
        machines: [
          { id: "machine-lab-spec", name: "Spectromètre S-3000", type: "Equipement Labo", status: "green" },
          { id: "machine-lab-hotte", name: "Hotte Chimique H-02", type: "Sécurité", status: "orange" },
        ],
      },
    ]
  },
  {
    id: "site-entrepot-distant",
    name: "Entrepôt Distant Delta",
    location: "Zone Industrielle Externe",
    zones: [
      {
        id: "zone-ed-rack",
        name: "Zone Racks Élevés",
        machines: [
          { id: "machine-ed-chariot", name: "Chariot Élévateur CE-05", type: "Véhicule", status: "green" },
        ],
      },
    ],
  },
];

const getPropagatedStatus = (children: { status: Status }[]): Status => {
  if (!children || children.length === 0) return 'green'; // Default to green if no children with status
  const statuses = children.map(child => child.status).filter(status => status !== undefined);
  if (statuses.length === 0) return 'green';
  if (statuses.includes('red')) return 'red';
  if (statuses.includes('orange')) return 'orange';
  return 'green';
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
      return <Info className={`${combinedClassName} text-gray-400`} />; // Or a specific 'white' icon
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

const ZoneItem: React.FC<{ zone: Zone }> = ({ zone }) => {
  const zoneStatus = getPropagatedStatus(zone.machines);
  return (
    <AccordionItem value={zone.id} className="border-b-0">
      <AccordionTrigger className="py-3 hover:no-underline hover:bg-muted/50 rounded-md px-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary/80" />
            <span className="font-medium">{zone.name}</span>
          </div>
          <StatusBadge status={zoneStatus} />
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-6 pr-2 pb-0">
        {zone.machines.length > 0 ? (
          <div className="space-y-1 pt-1">
            {zone.machines.map((machine) => (
              <MachineItem key={machine.id} machine={machine} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-2 px-3">Aucune machine dans cette zone.</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

const SiteCard: React.FC<{ site: Site }> = ({ site }) => {
  const siteStatus = getPropagatedStatus(site.zones.map(zone => ({ status: getPropagatedStatus(zone.machines) })));
  const SiteIcon = site.isSubSite ? Building : Home;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
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
            {siteStatus === 'red' ? 'Problème Critique' : siteStatus === 'orange' ? 'Avertissement' : 'Opérationnel'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {site.zones.length > 0 ? (
          <Accordion type="multiple" className="w-full space-y-1">
            {site.zones.map((zone) => (
              <ZoneItem key={zone.id} zone={zone} />
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-4">
            <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucune zone configurée pour ce site.</p>
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
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
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
