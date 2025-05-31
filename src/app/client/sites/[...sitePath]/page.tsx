
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { LucideIcon } from 'lucide-react';
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Layers, Server, AlertTriangle, CheckCircle2, Info, Building, ChevronRight, PackageOpen, Settings2, Thermometer, Zap, Wind, LineChart as LineChartIcon, RadioTower } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from "recharts";


// Interfaces (should be in a shared types file eventually)
export type Status = 'green' | 'orange' | 'red' | 'white';

export interface HistoricalDataPoint {
  name: string; // Typically time or sequence
  value: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked?: boolean;
}

export interface ActiveControlInAlert {
  controlId: string;
  controlName: string;
  controlDescription: string;
  alertDetails: string;
  formulaUsed?: string;
  currentValues?: Record<string, { value: number | string; unit?: string }>;
  thresholds?: Record<string, number | string>;
  historicalData?: HistoricalDataPoint[];
  relevantSensorVariable?: string;
  checklist?: ChecklistItem[];
  status?: Status; // Add status to the alert itself
}

export interface Sensor {
  id: string;
  name: string;
  typeModel: string; 
  scope: 'zone' | 'machine';
  piServerId?: string;
  affectedMachineIds?: string[];
  status?: Status; 
  provides?: string[]; 
}

export interface ControlParameter {
  id: string;
  label: string;
  type: 'number' | 'text' | 'boolean';
  defaultValue?: any;
}

export interface ConfiguredControl {
  isActive: boolean;
  params: Record<string, any>; 
  sensorMappings: Record<string, string>; 
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: Status;
  icon?: LucideIcon;
  activeControlInAlert?: ActiveControlInAlert;
  availableSensors?: Array<{ id: string; name: string; provides: string[] }>; 
  configuredControls?: Record<string, ConfiguredControl>; 
}

export interface Zone {
  id: string;
  name: string;
  machines: Machine[];
  subZones?: Zone[];
  sensors?: Sensor[]; 
}

export interface Site {
  id: string;
  name: string;
  location: string;
  zones: Zone[];
  subSites?: Site[];
  isConceptualSubSite?: boolean;
}


