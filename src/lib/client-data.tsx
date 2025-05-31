
"use client"; 

import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle2, Info, Server, Thermometer, Zap, Wind, HardDrive, Package, ShoppingCart, Utensils, Factory, Truck, Apple, Beef, Snowflake, CalendarDays } from "lucide-react"; 
import { cn } from "@/lib/utils"; 

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
  sensorMappings: Record<string, string>; 
}

export interface HistoricalDataPoint {
  name: string; 
  value: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
}

export interface ActiveControlInAlert {
  controlId: string;
  controlName: string;
  alertDetails: string;
  formulaUsed?: string;
  currentValues?: Record<string, { value: string | number; unit?: string }>;
  thresholds?: Record<string, string | number>;
  status?: Status; 
  controlDescription?: string; 
  historicalData?: HistoricalDataPoint[];
  relevantSensorVariable?: string; 
  checklist?: ChecklistItem[]; 
}

export interface Machine {
  id: string;
  name: string;
  type: string; // e.g., "Frigo", "Four", "Compresseur", "Camion Réfrigéré", "Serveur Pi"
  status: Status;
  sensorsCount?: number; 
  icon?: LucideIcon;
  model?: string;
  notes?: string;
  activeControlInAlert?: ActiveControlInAlert;
  availableSensors?: { id: string; name: string; provides?: string[] }[]; 
  configuredControls?: Record<string, ConfiguredControl>; 
}

export interface Sensor {
  id: string;
  name: string;
  typeModel: string; 
  status?: Status;
  scope: 'zone' | 'machine';
  affectedMachineIds?: string[]; 
  provides?: string[]; 
  data?: Record<string, any>; 
  piServerId?: string; 
}

export interface Zone {
  id: string;
  name: string;
  machines: Machine[];
  subZones?: Zone[];
  sensors?: Sensor[]; 
  status?: Status; 
  icon?: LucideIcon;
}

export interface Site {
  id: string;
  name: string;
  location: string;
  zones: Zone[];
  subSites?: Site[]; 
  isConceptualSubSite?: boolean; 
  status?: Status; 
  icon?: LucideIcon; 
}

const restaurantChecklistTempFrigo: ChecklistItem[] = [
    { id: 'chk-frigo-porte', label: "Vérifier la fermeture correcte de la porte du réfrigérateur." },
    { id: 'chk-frigo-joint', label: "Inspecter l'étanchéité des joints de porte." },
    { id: 'chk-frigo-thermostat', label: "Confirmer que le thermostat est réglé à la bonne température." },
    { id: 'chk-frigo-nettoyage', label: "S'assurer que le condenseur est propre et non obstrué." },
];

