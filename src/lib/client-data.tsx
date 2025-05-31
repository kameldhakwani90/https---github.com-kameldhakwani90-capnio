
"use client"; // Or remove if not strictly needed by data, but some functions might use client-side features if they evolve.

import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle2, Info, Server, Thermometer, Zap, Wind, HardDrive } from "lucide-react"; // Import icons used by getMachineIcon
import { cn } from "@/lib/utils"; // For getStatusIcon className usage

// Re-define or import Status type
export type Status = 'green' | 'orange' | 'red' | 'white';

export interface ControlParameter {
  id: string;
  label: string;
  type: 'number' | 'string' | 'boolean';
  defaultValue?: string | number | boolean;
  options?: { label: string; value: string | number }[];
}

export interface ConfiguredControl {
  isActive: boolean;
  params: Record<string, string | number | boolean>;
  sensorMappings: Record<string, string>; // variableId -> sensorInstanceId
}

export interface HistoricalDataPoint {
  name: string; // e.g., "T-4", "T-3", "Maintenant" or actual timestamps
  value: number;
  // Add other series if needed, e.g., threshold_max: number
}

export interface ChecklistItem {
  id: string;
  label: string;
  // checked?: boolean; // State would be managed in component
}

export interface ActiveControlInAlert {
  controlId: string;
  controlName: string;
  alertDetails: string;
  formulaUsed?: string;
  currentValues?: Record<string, { value: string | number; unit?: string }>;
  thresholds?: Record<string, string | number>;
  status?: Status; // Status of the control/alert itself
  controlDescription?: string; // Description of the control that is alerting
  historicalData?: HistoricalDataPoint[];
  relevantSensorVariable?: string; // The main variable shown in the history chart
  checklist?: ChecklistItem[]; // Specific checklist for this alert state
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: Status;
  sensorsCount?: number; // Number of sensors directly attached or monitoring this machine
  icon?: LucideIcon;
  model?: string;
  notes?: string;
  activeControlInAlert?: ActiveControlInAlert;
  availableSensors?: { id: string; name: string; provides?: string[] }[]; // Sensor variable names it can provide e.g. ['temp', 'pressure']
  configuredControls?: Record<string, ConfiguredControl>; // controlId -> configuration
}

export interface Sensor {
  id: string;
  name: string;
  typeModel: string; // Reference to an admin-defined sensor type
  status?: Status;
  scope: 'zone' | 'machine';
  affectedMachineIds?: string[]; // Only if scope is 'machine'
  provides?: string[]; // e.g. ['temp', 'humidity_percent']
  data?: Record<string, any>; // Last readings or specific sensor data
  piServerId?: string; // Optional ID of the Pi Server it's connected through
}

export interface Zone {
  id: string;
  name: string;
  machines: Machine[];
  subZones?: Zone[];
  sensors?: Sensor[]; // Ambient sensors or all sensors within this zone
  status?: Status; // Calculated status for the zone
  icon?: LucideIcon;
}

export interface Site {
  id: string;
  name: string;
  location: string;
  zones: Zone[];
  subSites?: Site[]; // For nested sites like buildings within a campus
  isConceptualSubSite?: boolean; // True if it's a sub-site that's more like a "group" than a physical different location
  status?: Status; // Calculated status for the site
  icon?: LucideIcon;
}