export const DUMMY_CLIENT_SITES_DATA: Site[] = [
  {
    id: "site-campus-central",
    name: "Campus Central Opérations",
    location: "Ville Principale, HQ",
    zones: [
      {
        id: "zone-cc-admin",
        name: "Bâtiment Administratif Central",
        machines: [
          {
            id: "machine-cc-admin-srv", name: "Serveur Principal Admin", type: "Serveur", status: "green", icon: Server,
            availableSensors: [
                { id: "srv-temp-interne", name: "Sonde Température Interne Serveur", provides: ["temp", "temp_srv", "server_temp"] },
                { id: "srv-fan-speed", name: "Capteur Vitesse Ventilateur Serveur", provides: ["fan_speed"] },
                { id: "srv-cpu-load", name: "Moniteur Charge CPU", provides: ["cpu_usage_percent"] },
                { id: "srv-mem-usage", name: "Moniteur Utilisation RAM", provides: ["mem_usage_percent"] },
                { id: "srv-disk-space", name: "Moniteur Espace Disque /dev/sda1", provides: ["disk_free_gb"] },
                { id: "srv-ping-gw", name: "Sonde Latence Gateway", provides: ["ping_latency_ms"] },
            ],
            configuredControls: {
                "control-srv-temp": { 
                    isActive: true,
                    params: { seuil_max_temp_srv: 70 },
                    sensorMappings: { temp_srv: "srv-temp-interne"}
                },
                "control-srv-cpu": {
                    isActive: true,
                    params: { seuil_max_cpu: 90 },
                    sensorMappings: { cpu_usage_percent: "srv-cpu-load" }
                },
                "control-srv-mem": {
                    isActive: true,
                    params: { seuil_max_mem: 85 },
                    sensorMappings: { mem_usage_percent: "srv-mem-usage" }
                },
                "control-srv-disk": {
                    isActive: true,
                    params: { seuil_min_disk_gb: 20 },
                    sensorMappings: { disk_free_gb: "srv-disk-space" }
                },
                "control-srv-latency": {
                    isActive: true,
                    params: { seuil_max_latency_ms: 100 },
                    sensorMappings: { ping_latency_ms: "srv-ping-gw" }
                }
            }
          },
          {
            id: "machine-cc-admin-hvac", name: "Climatisation Centrale HVAC", type: "HVAC", status: "green", icon: Wind,
            availableSensors: [
                { id: "hvac-main-current", name: "Capteur Courant HVAC Principal", provides: ["courant", "current", "tension"] }, // Assuming tension also comes from here for demo
                { id: "hvac-air-flow", name: "Capteur Débit Air HVAC", provides: ["flow_rate"] },
                { id: "hvac-temp-output", name: "Sonde Température Sortie HVAC", provides: ["temp"] },
            ],
            configuredControls: {
                "control-002": { 
                    isActive: true,
                    params: { seuil_max_conso: 3500 },
                    sensorMappings: { courant: "hvac-main-current", tension: "hvac-main-current" }
                }
            }
          },
        ],
        sensors: [
            {
                id: "sensor-ambiant-cc-admin-temp",
                name: "Température Ambiante Hall",
                typeModel: "Sonde Ambiante THL v2.1",
                scope: "zone",
                status: "green",
                provides: ["temp", "humidity"]
            },
            {
                id: "sensor-hvac-machine-current", // Renamed to avoid conflict with availableSensor id
                name: "Capteur Courant HVAC (Lien)",
                typeModel: "Capteur de Courant Monophasé CM-100",
                scope: "machine",
                affectedMachineIds: ["machine-cc-admin-hvac"],
                status: "green",
                provides: ["current"] 
            }
        ],
        subZones: [
          {
            id: "subzone-cc-admin-bureau101",
            name: "Bureau 101",
            machines: [
              { id: "machine-pc-b101", name: "PC Bureau 101", type: "PC", status: "green", icon: Server }
            ]
          },
          {
            id: "subzone-cc-admin-salle-reunion",
            name: "Salle de Réunion Alpha",
            machines: [
              { id: "machine-projecteur-alpha", name: "Projecteur Salle Alpha", type: "Projecteur", status: "orange", icon: Settings2,
                activeControlInAlert: {
                    controlId: "control-proj-temp", // Placeholder ID, should be defined in Admin Controls
                    controlName: "Surchauffe Projecteur",
                    controlDescription: "Surveille la température interne du projecteur.",
                    alertDetails: "Température projecteur (65°C) élevée. Seuil: 60°C.",
                    relevantSensorVariable: "Température Projecteur",
                    historicalData: [ { name: 'T-4', value: 58 }, { name: 'T-3', value: 60 }, { name: 'T-2', value: 62 }, { name: 'T-1', value: 64 }, { name: 'Maintenant', value: 65 }],
                    status: 'orange'
                }
              }
            ]
          }
        ]
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
              { id: "machine-ba-a1-presse", name: "Presse Hydraulique P-100", type: "Presse", status: "green", icon: Settings2 },
              {
                id: "machine-ba-a1-robot",
                name: "Robot Soudeur R-50",
                type: "Robot",
                status: "orange",
                icon: Settings2,
                activeControlInAlert: {
                  controlId: "control-004", // Placeholder ID
                  controlName: "Surveillance Couple Moteur Robot",
                  controlDescription: "Surveille le couple des moteurs du robot pour détecter les surcharges ou blocages.",
                  alertDetails: "Couple moteur axe Z (7.8 Nm) proche du seuil d'alerte (8.0 Nm).",
                  formulaUsed: "sensor['couple_Z'].value >= machine.params['seuil_alerte_couple_Z']",
                  currentValues: { couple_Z: { value: 7.8, unit: "Nm" } },
                  thresholds: { seuil_alerte_couple_Z: 8.0 },
                  historicalData: [
                    { name: '09:00', value: 6.5 }, { name: '09:05', value: 6.8 }, { name: '09:10', value: 7.0 },
                    { name: '09:15', value: 7.5 }, { name: '09:20', value: 7.8 },
                  ],
                  relevantSensorVariable: "Couple Axe Z (Nm)",
                  checklist: [
                    { id: 'chk-robot-1', label: "Vérifier l'absence d'obstruction physique sur l'axe Z." },
                    { id: 'chk-robot-2', label: "Contrôler le niveau de lubrification de l'axe Z." },
                    { id: 'chk-robot-3', label: "Inspecter le câblage du moteur de l'axe Z pour tout dommage." },
                  ],
                  status: 'orange'
                }
              },
            ],
          },
          {
            id: "zone-ba-stock",
            name: "Zone de Stockage Composants",
            machines: [
              {
                id: "machine-ba-stock-frigo",
                name: "Réfrigérateur Industriel F-01",
                type: "Frigo",
                status: "red",
                icon: Thermometer,
                availableSensors: [
                    { id: "frigo-f01-temp", name: "Sonde Température Frigo F-01", provides: ["temp"] }
                ],
                configuredControls: {
                    "control-001": { 
                        isActive: true,
                        params: { seuil_min: -2, seuil_max: 5 },
                        sensorMappings: { temp: "frigo-f01-temp" }
                    }
                },
                activeControlInAlert: {
                  controlId: "control-001",
                  controlName: "Contrôle Température Frigo",
                  controlDescription: "Vérifie que la température du frigo reste dans les seuils définis pour la conservation des produits.",
                  alertDetails: "Température interne critique: 15°C. Seuil max de consigne: 5°C. Compresseur en défaut apparent.",
                  formulaUsed: "sensor['temp'].value >= machine.params['seuil_min'] && sensor['temp'].value <= machine.params['seuil_max']",
                  currentValues: { temp: { value: 15, unit: "°C" } },
                  thresholds: { seuil_min: -2, seuil_max: 5 },
                  historicalData: [
                    { name: '10:00', value: 4 }, { name: '10:05', value: 4.5 }, { name: '10:10', value: 8 },
                    { name: '10:15', value: 12 }, { name: '10:20', value: 15 },
                  ],
                  relevantSensorVariable: "Température (°C)",
                  checklist: [
                    { id: 'chk-frigo-1', label: "Vérifier que la porte du frigo est bien fermée et étanche." },
                    { id: 'chk-frigo-2', label: "Nettoyer le condenseur de toute poussière ou obstruction." },
                    { id: 'chk-frigo-3', label: "S'assurer que la ventilation autour du frigo n'est pas bloquée." },
                    { id: 'chk-frigo-4', label: "Vérifier le thermostat et ses réglages." },
                  ],
                  status: 'red'
                }
              },
            ],
          },
        ],
        subSites: [
          {
            id: "subsite-etage1-batA",
            name: "Étage 1 - Bâtiment A",
            location: "Bâtiment A",
            zones: [
              {
                id: "zone-etage1-bureau",
                name: "Bureaux Études",
                machines: [{ id: "pc-dev-01", name: "PC Dev 01", type: "Ordinateur", status: "green", icon: Server }]
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
              { id: "machine-bb-quai-pont", name: "Pont Roulant PR-20", type: "Grue", status: "green", icon: Settings2 },
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
          { id: "machine-ed-chariot", name: "Chariot Élévateur CE-05", type: "Véhicule", status: "green", icon: Settings2 },
          {
            id: "machine-ed-frigo-zone2",
            name: "Congélateur Zone 2",
            type: "Frigo",
            status: "orange",
            icon: Thermometer,
            availableSensors: [
                { id: "frigo-z2-temp", name: "Sonde Température Congélateur Z2", provides: ["temp", "temp_cong"] }
            ],
             configuredControls: {
                "control-001": { 
                    isActive: true,
                    params: { seuil_min: -22, seuil_max: -18 }, 
                    sensorMappings: { temp: "frigo-z2-temp" }
                }
            },
            activeControlInAlert: {
              controlId: "control-001", 
              controlName: "Contrôle Température Congélateur",
              controlDescription: "Maintien de la température du congélateur pour produits surgelés.",
              alertDetails: "Température (-15°C) proche du seuil d'alerte (-18°C). Cycle de dégivrage en retard.",
              formulaUsed: "sensor['temp_cong'].value <= machine.params['seuil_max_cong']",
              currentValues: { temp_cong: { value: -15, unit: "°C" } },
              thresholds: { seuil_max_cong: -18 },
              historicalData: [
                { name: '11:00', value: -18 }, { name: '11:05', value: -17.5 }, { name: '11:10', value: -16 },
                { name: '11:15', value: -15.5 }, { name: '11:20', value: -15 },
              ],
              relevantSensorVariable: "Température (°C)",
              checklist: [
                 { id: 'chk-congel-1', label: "Vérifier l'étanchéité de la porte du congélateur." },
                 { id: 'chk-congel-2', label: "S'assurer que le cycle de dégivrage automatique fonctionne ou a été effectué récemment." },
                 { id: 'chk-congel-3', label: "Ne pas surcharger le congélateur pour permettre une bonne circulation de l'air." },
              ],
              status: 'orange'
            }
          },
        ],
      },
    ],
  },
];