export const DUMMY_CLIENT_SITES_DATA: Site[] = [
  // FRANCE OPERATIONS
  {
    id: "site-restaurants-france",
    name: "Restaurants Melting Pot (France)",
    location: "France",
    icon: Utensils,
    zones: [], // Main site is a container
    subSites: [
      {
        id: "site-mp-paris",
        name: "Melting Pot Paris",
        location: "15 Rue de la Paix, Paris",
        isConceptualSubSite: true,
        icon: Utensils,
        zones: [
          {
            id: "zone-paris-cuisine", name: "Cuisine Paris", machines: [
              { 
                id: "machine-paris-four", name: "Four Pro 'Vulcan'", type: "Four Professionnel", status: "green",
                availableSensors: [{ id: "sensor-paris-four-temp", name: "Sonde Temp. Four Vulcan", provides: ["temp_four"] }],
                configuredControls: {
                  "control-temp-four": { // Assumed new control
                    isActive: true, params: { "temp_max_four": 250, "temp_min_cuisson": 180 }, sensorMappings: {"temp_four": "sensor-paris-four-temp"}
                  }
                }
              },
              { 
                id: "machine-paris-frigo1", name: "Réfrigérateur 'ChefCool' R1", type: "Frigo", status: "green",
                availableSensors: [{ id: "sensor-paris-frigo1-temp", name: "Sonde Temp. Frigo R1", provides: ["temp"] }],
                configuredControls: {
                  "control-001": { isActive: true, params: { "seuil_min": 1, "seuil_max": 4 }, sensorMappings: {"temp": "sensor-paris-frigo1-temp"} }
                }
              },
              { 
                id: "machine-paris-frigo2", name: "Congélateur 'IceKing' C1", type: "Congélateur", status: "red",
                activeControlInAlert: {
                  controlId: "control-001", controlName: "Contrôle Température Congélateur",
                  alertDetails: "Température interne à -10°C. Seuil min: -18°C.", status: "red",
                  currentValues: { "temp": { value: -10, unit: "°C" } }, thresholds: { "seuil_min": -22, "seuil_max": -18 }, // Adjusted for congélateur
                  controlDescription: "Vérifie que la température du congélateur reste dans les seuils définis.",
                  historicalData: [{ name: 'T-2h', value: -17 }, { name: 'T-1h', value: -15 }, { name: 'Actuel', value: -10 }],
                  relevantSensorVariable: 'temp', checklist: restaurantChecklistTempFrigo
                },
                availableSensors: [{ id: "sensor-paris-congel1-temp", name: "Sonde Temp. Congel C1", provides: ["temp"] }],
                configuredControls: {
                  "control-001": { isActive: true, params: { "seuil_min": -22, "seuil_max": -18 }, sensorMappings: {"temp": "sensor-paris-congel1-temp"} }
                }
              }
            ],
            sensors: [{ id: "sensor-paris-cuisine-amb", name: "Ambiance Cuisine Paris", typeModel: "Sonde Ambiante THL v2.1", scope: "zone", status: "green", provides: ["temp", "humidity"] }]
          },
          { id: "zone-paris-salle", name: "Salle Restaurant Paris", machines: [], sensors: [{ id: "sensor-paris-salle-co2", name: "Qualité Air Salle Paris", typeModel: "Détecteur CO2 Z-Air", scope: "zone", status: "green", provides: ["co2"]}] },
          { id: "zone-paris-cave", name: "Cave à Vins Paris", machines: [], sensors: [{ id: "sensor-paris-cave-temphum", name: "Ambiance Cave Paris", typeModel: "Sonde Ambiante THL v2.1", scope: "zone", status: "orange", provides: ["temp", "humidity"] }] }
        ]
      },
      {
        id: "site-mp-lyon",
        name: "Melting Pot Lyon",
        location: "20 Quai Saint Antoine, Lyon",
        isConceptualSubSite: true,
        icon: Utensils,
        zones: [
          { id: "zone-lyon-cuisine", name: "Cuisine Lyon", machines: [
            { id: "machine-lyon-frigo1", name: "Réfrigérateur Positif Lyon", type: "Frigo", status: "green" }
          ]}
        ]
      }
    ]
  },
  {
    id: "site-boulangerie-france",
    name: "Le Fournil Doré",
    location: "7 Rue du Blé, Strasbourg, France",
    icon: ShoppingCart, // Placeholder, ideally a bread icon
    zones: [
      { id: "zone-fournil", name: "Fournil", machines: [
        { id: "machine-fournil-fourpain", name: "Four à Pain 'Bongard'", type: "Four Professionnel", status: "green" },
        { 
          id: "machine-fournil-chflevain", name: "Chambre Froide Levain", type: "Frigo", status: "green",
          availableSensors: [{ id: "sensor-levain-temp", name: "Sonde Temp. Levain", provides: ["temp"] }],
          configuredControls: { "control-001": { isActive: true, params: { "seuil_min": 2, "seuil_max": 5 }, sensorMappings: {"temp": "sensor-levain-temp"} } }
        }
      ]},
      { id: "zone-boutique", name: "Boutique", machines: [
        { id: "machine-boutique-vitrine", name: "Vitrine Réfrigérée Pâtisseries", type: "Frigo", status: "orange" }
      ]}
    ]
  },
  {
    id: "site-livraison-france",
    name: "RapideLivraison SAS",
    location: "Pole Logistique Rungis, France",
    icon: Truck,
    zones: [
      { id: "zone-liv-entrepot", name: "Entrepôt Central Rungis", machines: [] },
      { id: "zone-liv-vehicules", name: "Flotte de Véhicules", machines: [
        { 
          id: "machine-camion-fr01", name: "Camion FR-01 (AB-123-CD)", type: "Camion Réfrigéré", status: "red",
          activeControlInAlert: {
            controlId: "control-temp-camion", controlName: "Contrôle Température Camion",
            alertDetails: "Température caisson à 8°C. Seuil max: 4°C pour produits frais.", status: "red",
            currentValues: { "temp_caisson": { value: 8, unit: "°C" } }, thresholds: { "temp_max": 4 },
            controlDescription: "Surveille la température du caisson réfrigéré.",
            historicalData: [{ name: '10:00', value: 3 }, { name: '10:15', value: 5 }, { name: '10:30', value: 8 }],
            relevantSensorVariable: 'temp_caisson', checklist: [{id: 'chk-camion-1', label: "Vérifier la fermeture des portes du caisson."}, {id: 'chk-camion-2', label: "Contrôler le fonctionnement du groupe froid."}]
          },
          availableSensors: [{id: "sensor-camion-fr01-gps-temp", name: "Tracker GPS/Temp Camion FR01", provides: ["gps_lat", "gps_lon", "temp_caisson", "temp"]}],
          configuredControls: {"control-temp-camion": {isActive: true, params: {"temp_max": 4}, sensorMappings: {"temp_caisson": "sensor-camion-fr01-gps-temp"}}}
        },
        { id: "machine-camion-fr02", name: "Camion FR-02 (XY-789-ZZ)", type: "Camion Réfrigéré", status: "green" }
      ]}
    ]
  },
  // TUNISIA OPERATIONS
  {
    id: "site-usine-tunisie",
    name: "ProdTunis Industries",
    location: "Zone Industrielle Mghira, Tunisie",
    icon: Factory,
    zones: [
      { id: "zone-usine-embouteillage", name: "Ligne d'Embouteillage Eau Minérale", machines: [
        { id: "machine-embouteilleuse", name: "Embouteilleuse 'Krones'", type: "Equipement de Production", status: "green" }
      ]},
      { 
        id: "zone-usine-maintenance", name: "Atelier Maintenance", machines: [
        { 
          id: "machine-compresseur-c1", name: "Compresseur Air Principal 'Atlas'", type: "Compresseur", status: "orange",
          activeControlInAlert: {
            controlId: "control-003", controlName: "Alerte Pression Basse Huile Compresseur",
            alertDetails: "Pression huile à 0.4 bar. Seuil min: 0.5 bar.", status: "orange",
            currentValues: { "pression_huile": { value: 0.4, unit: "bar" } }, thresholds: { "seuil_min_pression": 0.5 },
            controlDescription: "Alerte si la pression d'huile du compresseur est trop basse.",
            historicalData: [{ name: 'T-30m', value: 0.6 }, { name: 'T-15m', value: 0.5 }, { name: 'Actuel', value: 0.4 }],
            relevantSensorVariable: 'pression_huile'
          },
          availableSensors: [{id: "sensor-comp-c1-presshuile", name: "Sonde Pression Huile C1", provides: ["pression_huile", "press"]}],
          configuredControls: { "control-003": {isActive: true, params: { "seuil_min_pression": 0.5}, sensorMappings: {"pression_huile": "sensor-comp-c1-presshuile"}}}
        }
      ]}
    ]
  },
  {
    id: "site-agrostock-tunisie",
    name: "AgroStock Tunisie",
    location: "Port de Radès, Tunisie",
    icon: Package,
    zones: [], // Main site is a container
    subSites: [
      {
        id: "site-entrepot-viandes", name: "Entrepôt Viandes", location: "AgroStock - Section Viandes", isConceptualSubSite: true, icon: Beef,
        zones: [
          { id: "zone-viande-chf-bovin", name: "Chambre Froide Bovins (-2°C)", machines: [
            { id: "machine-chf-bovin1", name: "Unité Réfrig. Bovin 1", type: "Frigo", status: "green"}
          ]},
          { id: "zone-viande-chf-volaille", name: "Chambre Congélation Volailles (-18°C)", machines: [
            { id: "machine-chf-volaille1", name: "Unité Congél. Volaille 1", type: "Congélateur", status: "green"}
          ]}
        ]
      },
      {
        id: "site-entrepot-dattes", name: "Entrepôt Dattes", location: "AgroStock - Section Dattes", isConceptualSubSite: true, icon: CalendarDays, // Placeholder for dates
        zones: [
          { id: "zone-dattes-stock", name: "Stockage Dattes (Ventilé)", machines: [] },
          { id: "zone-dattes-conditionnement", name: "Salle de Conditionnement Dattes", machines: [
            { id: "machine-dattes-emballeuse", name: "Emballeuse Dattes D1", type: "Equipement de Production", status: "green" }
          ]}
        ]
      },
      {
        id: "site-entrepot-fruitsleg", name: "Entrepôt Fruits & Légumes", location: "AgroStock - Section F&L", isConceptualSubSite: true, icon: Apple,
        zones: [
          { id: "zone-fl-reception", name: "Quai de Réception F&L", machines: []},
          { 
            id: "zone-fl-chf-tropicaux", name: "Chambre Froide Fruits Tropicaux (+8°C)", machines: [
              { 
                id: "machine-chf-tropic1", name: "Réfrigérateur Tropicaux T1", type: "Frigo", status: "red",
                activeControlInAlert: {
                  controlId: "control-001", controlName: "Contrôle Température Frigo",
                  alertDetails: "Température à 12°C. Seuil max: +10°C.", status: "red",
                  currentValues: { "temp": { value: 12, unit: "°C" } }, thresholds: { "seuil_min": 7, "seuil_max": 10 },
                  controlDescription: "Surveille la température de la chambre froide pour fruits tropicaux.",
                  historicalData: [{ name: 'T-4h', value: 9 }, { name: 'T-2h', value: 10 }, { name: 'Actuel', value: 12 }],
                  relevantSensorVariable: 'temp', checklist: restaurantChecklistTempFrigo // Can reuse or adapt
                },
                availableSensors: [{ id: "sensor-tropic1-temp", name: "Sonde Temp. Tropicaux T1", provides: ["temp"] }],
                configuredControls: { "control-001": { isActive: true, params: { "seuil_min": 7, "seuil_max": 10 }, sensorMappings: {"temp": "sensor-tropic1-temp"} } }
              }
          ]}
        ]
      }
    ]
  },
  // Serveur Pi (PC type) example, can be part of any site/zone
   {
    id: "site-pi-servers-demo",
    name: "Serveurs Pi Capnio (Exemples)",
    location: "Divers",
    icon: Server,
    zones: [
      {
        id: "zone-pi-office",
        name: "Bureau Client Exemple",
        machines: [
          {
            id: "machine-pi-office-main",
            name: "Serveur Pi - Bureau Principal",
            type: "PC", // Using "PC" as a generic type for Pi servers
            status: "green",
            icon: Server,
            availableSensors: [ // Pi itself provides these system metrics
                { id: "pi-office-temp-cpu", name: "Température CPU Pi Bureau", provides: ["temp_srv", "temp"] },
                { id: "pi-office-cpu-load", name: "Charge CPU Pi Bureau", provides: ["cpu_usage_percent"] },
                { id: "pi-office-mem-usage", name: "Utilisation RAM Pi Bureau", provides: ["mem_usage_percent"] },
                { id: "pi-office-disk-space", name: "Espace Disque Pi Bureau", provides: ["disk_free_gb"] },
            ],
            configuredControls: {
                "control-srv-temp": { isActive: true, params: { "seuil_max_temp_srv": 60 }, sensorMappings: { "temp_srv": "pi-office-temp-cpu" } },
                "control-srv-cpu": { isActive: true, params: { "seuil_max_cpu": 70 }, sensorMappings: { "cpu_usage_percent": "pi-office-cpu-load" } },
            }
          }
        ],
        sensors: [ // External sensors connected TO this Pi
            { id: "ext-sensor-temp-ambiant", name: "Sonde Ambiante Bureau (via Pi)", typeModel: "Sonde Ambiante THL v2.1", scope: "zone", status: "green", provides: ["temp", "humidity"], piServerId: "machine-pi-office-main"},
            { id: "ext-sensor-co2-bureau", name: "Capteur CO2 Bureau (via Pi)", typeModel: "Détecteur CO2 Z-Air", scope: "zone", status: "green", provides: ["co2"], piServerId: "machine-pi-office-main"}
        ]
      }
    ]
  }
];


