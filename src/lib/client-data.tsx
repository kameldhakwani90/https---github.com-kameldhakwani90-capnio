
"use client"; 

import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle2, Info, Server, Thermometer, Zap, Wind, HardDrive, Package, ShoppingCart, Utensils, Factory, Truck, Apple, Beef, Snowflake, CalendarDays, Tractor, SprayCan, PawPrint, Warehouse, Move, Flame, Droplets, Wheat, Sprout } from "lucide-react"; 
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

// New Event Log Structures
export type EventSeverity = 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
export type EventType = 
  | 'ALERT_TRIGGERED' 
  | 'ALERT_RESOLVED' 
  | 'CONTROL_ACTIVATED' 
  | 'CONTROL_DEACTIVATED' 
  | 'CONTROL_PARAMETER_CHANGED' 
  | 'SENSOR_OFFLINE' 
  | 'SENSOR_ONLINE' 
  | 'MAINTENANCE_LOGGED' 
  | 'SYSTEM_NOTE';

export interface EventLogEntry {
  id: string;
  timestamp: string; // ISO date-time string
  type: EventType;
  severity: EventSeverity;
  message: string;
  details?: Record<string, any>; // e.g., { controlName: "Temp Control", oldValue: 5, newValue: 4 }
  controlId?: string;
  sensorId?: string;
}