// Helper functions for status and display
const getCombinedStatus = (statuses: Status[]): Status => {
  if (statuses.length === 0) return 'green';
  if (statuses.includes('red')) return 'red';
  if (statuses.includes('orange')) return 'orange';
  return 'green';
};

export const getZoneOverallStatus = (zone: Zone): Status => {
  const machineStatuses = zone.machines?.map(m => m.status) || [];
  const subZoneStatuses = zone.subZones?.map(sz => getZoneOverallStatus(sz)) || [];
  const sensorStatuses = zone.sensors?.map(s => s.status || 'green') || []; 
  return getCombinedStatus([...machineStatuses, ...subZoneStatuses, ...sensorStatuses]);
};

export const getSiteOverallStatus = (site: Site): Status => {
  const zoneStatuses = site.zones?.map(zone => getZoneOverallStatus(zone)) || [];
  const subSiteStatuses = site.subSites?.map(subSite => getSiteOverallStatus(subSite)) || [];
  return getCombinedStatus([...zoneStatuses, ...subSiteStatuses]);
};

export const getStatusIcon = (status: Status, className?: string): React.ReactNode => {
  const defaultClassName = "h-5 w-5";
  const combinedClassName = className ? `${defaultClassName} ${className}` : defaultClassName;
  switch (status) {
    case 'red': return <AlertTriangle className={cn(combinedClassName, "text-red-500")} />;
    case 'orange': return <Info className={cn(combinedClassName, "text-orange-500")} />;
    case 'green': return <CheckCircle2 className={cn(combinedClassName, "text-green-500")} />;
    default: return <Info className={cn(combinedClassName, "text-gray-400")} />;
  }
};

