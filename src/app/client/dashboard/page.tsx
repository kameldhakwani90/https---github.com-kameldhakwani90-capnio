
"use client";

import * as React from "react";
import type { LucideIcon } from 'lucide-react';
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { Home, Layers, Server, AlertTriangle, CheckCircle2, Info } from "lucide-react";
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
}

const dummyClientSites: Site[] = [
  {
    id: "site-001",
    name: "Usine Principale Alpha",
    location: "Zone Industrielle Nord",
    zones: [
      {
        id: "zone-a01",
        name: "Atelier d'Assemblage A",
        machines: [
          { id: "machine-a01-01", name: "Presse Hydraulique P-100", type: "Presse", status: "green" },
          { id: "machine-a01-02", name: "Robot Soudeur R-50", type: "Robot", status: "orange" },
          { id: "machine-a01-03", name: "Convoyeur C-300", type: "Convoyeur", status: "green" },
        ],
      },
      {
        id: "zone-a02",
        name: "Zone de Stockage B",
        machines: [
          { id: "machine-a02-01", name: "Chariot Élévateur E-1", type: "Véhicule", status: "green" },
        ],
      },
       {
        id: "zone-a03",
        name: "Salle des Serveurs",
        machines: [
          { id: "machine-a03-01", name: "Rack Serveur Principal", type: "Serveur", status: "red" },
          { id: "machine-a03-02", name: "Unité de Climatisation", type: "HVAC", status: "green" },
        ],
      },
    ],
  },
  {
    id: "site-002",
    name: "Entrepôt Secondaire Bêta",
    location: "Parc Logistique Sud",
    zones: [
      {
        id: "zone-b01",
        name: "Quai de Chargement",
        machines: [
          { id: "machine-b01-01", name: "Pont Roulant PR-20", type: "Grue", status: "green" },
          { id: "machine-b01-02", name: "Compacteur de Déchets CD-5", type: "Utilitaire", status: "green" },
        ],
      },
    ],
  },
  {
    id: "site-003",
    name: "Laboratoire de Recherche",
    location: "Campus Universitaire",
    zones: []
  }
];

const getPropagatedStatus = (children: { status: Status }[]): Status => {
  if (!children || children.length === 0) return 'green'; // Default to green if no children
  const statuses = children.map(child => child.status);
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
      return <Info className={`${combinedClassName} text-gray-400`} />;
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

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-xl mb-1 flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
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
            {siteStatus.charAt(0).toUpperCase() + siteStatus.slice(1)}
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
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2"> {/* Adjusted for potentially wider cards */}
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