export interface Machine {
  id: string;
  name: string;
  type: string; 
  status: Status;
  sensorsCount?: number; 
  icon?: LucideIcon;
  model?: string;
  notes?: string;
  activeControlInAlert?: ActiveControlInAlert;
  availableSensors?: { id: string; name: string; provides?: string[] }[]; 
  configuredControls?: Record<string, ConfiguredControl>;
  eventLog?: EventLogEntry[]; 
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

export const securityChecklistMotion: ChecklistItem[] = [
    { id: 'chk-motion-cam', label: "Vérifier l'angle et la propreté de la caméra associée (si applicable)." },
    { id: 'chk-motion-path', label: "S'assurer qu'aucun objet n'obstrue le champ de détection." },
    { id: 'chk-motion-power', label: "Confirmer l'alimentation du détecteur." },
];

export const securityChecklistSmoke: ChecklistItem[] = [
    { id: 'chk-smoke-battery', label: "Tester la batterie du détecteur de fumée." },
    { id: 'chk-smoke-dust', label: "Nettoyer le détecteur de toute poussière accumulée." },
    { id: 'chk-smoke-path', label: "S'assurer que le détecteur n'est pas obstrué." },
];

export const farmChecklistSoilMoisture: ChecklistItem[] = [
    { id: 'chk-soil-sensor-placement', label: "Vérifier que la sonde est correctement insérée dans le sol." },
    { id: 'chk-soil-irrigation-nozzles', label: "Inspecter les buses d'irrigation pour obstructions." },
    { id: 'chk-soil-water-source', label: "Confirmer que la source d'eau pour l'irrigation est disponible." },
];

export const farmChecklistAnimalEnclosure: ChecklistItem[] = [
    { id: 'chk-animal-ventilation', label: "Vérifier le bon fonctionnement des ventilateurs." },
    { id: 'chk-animal-water', label: "S'assurer de la disponibilité d'eau fraîche pour les animaux." },
    { id: 'chk-animal-shade', label: "Vérifier la présence de zones d'ombre en cas de forte chaleur." },
];

export const agroChecklistHumidityCold: ChecklistItem[] = [
    { id: 'agro-chk-hc-1', label: "Vérifier l'étalonnage des sondes de température et d'humidité régulièrement." },
    { id: 'agro-chk-hc-2', label: "Assurer une circulation d'air adéquate pour éviter les points chauds/froids et les zones de condensation." },
    { id: 'agro-chk-hc-3', label: "Surveiller les cycles de dégivrage des évaporateurs pour éviter l'accumulation de glace et les fluctuations d'humidité." },
    { id: 'agro-chk-hc-4', label: "Ajuster les consignes de température et d'humidité en fonction du type de produit stocké et de sa sensibilité (ex: dattes vs fruits tropicaux)." },
    { id: 'agro-chk-hc-5', label: "Inspecter l'isolation de la chambre froide et l'étanchéité des portes pour minimiser les échanges thermiques avec l'extérieur." },
    { id: 'agro-chk-hc-6', label: "Former le personnel aux bonnes pratiques de chargement/déchargement pour limiter les variations de température." },
];


export const DUMMY_CLIENT_SITES_DATA: Site[] = [
  // FRANCE OPERATIONS
  {
    id: "site-restaurants-france",
    name: "Restaurants Melting Pot (France)",
    location: "France",
    icon: Utensils,
    zones: [], 
    subSites: [
      {
        id: "site-mp-paris",
        name: "Melting Pot Paris",
        location: "15 Rue de la Paix, Paris",
        isConceptualSubSite: true,
        icon: Utensils,
        zones: [
          {
            id: "zone-paris-cuisine", name: "Cuisine Paris", 
            machines: [
              { 
                id: "machine-paris-four", name: "Four Pro 'Vulcan'", type: "Four Professionnel", status: "green",
                availableSensors: [{ id: "sensor-paris-four-temp", name: "Sonde Temp. Four Vulcan", provides: ["temp_four"] }],
                configuredControls: {
                  "control-temp-four": { isActive: true, params: { "temp_max_four": 250, "temp_min_cuisson": 180 }, sensorMappings: {"temp_four": "sensor-paris-four-temp"} }
                },
                eventLog: [
                  { id: "evt-four-1", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), type: "CONTROL_ACTIVATED", severity: "INFO", message: "Contrôle température four activé.", controlId: "control-temp-four" },
                  { id: "evt-four-2", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), type: "MAINTENANCE_LOGGED", severity: "INFO", message: "Nettoyage mensuel effectué." },
                ]
              },
              { 
                id: "machine-paris-frigo1", name: "Réfrigérateur 'ChefCool' R1", type: "Frigo", status: "green",
                availableSensors: [{ id: "sensor-paris-frigo1-temp", name: "Sonde Temp. Frigo R1", provides: ["temp"] }],
                configuredControls: { "control-001": { isActive: true, params: { "seuil_min": 1, "seuil_max": 4 }, sensorMappings: {"temp": "sensor-paris-frigo1-temp"} } }
              },
              { 
                id: "machine-paris-frigo2", name: "Congélateur 'IceKing' C1", type: "Congélateur", status: "red",
                activeControlInAlert: {
                  controlId: "control-001", controlName: "Contrôle Température Congélateur",
                  alertDetails: "Température interne à -10°C. Seuil min: -18°C.", status: "red",
                  currentValues: { "temp": { value: -10, unit: "°C" } }, thresholds: { "seuil_min": -22, "seuil_max": -18 },
                  controlDescription: "Vérifie que la température du congélateur reste dans les seuils définis.",
                  historicalData: [{ name: 'T-2h', value: -17 }, { name: 'T-1h', value: -15 }, { name: 'Actuel', value: -10 }],
                  relevantSensorVariable: 'temp', checklist: restaurantChecklistTempFrigo
                },
                availableSensors: [{ id: "sensor-paris-congel1-temp", name: "Sonde Temp. Congel C1", provides: ["temp"] }],
                configuredControls: { "control-001": { isActive: true, params: { "seuil_min": -22, "seuil_max": -18 }, sensorMappings: {"temp": "sensor-paris-congel1-temp"} } },
                eventLog: [
                    { id: "evt-congel-1", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), type: "ALERT_TRIGGERED", severity: "CRITICAL", message: "Température congélateur -10°C (Seuil max: -18°C).", controlId: "control-001", details: { currentValue: -10, threshold: -18 } },
                    { id: "evt-congel-2", timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), type: "MAINTENANCE_LOGGED", severity: "INFO", message: "Cycle de dégivrage manuel effectué." },
                ]
              },
              { id: "machine-paris-cuisine-secu", name: "Hub Sécurité Cuisine", type: "Hub Sécurité", status: "green", 
                availableSensors: [],
                configuredControls: {
                     "control-motion-security": { isActive: true, params: { "heure_debut_surveillance": "01:00", "heure_fin_surveillance": "07:00", "surveillance_active": true }, sensorMappings: {"motion_detected": "sensor-paris-cuisine-motion"} },
                     "control-smoke-alarm": { isActive: true, params: {}, sensorMappings: {"smoke_detected": "sensor-paris-cuisine-fumee"} }
                }
              }
            ],
            sensors: [
              { id: "sensor-paris-cuisine-amb", name: "Ambiance Cuisine Paris", typeModel: "Sonde Ambiante THL v2.1", scope: "zone", status: "green", provides: ["temp", "humidity"] },
              { id: "sensor-paris-cuisine-fumee", name: "Détecteur Fumée Cuisine", typeModel: "Détecteur de Fumée FireAlert Z3", scope: "zone", status: "green", provides: ["smoke_detected"], piServerId: "machine-paris-cuisine-secu" },
              { id: "sensor-paris-cuisine-motion", name: "Détecteur Mouvement Cuisine", typeModel: "Détecteur de Mouvement SecuMotion X1", scope: "zone", status: "green", provides: ["motion_detected"], piServerId: "machine-paris-cuisine-secu" }
            ]
          },
          { id: "zone-paris-salle", name: "Salle Restaurant Paris", machines: [
            { id: "machine-paris-salle-secu", name: "Hub Sécurité Salle", type: "Hub Sécurité", status: "green", 
                availableSensors: [],
                configuredControls: {
                     "control-motion-security": { isActive: true, params: { "heure_debut_surveillance": "01:00", "heure_fin_surveillance": "07:00", "surveillance_active": true }, sensorMappings: {"motion_detected": "sensor-paris-salle-motion"} }
                }
            }
          ], sensors: [
              { id: "sensor-paris-salle-co2", name: "Qualité Air Salle Paris", typeModel: "Détecteur CO2 Z-Air", scope: "zone", status: "green", provides: ["co2"]},
              { id: "sensor-paris-salle-motion", name: "Détecteur Mouvement Salle (nuit)", typeModel: "Détecteur de Mouvement SecuMotion X1", scope: "zone", status: "green", provides: ["motion_detected"], piServerId: "machine-paris-salle-secu" }
          ]},
          { id: "zone-paris-cave", name: "Cave à Vins Paris", machines: [
            { id: "machine-paris-cave-secu", name: "Hub Sécurité Cave", type: "Hub Sécurité", status: "green", 
                availableSensors: [],
                configuredControls: {
                     "control-motion-security": { isActive: true, params: { "heure_debut_surveillance": "00:00", "heure_fin_surveillance": "08:00", "surveillance_active": true }, sensorMappings: {"motion_detected": "sensor-paris-cave-motion"} }
                }
            }
          ], sensors: [
              { id: "sensor-paris-cave-temphum", name: "Ambiance Cave Paris", typeModel: "Sonde Ambiante THL v2.1", scope: "zone", status: "orange", provides: ["temp", "humidity"] },
              { id: "sensor-paris-cave-motion", name: "Détecteur Mouvement Cave (nuit)", typeModel: "Détecteur de Mouvement SecuMotion X1", scope: "zone", status: "green", provides: ["motion_detected"], piServerId: "machine-paris-cave-secu" }
          ]}
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
            { id: "machine-lyon-frigo1", name: "Réfrigérateur Positif Lyon", type: "Frigo", status: "green", availableSensors: [{id: "s-lyon-frigo1-temp", name: "Temp Frigo Lyon 1", provides:["temp"]}]},
            { id: "machine-lyon-cuisine-secu", name: "Hub Sécurité Cuisine Lyon", type: "Hub Sécurité", status: "green", 
                availableSensors: [],
                configuredControls: {
                     "control-smoke-alarm": { isActive: true, params: {}, sensorMappings: {"smoke_detected": "sensor-lyon-cuisine-fumee"} }
                }
            }
          ], sensors: [
            { id: "sensor-lyon-cuisine-fumee", name: "Détecteur Fumée Cuisine Lyon", typeModel: "Détecteur de Fumée FireAlert Z3", scope: "zone", status: "green", provides: ["smoke_detected"], piServerId: "machine-lyon-cuisine-secu" }
          ]}
        ]
      }
    ]
  },
  {
    id: "site-boulangerie-france",
    name: "Le Fournil Doré",
    location: "7 Rue du Blé, Strasbourg, France",
    icon: ShoppingCart, 
    zones: [
      { id: "zone-fournil", name: "Fournil", machines: [
        { id: "machine-fournil-fourpain", name: "Four à Pain 'Bongard'", type: "Four Professionnel", status: "green", availableSensors: [{id: "s-fournil-fourpain-temp", name: "Temp Four à Pain", provides:["temp_four"]}] },
        { 
          id: "machine-fournil-chflevain", name: "Chambre Froide Levain", type: "Frigo", status: "green",
          availableSensors: [{ id: "sensor-levain-temp", name: "Sonde Temp. Levain", provides: ["temp"] }],
          configuredControls: { "control-001": { isActive: true, params: { "seuil_min": 2, "seuil_max": 5 }, sensorMappings: {"temp": "sensor-levain-temp"} } }
        },
        { id: "machine-fournil-secu", name: "Hub Sécurité Fournil", type: "Hub Sécurité", status: "green", 
            availableSensors: [],
            configuredControls: {
                 "control-smoke-alarm": { isActive: true, params: {}, sensorMappings: {"smoke_detected": "sensor-fournil-fumee"} }
            }
        }
      ], sensors: [
         { id: "sensor-fournil-fumee", name: "Détecteur Fumée Fournil", typeModel: "Détecteur de Fumée FireAlert Z3", scope: "zone", status: "green", provides: ["smoke_detected"], piServerId: "machine-fournil-secu" }
      ]},
      { id: "zone-boutique", name: "Boutique", machines: [
        { id: "machine-boutique-vitrine", name: "Vitrine Réfrigérée Pâtisseries", type: "Vitrine Réfrigérée", status: "orange", availableSensors: [{id: "s-boutique-vitrine-temp", name: "Temp Vitrine Pâtisserie", provides:["temp"]}]},
        { id: "machine-boutique-secu", name: "Hub Sécurité Boutique", type: "Hub Sécurité", status: "green", 
            availableSensors: [],
            configuredControls: {
                "control-motion-security": { isActive: true, params: { "heure_debut_surveillance": "20:00", "heure_fin_surveillance": "06:00", "surveillance_active": true }, sensorMappings: {"motion_detected": "sensor-boutique-motion"} }
            }
        }
      ], sensors: [
          { id: "sensor-boutique-motion", name: "Détecteur Mouvement Boutique (nuit)", typeModel: "Détecteur de Mouvement SecuMotion X1", scope: "zone", status: "green", provides: ["motion_detected"], piServerId: "machine-boutique-secu" }
      ]}
    ]
  },
  {
    id: "site-livraison-france",
    name: "RapideLivraison SAS",
    location: "Pole Logistique Rungis, France",
    icon: Truck,
    zones: [
      { id: "zone-liv-entrepot", name: "Entrepôt Central Rungis", machines: [
        { id: "machine-rungis-secu", name: "Hub Sécurité Rungis", type: "Hub Sécurité", status: "green", 
            availableSensors: [],
            configuredControls: {
                 "control-smoke-alarm": { isActive: true, params: {}, sensorMappings: {"smoke_detected": "sensor-rungis-fumee"} },
                 "control-motion-security": { isActive: true, params: { "heure_debut_surveillance": "22:00", "heure_fin_surveillance": "06:00", "surveillance_active": true }, sensorMappings: {"motion_detected": "sensor-rungis-motion-quai"} }
            }
        },
        { id: "machine-rungis-frigo-stock", name: "Chambre Froide Stockage Rungis", type: "Chambre Froide", status: "green",
            availableSensors: [{id: "s-rungis-frigo-stock-temp", name: "Temp Ch. Froide Rungis", provides:["temp"]}],
            configuredControls: {"control-001": { isActive: true, params: { "seuil_min": 0, "seuil_max": 4 }, sensorMappings: {"temp": "s-rungis-frigo-stock-temp"} } }
        }
      ], sensors: [
        { id: "sensor-rungis-motion-quai", name: "Détecteur Mouvement Quai Rungis", typeModel: "Détecteur de Mouvement SecuMotion X1", scope: "zone", status: "orange", provides: ["motion_detected"], piServerId: "machine-rungis-secu",
          data: { activeControlInAlert: { controlId: "control-motion-security", controlName: "Détection de Mouvement (Sécurité Horodatée)", alertDetails: "Mouvement détecté sur le quai à 03:15.", status: "orange", currentValues: {"motion_detected": {value: true}}, thresholds: {"heure_debut_surveillance": "22:00", "heure_fin_surveillance": "06:00"}, controlDescription: "Alerte si un mouvement est détecté en dehors des heures d'ouverture.", checklist: securityChecklistMotion}}
        },
        { id: "sensor-rungis-fumee", name: "Détecteur Fumée Entrepôt Rungis", typeModel: "Détecteur de Fumée FireAlert Z3", scope: "zone", status: "green", provides: ["smoke_detected"], piServerId: "machine-rungis-secu"}
      ]},
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
          configuredControls: {"control-temp-camion": {isActive: true, params: {"temp_max": 4}, sensorMappings: {"temp_caisson": "sensor-camion-fr01-gps-temp"}}},
          eventLog: [
            {id: "evt-camion1", timestamp: new Date(Date.now() - 1*60*1000).toISOString(), type: "ALERT_TRIGGERED", severity: "CRITICAL", message: "Température camion FR-01 à 8°C (max 4°C)", controlId: "control-temp-camion"},
            {id: "evt-camion2", timestamp: new Date(Date.now() - 24*60*60*1000).toISOString(), type: "SYSTEM_NOTE", severity: "INFO", message: "Départ pour livraison - Paris centre."},
          ]
        },
        { id: "machine-camion-fr02", name: "Camion FR-02 (XY-789-ZZ)", type: "Camion Réfrigéré", status: "green", availableSensors: [{id: "sensor-camion-fr02-gps-temp", name: "Tracker GPS/Temp Camion FR02", provides: ["gps_lat", "gps_lon", "temp_caisson", "temp"]}] }
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
        { id: "machine-embouteilleuse", name: "Embouteilleuse 'Krones'", type: "Equipement de Production", status: "green", availableSensors: [{id: "s-emb-krones-vitesse", name: "Vitesse Emb. Krones", provides: ["speed"]}] },
        { id: "machine-emb-secu", name: "Hub Sécurité Embouteillage", type: "Hub Sécurité", status: "green", 
            availableSensors: [],
            configuredControls: {
                "control-smoke-alarm": { isActive: true, params: {}, sensorMappings: {"smoke_detected": "sensor-emb-fumee"} }
            }
        }
      ], sensors: [
        { id: "sensor-emb-fumee", name: "Détecteur Fumée Ligne Emb.", typeModel: "Détecteur de Fumée FireAlert Z3", scope: "zone", status: "green", provides: ["smoke_detected"], piServerId: "machine-emb-secu" }
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
          configuredControls: { "control-003": {isActive: true, params: { "seuil_min_pression": 0.5}, sensorMappings: {"pression_huile": "sensor-comp-c1-presshuile"}}},
          eventLog: [
              {id: "evt-comp1", timestamp: new Date(Date.now() - 2*60*60*1000).toISOString(), type: "ALERT_TRIGGERED", severity: "WARNING", message: "Pression huile compresseur C1 basse: 0.4 bar.", controlId: "control-003"},
              {id: "evt-comp2", timestamp: new Date(Date.now() - 7*24*60*60*1000).toISOString(), type: "MAINTENANCE_LOGGED", severity: "INFO", message: "Vérification et appoint huile compresseur C1."},
          ]
        },
        { id: "machine-maint-secu", name: "Hub Sécurité Maintenance", type: "Hub Sécurité", status: "green", 
            availableSensors: [],
            configuredControls: {
                 "control-motion-security": { isActive: true, params: { "heure_debut_surveillance": "18:00", "heure_fin_surveillance": "06:00", "surveillance_active": true }, sensorMappings: {"motion_detected": "sensor-maint-motion"} }
            }
        }
      ], sensors: [
         { id: "sensor-maint-motion", name: "Détecteur Mouvement Atelier (nuit)", typeModel: "Détecteur de Mouvement SecuMotion X1", scope: "zone", status: "green", provides: ["motion_detected"], piServerId: "machine-maint-secu" }
      ]}
    ]
  },
  {
    id: "site-agrostock-tunisie",
    name: "AgroStock Tunisie",
    location: "Port de Radès, Tunisie",
    icon: Warehouse,
    zones: [], 
    subSites: [
      {
        id: "site-entrepot-viandes", name: "Entrepôt Viandes", location: "AgroStock - Section Viandes", isConceptualSubSite: true, icon: Beef,
        zones: [
          { id: "zone-viande-chf-bovin", name: "Chambre Froide Bovins (-2°C)", machines: [
            { id: "machine-chf-bovin1", name: "Unité Réfrig. Bovin 1", type: "Chambre Froide", status: "green", availableSensors: [{id: "s-bovin1-temp", name: "Temp Bovin 1", provides:["temp"]}]},
            { id: "machine-viande-bovin-secu", name: "Hub Sécurité CHF Bovins", type: "Hub Sécurité", status: "green", 
                availableSensors: [],
                configuredControls: {
                    "control-smoke-alarm": { isActive: true, params: {}, sensorMappings: {"smoke_detected": "sensor-viande-bovin-fumee"} }
                }
            }
          ], sensors: [
            { id: "sensor-viande-bovin-fumee", name: "Détecteur Fumée CHF Bovins", typeModel: "Détecteur de Fumée FireAlert Z3", scope: "zone", status: "green", provides: ["smoke_detected"], piServerId: "machine-viande-bovin-secu" }
          ]},
          { id: "zone-viande-chf-volaille", name: "Chambre Congélation Volailles (-18°C)", machines: [
            { id: "machine-chf-volaille1", name: "Unité Congél. Volaille 1", type: "Congélateur", status: "green", availableSensors: [{id: "s-volaille1-temp", name: "Temp Volaille 1", provides:["temp"]}] }
          ]}
        ]
      },
      {
        id: "site-entrepot-dattes", name: "Entrepôt Dattes", location: "AgroStock - Section Dattes", isConceptualSubSite: true, icon: CalendarDays,
        zones: [
          { id: "zone-dattes-stock", name: "Stockage Dattes (Ventilé)", machines: [
            { 
                id: "machine-dattes-clim-01", name: "Climatiseur Dattes Unité 1", type: "Climatiseur", status: "green",
                availableSensors: [{ id: "s-dattes-clim-1-tempout", name: "Temp. Sortie Clim 1", provides: ["temp_out", "temp"] }, { id: "s-dattes-clim-1-power", name: "Conso. Clim 1", provides: ["power_ac", "power"] }],
                configuredControls: { "control-ac-agro": { isActive: true, params: { "temp_cible_sortie": 12, "humidity_min_zone": 55, "humidity_max_zone": 65, "power_max_ac": 1500 }, sensorMappings: {"temp_out": "s-dattes-clim-1-tempout", "humidity_zone": "sensor-dattes-stock-temphum", "power_ac": "s-dattes-clim-1-power"} } }
            },
            { 
                id: "machine-dattes-clim-02", name: "Climatiseur Dattes Unité 2", type: "Climatiseur", status: "green",
                availableSensors: [{ id: "s-dattes-clim-2-tempout", name: "Temp. Sortie Clim 2", provides: ["temp_out", "temp"] }, { id: "s-dattes-clim-2-power", name: "Conso. Clim 2", provides: ["power_ac", "power"] }],
                configuredControls: { "control-ac-agro": { isActive: true, params: { "temp_cible_sortie": 12, "humidity_min_zone": 55, "humidity_max_zone": 65, "power_max_ac": 1500 }, sensorMappings: {"temp_out": "s-dattes-clim-2-tempout", "humidity_zone": "sensor-dattes-stock-temphum", "power_ac": "s-dattes-clim-2-power"} } }
            },
            { 
                id: "machine-dattes-clim-03", name: "Climatiseur Dattes Unité 3", type: "Climatiseur", status: "green",
                availableSensors: [{ id: "s-dattes-clim-3-tempout", name: "Temp. Sortie Clim 3", provides: ["temp_out", "temp"] }, { id: "s-dattes-clim-3-power", name: "Conso. Clim 3", provides: ["power_ac", "power"] }],
                configuredControls: { "control-ac-agro": { isActive: true, params: { "temp_cible_sortie": 12, "humidity_min_zone": 55, "humidity_max_zone": 65, "power_max_ac": 1500 }, sensorMappings: {"temp_out": "s-dattes-clim-3-tempout", "humidity_zone": "sensor-dattes-stock-temphum", "power_ac": "s-dattes-clim-3-power"} } }
            },
            { 
                id: "machine-dattes-clim-04", name: "Climatiseur Dattes Unité 4", type: "Climatiseur", status: "green",
                availableSensors: [{ id: "s-dattes-clim-4-tempout", name: "Temp. Sortie Clim 4", provides: ["temp_out", "temp"] }, { id: "s-dattes-clim-4-power", name: "Conso. Clim 4", provides: ["power_ac", "power"] }],
                configuredControls: { "control-ac-agro": { isActive: true, params: { "temp_cible_sortie": 12, "humidity_min_zone": 55, "humidity_max_zone": 65, "power_max_ac": 1500 }, sensorMappings: {"temp_out": "s-dattes-clim-4-tempout", "humidity_zone": "sensor-dattes-stock-temphum", "power_ac": "s-dattes-clim-4-power"} } }
            },
            { 
                id: "machine-dattes-clim-05", name: "Climatiseur Dattes Unité 5", type: "Climatiseur", status: "orange",
                activeControlInAlert: {
                  controlId: "control-ac-agro", controlName: "Contrôle Climatiseur Agroalimentaire",
                  alertDetails: "Humidité ambiante dattes à 70%. Seuil max: 65%. Risque de condensation et perte de qualité. (Ext: 40°C)", status: "orange",
                  currentValues: { "temp_out": { value: 12.5, unit: "°C" }, "humidity_zone": { value: 70, unit: "%" }, "power_ac": { value: 1300, unit: "W" } },
                  thresholds: { "temp_cible_sortie": 12, "humidity_min_zone": 55, "humidity_max_zone": 65, "power_max_ac": 1500 },
                  controlDescription: "Vérifie le bon fonctionnement du climatiseur, la température de sortie, l'humidité ambiante et la consommation.",
                  historicalData: [{ name: 'T-4h', value: 60 }, { name: 'T-2h', value: 68 }, { name: 'Actuel', value: 70 }],
                  relevantSensorVariable: 'humidity_zone', checklist: agroChecklistHumidityCold
                },
                availableSensors: [{ id: "s-dattes-clim-5-tempout", name: "Temp. Sortie Clim 5", provides: ["temp_out", "temp"] }, { id: "s-dattes-clim-5-power", name: "Conso. Clim 5", provides: ["power_ac", "power"] }],
                configuredControls: { "control-ac-agro": { isActive: true, params: { "temp_cible_sortie": 12, "humidity_min_zone": 55, "humidity_max_zone": 65, "power_max_ac": 1500 }, sensorMappings: {"temp_out": "s-dattes-clim-5-tempout", "humidity_zone": "sensor-dattes-stock-temphum", "power_ac": "s-dattes-clim-5-power"} } },
                eventLog: [
                  {id: "evt-clim5-1", timestamp: new Date(Date.now() - 1*60*60*1000).toISOString(), type: "ALERT_TRIGGERED", severity: "WARNING", message: "Humidité dattes Clim 5 à 70% (max 65%). Ext: 40°C", controlId: "control-ac-agro"},
                ]
            },
            { 
                id: "machine-dattes-clim-06", name: "Climatiseur Dattes Unité 6", type: "Climatiseur", status: "red",
                 activeControlInAlert: {
                  controlId: "control-ac-agro", controlName: "Contrôle Climatiseur Agroalimentaire",
                  alertDetails: "Température de sortie clim. à 18°C. Cible: 12°C. Climatiseur inefficace, risque produit. (Ext: 40°C)", status: "red",
                  currentValues: { "temp_out": { value: 18, unit: "°C" }, "humidity_zone": { value: 60, unit: "%" }, "power_ac": { value: 1650, unit: "W" } }, // Power slightly high too
                  thresholds: { "temp_cible_sortie": 12, "humidity_min_zone": 55, "humidity_max_zone": 65, "power_max_ac": 1500 },
                  controlDescription: "Vérifie le bon fonctionnement du climatiseur, la température de sortie, l'humidité ambiante et la consommation.",
                  historicalData: [{ name: 'T-4h', value: 13 }, { name: 'T-2h', value: 16 }, { name: 'Actuel', value: 18 }],
                  relevantSensorVariable: 'temp_out', checklist: agroChecklistHumidityCold
                },
                availableSensors: [{ id: "s-dattes-clim-6-tempout", name: "Temp. Sortie Clim 6", provides: ["temp_out", "temp"] }, { id: "s-dattes-clim-6-power", name: "Conso. Clim 6", provides: ["power_ac", "power"] }],
                configuredControls: { "control-ac-agro": { isActive: true, params: { "temp_cible_sortie": 12, "humidity_min_zone": 55, "humidity_max_zone": 65, "power_max_ac": 1500 }, sensorMappings: {"temp_out": "s-dattes-clim-6-tempout", "humidity_zone": "sensor-dattes-stock-temphum", "power_ac": "s-dattes-clim-6-power"} } },
                 eventLog: [
                  {id: "evt-clim6-1", timestamp: new Date(Date.now() - 30*60*1000).toISOString(), type: "ALERT_TRIGGERED", severity: "CRITICAL", message: "Temp. sortie Clim 6 à 18°C (cible 12°C). Ext: 40°C", controlId: "control-ac-agro"},
                  {id: "evt-clim6-2", timestamp: new Date(Date.now() - 5*24*60*60*1000).toISOString(), type: "MAINTENANCE_LOGGED", severity: "INFO", message: "Nettoyage filtre Clim 6."},
                ]
            },
          ], sensors: [
            { id: "sensor-dattes-stock-temphum", name: "Ambiance Stockage Dattes", typeModel: "Sonde Ambiante THL v2.1", scope: "zone", status: "orange", provides: ["temp", "humidity", "humidity_zone"] } // status orange due to AC issues
          ]},
          { id: "zone-dattes-conditionnement", name: "Salle de Conditionnement Dattes", machines: [
            { id: "machine-dattes-emballeuse", name: "Emballeuse Dattes D1", type: "Equipement de Production", status: "green", availableSensors: [{id:"s-dattes-emballeuse-compteur", name: "Compteur Emballeuse", provides: ["count"]}] }
          ]}
        ]
      },
      {
        id: "site-entrepot-fruitsleg", name: "Entrepôt Fruits & Légumes", location: "AgroStock - Section F&L", isConceptualSubSite: true, icon: Apple,
        zones: [
          { id: "zone-fl-reception", name: "Quai de Réception F&L", machines: [{id: "machine-fl-reception-secu", name: "Hub Sécurité Quai F&L", type: "Hub Sécurité", status: "green", 
            availableSensors: [],
            configuredControls: {
                "control-motion-security": { isActive: true, params: { "heure_debut_surveillance": "19:00", "heure_fin_surveillance": "05:00", "surveillance_active": true }, sensorMappings: {"motion_detected": "sensor-fl-reception-motion"} }
            }}], 
            sensors: [
             { id: "sensor-fl-reception-motion", name: "Détecteur Mouvement Quai F&L (nuit)", typeModel: "Détecteur de Mouvement SecuMotion X1", scope: "zone", status: "green", provides: ["motion_detected"], piServerId: "machine-fl-reception-secu" }
          ]},
          { 
            id: "zone-fl-chf-tropicaux", name: "Chambre Froide Fruits Tropicaux (+8°C)", machines: [
              { 
                id: "machine-chf-tropic1", name: "Réfrigérateur Tropicaux T1", type: "Chambre Froide", status: "red",
                activeControlInAlert: {
                  controlId: "control-001", controlName: "Contrôle Température Frigo",
                  alertDetails: "Température à 12°C. Seuil max: +10°C.", status: "red",
                  currentValues: { "temp": { value: 12, unit: "°C" } }, thresholds: { "seuil_min": 7, "seuil_max": 10 },
                  controlDescription: "Surveille la température de la chambre froide pour fruits tropicaux.",
                  historicalData: [{ name: 'T-4h', value: 9 }, { name: 'T-2h', value: 10 }, { name: 'Actuel', value: 12 }],
                  relevantSensorVariable: 'temp', checklist: restaurantChecklistTempFrigo 
                },
                availableSensors: [{ id: "sensor-tropic1-temp", name: "Sonde Temp. Tropicaux T1", provides: ["temp"] }],
                configuredControls: { "control-001": { isActive: true, params: { "seuil_min": 7, "seuil_max": 10 }, sensorMappings: {"temp": "sensor-tropic1-temp"} } }
              }
          ]}
        ]
      }
    ]
  },
  {
    id: "site-ferme-provence",
    name: "Ferme de Provence",
    location: "Valensole, Alpes-de-Haute-Provence, France",
    icon: Tractor,
    zones: [
      { 
        id: "zone-ferme-champs-lavande", name: "Champs de Lavande", icon: Sprout, machines: [
          { id: "machine-ferme-irrigation-lavande", name: "Système d'Irrigation Lavande IL01", type: "Système d'Irrigation", status: "orange", icon: SprayCan,
            activeControlInAlert: {
              controlId: "control-soil-moisture", controlName: "Contrôle Humidité du Sol (Irrigation)",
              alertDetails: "Humidité du sol pour lavande à 25%. Seuil Min: 30%. Irrigation nécessaire.", status: "orange",
              currentValues: { "soil_moisture_percent": { value: 25, unit: "%" } }, thresholds: { "seuil_min_humidite_sol": 30 },
              controlDescription: "Déclenche une alerte si l'humidité du sol est trop basse.",
              checklist: farmChecklistSoilMoisture
            },
            availableSensors: [{id: "s-ferme-irrigation-lavande-status", name: "Etat Irrigation Lavande", provides:["status"]}]
          }
        ], 
        sensors: [
          { id: "sensor-ferme-sol-lavande1", name: "Sonde Humidité Sol - Lavande P1", typeModel: "Sonde Humidité Sol AgroSense H1", scope: "zone", status: "orange", provides: ["soil_moisture_percent"] }
        ]
      },
      { 
        id: "zone-ferme-serres-legumes", name: "Serres Légumes (Tomates, Poivrons)", icon: Apple, machines: [
          { id: "machine-ferme-ventilation-serre1", name: "Ventilation Serre S1", type: "Ventilation Serre", status: "green", availableSensors:[{id: "s-vent-serre1-speed", name: "Vitesse Vent. Serre 1", provides:["speed"]}] },
          { id: "machine-ferme-chauffage-serre1", name: "Chauffage Serre S1", type: "Chauffage Serre", status: "green", 
              availableSensors:[{id: "s-chauf-serre1-power", name: "Puissance Chauf. Serre 1", provides:["power"]}, {id: "s-chauf-serre1-temp", name: "Temp. Chauf. Serre 1", provides:["temp_enclos"]}],
              configuredControls: {
                  "control-animal-enclosure-temp": {isActive: true, params: { "temp_min_enclos": 15, "temp_max_enclos": 30 }, sensorMappings: {"temp_enclos": "s-chauf-serre1-temp"} }
              }
          }
        ], 
        sensors: [
          { id: "sensor-ferme-ambiance-serre1", name: "Ambiance Serre S1 (Temp/Hum)", typeModel: "Sonde Ambiante THL v2.1", scope: "zone", status: "green", provides: ["temp", "humidity", "temp_enclos"] }
        ]
      },
      { 
        id: "zone-ferme-bergerie-moutons", name: "Bergerie Moutons", icon: PawPrint, machines: [
          { id: "machine-ferme-ventilation-bergerie", name: "Ventilation Bergerie B1", type: "Ventilation Enclos", status: "green", 
            availableSensors:[{id: "s-vent-bergerie-speed", name: "Vitesse Vent. Bergerie B1", provides:["speed"]}, {id: "s-vent-bergerie-temp", name: "Temp. Vent. Bergerie B1", provides:["temp_enclos"]}],
            configuredControls: {
                 "control-animal-enclosure-temp": {isActive: true, params: { "temp_min_enclos": 10, "temp_max_enclos": 28 }, sensorMappings: {"temp_enclos": "s-vent-bergerie-temp"} }
            }
          },
          { id: "machine-ferme-abreuvoir-moutons", name: "Abreuvoir Automatique Moutons AM1", type: "Abreuvoir Automatisé", status: "red",
             activeControlInAlert: {
              controlId: "control-water-level", controlName: "Contrôle Niveau Eau Abreuvoir",
              alertDetails: "Niveau d'eau abreuvoir moutons bas (10%). Seuil Min: 20%. Remplissage requis.", status: "red",
              currentValues: { "water_level_percent": { value: 10, unit: "%" } }, thresholds: { "seuil_min_niveau_eau": 20 },
              controlDescription: "Alerte si le niveau d'eau est trop bas."
            },
            availableSensors: [{id: "s-ferme-abreuvoir-niveau", name: "Niveau Eau Abreuvoir Moutons", provides:["water_level_percent"]}]
          }
        ], 
        sensors: [
          { id: "sensor-ferme-temp-bergerie", name: "Sonde Température Bergerie", typeModel: "Sonde Température Multi-Usage T100", scope: "zone", status: "green", provides: ["temp", "temp_enclos"] }
        ]
      },
      { 
        id: "zone-ferme-hangar-materiel", name: "Hangar Matériel Agricole", icon: Warehouse, machines: [
          { id: "machine-ferme-secu-hangar", name: "Hub Sécurité Ferme", type: "Hub Sécurité", status: "green", 
            availableSensors: [],
            configuredControls: {
                "control-motion-security": { isActive: true, params: { "heure_debut_surveillance": "21:00", "heure_fin_surveillance": "06:00", "surveillance_active": true }, sensorMappings: {"motion_detected": "sensor-ferme-motion-hangar"} },
                "control-smoke-alarm": { isActive: true, params: {}, sensorMappings: {"smoke_detected": "sensor-ferme-fumee-hangar"} }
            }
          }
        ], 
        sensors: [
          { id: "sensor-ferme-motion-hangar", name: "Détecteur Mouvement Hangar", typeModel: "Détecteur de Mouvement SecuMotion X1", scope: "zone", status: "green", provides: ["motion_detected"], piServerId: "machine-ferme-secu-hangar"},
          { id: "sensor-ferme-fumee-hangar", name: "Détecteur Fumée Hangar", typeModel: "Détecteur de Fumée FireAlert Z3", scope: "zone", status: "green", provides: ["smoke_detected"], piServerId: "machine-ferme-secu-hangar"}
        ]
      }
    ]
  },
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
            type: "PC", 
            status: "green",
            icon: Server,
            availableSensors: [ 
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
        sensors: [ 
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
  (zone.sensors || []).forEach(s => {
    const sensorAlertStatus = s.data?.activeControlInAlert?.status;
    if (sensorAlertStatus === 'red' || s.status === 'red') hasRed = true;
    else if (sensorAlertStatus === 'orange' || s.status === 'orange') hasOrange = true;
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
    if (type.toLowerCase().includes("frigo") || type.toLowerCase().includes("congélateur") || type.toLowerCase().includes("chambre froide") || type.toLowerCase().includes("vitrine réfrigérée")) return Snowflake;
    if (type.toLowerCase().includes("four")) return Flame; 
    if (type.toLowerCase().includes("électrique") || type.toLowerCase().includes("elec")) return Zap;
    if (type.toLowerCase().includes("compresseur") || type.toLowerCase().includes("pompe") || type.toLowerCase().includes("hvac") || type.toLowerCase().includes("ventilation")) return Wind;
    if (type.toLowerCase().includes("serveur") || type.toLowerCase().includes("pc") || type.toLowerCase().includes("pi") || type.toLowerCase().includes("hub sécurité")) return Server;
    if (type.toLowerCase().includes("camion")) return Truck;
    if (type.toLowerCase().includes("tracteur")) return Tractor;
    if (type.toLowerCase().includes("irrigation")) return SprayCan;
    if (type.toLowerCase().includes("abreuvoir")) return Droplets;
    if (type.toLowerCase().includes("bergerie") || type.toLowerCase().includes("enclos")) return PawPrint;
    if (type.toLowerCase().includes("serre")) return Apple;
    if (type.toLowerCase().includes("climatiseur") || type.toLowerCase().includes("unité de climatisation")) return Snowflake;
    return HardDrive; 
};

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