export const getStatusText = (status: Status): string => {
  switch (status) {
    case 'red': return 'Problème Critique';
    case 'orange': return 'Avertissement';
    case 'green': return 'Opérationnel';
    default: return 'Indéterminé';
  }
};

interface FoundSiteInfo {
  site: Site;
  path: { id: string; name: string }[];
}

const findSiteByPath = (
  pathArray: string[],
  sites: Site[]
): FoundSiteInfo | undefined => {
  let currentSearchSpace = sites;
  let currentSite: Site | undefined = undefined;
  const breadcrumbPath: { id: string; name: string }[] = [];

  for (const segment of pathArray) {
    const found = currentSearchSpace.find(s => s.id === segment);
    if (found) {
      currentSite = found;
      breadcrumbPath.push({ id: found.id, name: found.name });
      currentSearchSpace = found.subSites || [];
    } else {
      return undefined;
    }
  }
  return currentSite ? { site: currentSite, path: breadcrumbPath } : undefined;
};


const MachineItem: React.FC<{ machine: Machine; onMachineClick: (machineId: string) => void }> = ({ machine, onMachineClick }) => {
  const MachineIcon = machine.icon || Server;
  const isProblem = machine.status === 'orange' || machine.status === 'red';

  const handleClick = () => {
    if (isProblem && machine.activeControlInAlert) {
      onMachineClick(machine.id);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 px-3 rounded-md",
        isProblem && machine.activeControlInAlert ? "cursor-pointer hover:bg-muted/60" : "hover:bg-muted/50"
      )}
      onClick={handleClick}
      role={isProblem && machine.activeControlInAlert ? "button" : undefined}
      tabIndex={isProblem && machine.activeControlInAlert ? 0 : undefined}
      onKeyDown={isProblem && machine.activeControlInAlert ? (e) => (e.key === 'Enter' || e.key === ' ') && handleClick() : undefined}
    >
      <div className="flex items-center gap-2">
        <MachineIcon className="h-4 w-4 text-muted-foreground" />
        <span>{machine.name} <span className="text-xs text-muted-foreground">({machine.type})</span></span>
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        {getStatusIcon(machine.status, "h-4 w-4")}
        <span className={cn(
          machine.status === 'red' && 'text-red-600',
          machine.status === 'orange' && 'text-orange-600',
          machine.status === 'green' && 'text-green-600',
          'font-medium'
        )}>
          {getStatusText(machine.status)}
        </span>
      </div>
    </div>
  );
};

interface SiteDetailZoneItemProps {
  zone: Zone;
  parentId: string; 
  onMachineClick: (machineId: string) => void;
  level?: number;
}