export const getMachineOverallStatus = (machine: Machine): Status => {
  return machine.status;
};

export const getZoneOverallStatus = (zone: Zone): Status => {
  let hasRed = false;
  let hasOrange = false;

  zone.machines.forEach(m => {
    if (m.status === 'red') hasRed = true;
    else if (m.status === 'orange') hasOrange = true;
  });
  zone.sensors?.forEach(s => {
    if (s.status === 'red') hasRed = true;
    else if (s.status === 'orange') hasOrange = true;
  });

  if (zone.subZones) {
    zone.subZones.forEach(sz => {
      const subZoneStatus = getZoneOverallStatus(sz);
      if (subZoneStatus === 'red') hasRed = true;
      else if (subZoneStatus === 'orange') hasOrange = true;
    });
  }
  
  if (hasRed) return 'red';
  if (hasOrange) return 'orange';
  return 'green';
};

export const getSiteOverallStatus = (site: Site): Status => {
  let hasRed = false;
  let hasOrange = false;

  site.zones.forEach(z => {
    const zoneStatus = getZoneOverallStatus(z);
    if (zoneStatus === 'red') hasRed = true;
    else if (zoneStatus === 'orange') hasOrange = true;
  });

  if (site.subSites) {
    site.subSites.forEach(ss => {
      const subSiteStatus = getSiteOverallStatus(ss);
      if (subSiteStatus === 'red') hasRed = true;
      else if (subSiteStatus === 'orange') hasOrange = true;
    });
  }

  if (hasRed) return 'red';
  if (hasOrange) return 'orange';
  return 'green';
};