export const DUMMY_CLIENT_SITES_DATA: Site[] = [
  {
    id: "site-campus-central",
    name: "Campus Central Opérations",
    location: "123 Tech Avenue, Innovation City",
    zones: [
      {
        id: "zone-cc-admin",
        name: "Bâtiment Administratif Central",
        machines: [
          {
            id: "machine-cc-admin-hvac",
            name: "Climatisation Centrale HVAC",
            type: "HVAC",
            status: "green",
            activeControlInAlert: undefined,
            availableSensors: [
                { id: "sensor-hvac-temp-in", name: "Température Entrée HVAC", provides: ["temp"] },
                { id: "sensor-hvac-temp-out", name: "Température Sortie HVAC", provides: ["temp"] },
                { id: "sensor-hvac-current", name: "Courant HVAC", provides: ["courant", "tension"] },
            ],
            configuredControls: {
                "control-002": { // Consommation Électrique
                    isActive: true,
                    params: { "seuil_max_conso": 3500 },
                    sensorMappings: { "tension": "sensor-hvac-current", "courant": "sensor-hvac-current" }
                }
            }
          },
          {
            id: "machine-cc-admin-srv",
            name: "Serveur Principal Admin",
            type: "Serveur", // Matched with "Serveur" in control types
            status: "green", // Initially green
            availableSensors: [
                { id: "srv-internal-temp", name: "Sonde Température Interne Serveur", provides: ["temp_srv", "temp"] },
                { id: "srv-cpu-util", name: "Moniteur CPU", provides: ["cpu_usage_percent"] },
                { id: "srv-mem-util", name: "Moniteur RAM", provides: ["mem_usage_percent"] },
                { id: "srv-disk-c-free", name: "Espace Disque C:", provides: ["disk_free_gb"] },
                { id: "srv-net-ping", name: "Latence Ping GW", provides: ["ping_latency_ms"] },
            ],
            configuredControls: {
                "control-srv-temp": { isActive: true, params: { "seuil_max_temp_srv": 65 }, sensorMappings: { "temp_srv": "srv-internal-temp" } },
                "control-srv-cpu": { isActive: true, params: { "seuil_max_cpu": 80 }, sensorMappings: { "cpu_usage_percent": "srv-cpu-util" } },
                "control-srv-mem": { isActive: true, params: { "seuil_max_mem": 75 }, sensorMappings: { "mem_usage_percent": "srv-mem-util" } },
                "control-srv-disk": { isActive: true, params: { "seuil_min_disk_gb": 50 }, sensorMappings: { "disk_free_gb": "srv-disk-c-free" } },
                "control-srv-latency": { isActive: true, params: { "seuil_max_latency_ms": 50 }, sensorMappings: { "ping_latency_ms": "srv-net-ping" } },
            }
          },
        ],
        sensors: [
            { id: "sensor-ambient-admin-hall", name: "Température Ambiante Hall Admin", typeModel: "Sonde Ambiante THL v2.1", scope: "zone", status: "green", provides: ["temp", "humidity"] },
            { id: "sensor-hvac-current", name: "Capteur Courant HVAC", typeModel: "Capteur de Courant Monophasé CM-100", scope: "machine", affectedMachineIds: ["machine-cc-admin-hvac"], status: "green", provides: ["courant", "tension"] }
        ],
        subZones: [
          { id: "zone-cc-admin-101", name: "Bureau 101", machines: [] },
          { id: "zone-cc-admin-102", name: "Bureau 102", machines: [] },
        ],
      },
      {
        id: "zone-cc-lab",
        name: "Laboratoire de Recherche R&D",
        machines: [
          {
            id: "machine-cc-lab-analyzer",
            name: "Analyseur Spectral AS-5000",
            type: "Équipement de Labo",
            status: "orange",
            activeControlInAlert: {
              controlId: "control-lab-stability", // Fictional control
              controlName: "Contrôle Stabilité Analyseur",
              alertDetails: "Dérive de fréquence détectée. Calibration nécessaire.",
              status: "orange",
              currentValues: { "drift_ppm": { value: 5.2, unit: "ppm" } },
              thresholds: { "max_drift_ppm": 5.0 },
              controlDescription: "Maintient la dérive de fréquence de l'analyseur dans les tolérances.",
              historicalData: [
                { name: 'T-4h', value: 4.8 }, { name: 'T-3h', value: 4.9 },
                { name: 'T-2h', value: 5.0 }, { name: 'T-1h', value: 5.1 },
                { name: 'Actuel', value: 5.2 },
              ],
              relevantSensorVariable: 'drift_ppm',
              checklist: [{id: 'lab-chk-1', label: "Vérifier l'alimentation électrique."}, {id: 'lab-chk-2', label: "Lancer une routine de calibration."}]
            }
          },
        ],
      },
    ],
    subSites: [
      {
        id: "site-ba-prod",
        name: "Bâtiment A - Production",
        location: "Section Nord, Campus Central",
        isConceptualSubSite: true,
        zones: [
          {
            id: "zone-ba-assembly",
            name: "Ligne d'Assemblage Alpha",
            machines: [
              { id: "machine-ba-asm-robot1", name: "Robot Kuka KR210", type: "Robot Industriel", status: "green" },
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
                activeControlInAlert: {
                  controlId: "control-001",
                  controlName: "Contrôle Température Frigo",
                  alertDetails: "Température interne à 8°C. Seuil max: 5°C.",
                  status: "red",
                  currentValues: { "temp": { value: 8, unit: "°C" } },
                  thresholds: { "seuil_min": 0, "seuil_max": 5 },
                  controlDescription: "Vérifie que la température du frigo reste dans les seuils définis.",
                  historicalData: [
                    { name: 'T-60m', value: 4 }, { name: 'T-45m', value: 5 },
                    { name: 'T-30m', value: 6 }, { name: 'T-15m', value: 7 },
                    { name: 'Actuel', value: 8 },
                  ],
                  relevantSensorVariable: 'temp',
                  checklist: [
                    { id: 'chk-frigo-1', label: "Vérifier que la porte du frigo est bien fermée et étanche." },
                    { id: 'chk-frigo-2', label: "Nettoyer le condenseur de toute poussière ou obstruction." },
                  ]
                },
                availableSensors: [{ id: "frigo-s01-temp", name: "Sonde Temp. Interne Frigo F-01", provides: ["temp"] }],
                configuredControls: {
                  "control-001": { // Contrôle Température Frigo
                    isActive: true,
                    params: { "seuil_min": 0, "seuil_max": 5 },
                    sensorMappings: { "temp": "frigo-s01-temp" }
                  }
                }
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "site-data-center-est",
    name: "Data Center Est",
    location: "55 Binary Lane, Server City",
    zones: [
      {
        id: "zone-dc-salle-a",
        name: "Salle Serveurs A",
        machines: [
          { id: "machine-dc-rack01", name: "Rack 01", type: "Serveur", status: "green" },
          { id: "machine-dc-rack02", name: "Rack 02", type: "Serveur", status: "green" },
        ],
      },
      {
        id: "zone-dc-salle-b",
        name: "Salle Serveurs B",
        machines: [
          { id: "machine-dc-rack03", name: "Rack 03", type: "Serveur", status: "orange" },
        ],
      },
    ],
  },
];

// Helper functions (could be moved to utils if they grow numerous)
export const getMachineOverallStatus = (machine: Machine): Status => {
  return machine.status;
};

export const getZoneOverallStatus = (zone: Zone): Status => {
  if (zone.machines.some(m => m.status === 'red') || zone.sensors?.some(s => s.status === 'red')) return 'red';
  if (zone.machines.some(m => m.status === 'orange') || zone.sensors?.some(s => s.status === 'orange')) return 'orange';
  if (zone.subZones && zone.subZones.some(sz => getZoneOverallStatus(sz) === 'red')) return 'red';
  if (zone.subZones && zone.subZones.some(sz => getZoneOverallStatus(sz) === 'orange')) return 'orange';
  return 'green';
};

export const getSiteOverallStatus = (site: Site): Status => {
  if (site.zones.some(z => getZoneOverallStatus(z) === 'red')) return 'red';
  if (site.subSites && site.subSites.some(ss => getSiteOverallStatus(ss) === 'red')) return 'red';
  if (site.zones.some(z => getZoneOverallStatus(z) === 'orange')) return 'orange';
  if (site.subSites && site.subSites.some(ss => getSiteOverallStatus(ss) === 'orange')) return 'orange';
  return 'green';
};

export const getStatusIcon = (status: Status, className?: string): React.ReactNode => {
  const defaultClassName = "h-5 w-5"; // Default size
  const combinedClassName = className ? `${defaultClassName} ${className}` : defaultClassName;

  switch (status) {
    case 'red':
      return <AlertTriangle className={cn(combinedClassName, "text-red-500")} />;
    case 'orange':
      return <Info className={cn(combinedClassName, "text-orange-500")} />;
    case 'green':
      return <CheckCircle2 className={cn(combinedClassName, "text-green-500")} />;
    default: // white or undefined
      return <Info className={cn(combinedClassName, "text-gray-400")} />;
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

export const getMachineIcon = (type: string): LucideIcon => {
    if (type === "Frigo" || type === "Congélateur") return Thermometer;
    if (type === "Armoire Électrique" || type.toLowerCase().includes("elec")) return Zap;
    if (type === "Compresseur" || type === "Pompe Hydraulique" || type.toLowerCase().includes("hvac") || type.toLowerCase().includes("ventilation")) return Wind;
    if (type.toLowerCase().includes("serveur") || type.toLowerCase().includes("pc")) return Server;
    return HardDrive; // Default icon
};