const SiteDetailZoneItem: React.FC<SiteDetailZoneItemProps> = ({ zone, parentId, onMachineClick, level = 0 }) => {
  const zoneStatus = getZoneOverallStatus(zone);
  const paddingLeft = `${level * 1.5}rem`; 

  return (
    <AccordionItem value={`${parentId}-${zone.id}`} className="border-b-0 mb-1 last:mb-0" style={{ marginLeft: paddingLeft }}>
      <AccordionTrigger className="py-2 px-3 hover:no-underline hover:bg-muted/30 rounded-md data-[state=open]:bg-muted/40 transition-colors">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary/80" />
            <span className="font-medium text-sm">{zone.name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium">
            {getStatusIcon(zoneStatus, "h-4 w-4")}
            <span className={cn(
              zoneStatus === 'red' && 'text-red-600',
              zoneStatus === 'orange' && 'text-orange-600',
              zoneStatus === 'green' && 'text-green-600',
            )}>
              {getStatusText(zoneStatus)}
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-4 pr-2 pb-0 pt-1">
        {zone.machines && zone.machines.length > 0 && (
          <div className="space-y-0.5 mb-2">
            {zone.machines.map((machine) => (
              <MachineItem key={machine.id} machine={machine} onMachineClick={onMachineClick} />
            ))}
          </div>
        )}
         {(!zone.machines || zone.machines.length === 0) && (!zone.subZones || zone.subZones.length === 0) && (!zone.sensors || zone.sensors.filter(s => s.scope === 'zone').length === 0) && (
           <p className="text-xs text-muted-foreground py-2 px-3">Aucune machine, sous-zone ou capteur d'ambiance défini.</p>
         )}

        {zone.subZones && zone.subZones.length > 0 && (
          <div className="mt-2 space-y-1 border-l-2 border-primary/20 pl-2">
             <p className="text-xs font-semibold text-muted-foreground mb-1">Sous-zones :</p>
            {zone.subZones.map(subZone => (
              <SiteDetailZoneItem
                key={subZone.id}
                zone={subZone}
                parentId={zone.id} 
                onMachineClick={onMachineClick}
                level={level + 1}
              />
            ))}
          </div>
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
      <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col bg-card/80 hover:bg-card">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg mb-1 flex items-center gap-2 group-hover:text-primary transition-colors">
              <SiteIcon className="h-5 w-5 text-primary" />
              {site.name}
            </CardTitle>
            <CardDescription>{site.location}</CardDescription>
          </div>
          <div className="flex flex-col items-end">
            {getStatusIcon(siteStatus, "h-6 w-6")}
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
          <p className="text-xs text-muted-foreground">
            {site.zones.length} zone(s) directe(s), {site.subSites?.length || 0} sous-site(s).
          </p>
          <p className="text-xs text-muted-foreground mt-2">Cliquez pour explorer.</p>
        </CardContent>
      </Card>
    </Link>
  );
};


export default function SiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { sitePath } = params as { sitePath: string[] };

  const [currentSiteInfo, setCurrentSiteInfo] = React.useState<FoundSiteInfo | null | undefined>(undefined);

  React.useEffect(() => {
    if (sitePath && Array.isArray(sitePath) && sitePath.length > 0) {
      const found = findSiteByPath(sitePath, DUMMY_CLIENT_SITES_DATA);
      setCurrentSiteInfo(found || null);
    } else {
      setCurrentSiteInfo(null);
    }
  }, [sitePath]);

  const handleViewMachineAlertDetails = (machineId: string) => {
    router.push(`/client/machine-alerts/${machineId}`);
  };

  if (currentSiteInfo === undefined) {
    return (
      <AppLayout>
        <div className="p-6 text-center text-lg font-semibold">Chargement des détails du site...</div>
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
        <nav className="flex items-center space-x-1.5 text-sm text-muted-foreground mb-4 bg-muted p-2 rounded-md shadow-sm">
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

        <Card className="shadow-xl">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SiteIcon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">{currentSite.name}</CardTitle>
                  <CardDescription>{currentSite.location}</CardDescription>
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
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {currentSite.zones.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-2 text-foreground/90">Zones Directes</h2>
                <Accordion type="multiple" className="w-full space-y-1 bg-muted/30 p-2 rounded-lg">
                  {currentSite.zones.map((zone) => (
                    <SiteDetailZoneItem
                      key={zone.id}
                      zone={zone}
                      parentId={currentSite.id}
                      onMachineClick={handleViewMachineAlertDetails}
                    />
                  ))}
                </Accordion>
              </section>
            )}

            {currentSite.subSites && currentSite.subSites.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-2 text-foreground/90">Sous-Sites / Bâtiments</h2>
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                  {currentSite.subSites.map((subSite) => (
                    <SubSiteCard key={subSite.id} site={subSite} currentPath={sitePath} />
                  ))}
                </div>
              </section>
            )}

            {currentSite.zones.length === 0 && (!currentSite.subSites || currentSite.subSites.length === 0) && (
              <div className="py-10 text-center">
                <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-md font-semibold text-muted-foreground">Ce site ne contient pas de zones ou de sous-sites directement configurés.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