export const getStatusIcon = (status: Status, className?: string): React.ReactNode => {
  const defaultClassName = "h-5 w-5"; 
  const combinedClassName = className ? `${defaultClassName} ${className}` : defaultClassName;

  switch (status) {
    case 'red':
      return <AlertTriangle className={cn(combinedClassName, "text-red-500")} />;
    case 'orange':
      return <Info className={cn(combinedClassName, "text-orange-500")} />;
    case 'green':
      return <CheckCircle2 className={cn(combinedClassName, "text-green-500")} />;
    default: 
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
    if (type.toLowerCase().includes("frigo") || type.toLowerCase().includes("congélateur")) return Thermometer;
    if (type.toLowerCase().includes("four")) return Utensils; // More specific for restaurant/bakery context
    if (type.toLowerCase().includes("électrique") || type.toLowerCase().includes("elec")) return Zap;
    if (type.toLowerCase().includes("compresseur") || type.toLowerCase().includes("pompe") || type.toLowerCase().includes("hvac") || type.toLowerCase().includes("ventilation")) return Wind;
    if (type.toLowerCase().includes("serveur") || type.toLowerCase().includes("pc") || type.toLowerCase().includes("pi")) return Server;
    if (type.toLowerCase().includes("camion")) return Truck;
    return HardDrive; 
};

// Function to recursively find a site or zone for breadcrumbs or direct access
export const findAssetById = (assetId: string, sites: Site[] = DUMMY_CLIENT_SITES_DATA): Site | Zone | undefined => {
  for (const site of sites) {
    if (site.id === assetId) return site;
    if (site.subSites) {
      const foundInSubSite = findAssetById(assetId, site.subSites);
      if (foundInSubSite) return foundInSubSite;
    }
    for (const zone of site.zones) {
      if (zone.id === assetId) return zone;
      if (zone.subZones) {
        const findInSubZone = (currentZone: Zone): Zone | undefined => {
          if (currentZone.id === assetId) return currentZone;
          if (currentZone.subZones) {
            for (const sz of currentZone.subZones) {
              const found = findInSubZone(sz);
              if (found) return found;
            }
          }
          return undefined;
        }
        const foundInSubZoneRecursive = findInSubZone(zone);
        if(foundInSubZoneRecursive) return foundInSubZoneRecursive;
      }
    }
  }
  return undefined;
};
