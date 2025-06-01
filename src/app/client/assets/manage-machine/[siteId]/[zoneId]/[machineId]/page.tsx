
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link"; 
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { DUMMY_CLIENT_SITES_DATA, type Site, type Zone as FullZoneType, type Machine as FullMachineType, type Sensor as FullSensorType, type Status, type ConfiguredControl, type ControlParameter as SiteControlParameter, type ActiveControlInAlert, type HistoricalDataPoint, type ChecklistItem, getStatusIcon as getMachineStatusIcon, getStatusText as getMachineStatusText, getMachineIcon, securityChecklistMotion, securityChecklistSmoke, farmChecklistSoilMoisture, farmChecklistAnimalEnclosure, agroChecklistHumidityCold } from "@/lib/client-data.tsx"; 
import { ChevronLeft, Save, Settings2, HardDrive, Server, Thermometer, Zap, Wind, LineChart as LineChartIcon, FileText, ListChecks, AlertTriangle, CheckCircle2, Info, ChevronRight, Move, Flame, Droplets, RadioTower, Edit3, ChevronDown, Gauge, Download, CalendarDays, Snowflake } from "lucide-react"; 
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from "recharts";


interface AdminControl {
  id: string;
  nomDuControle: string;
  typesDeMachinesConcernees: string[];
  typesDeCapteursNecessaires: string[]; 
  variablesUtilisees: string[]; 
  formuleDeCalcul?: string;
  formuleDeVerification: string;
  description: string;
  expectedParams?: SiteControlParameter[]; 
  checklist?: ChecklistItem[]; 
}

const DUMMY_ADMIN_CONTROLS_FOR_MACHINE_PAGE: AdminControl[] = [
  {
    id: "control-001",
    nomDuControle: "Contrôle Température Frigo/Congélateur",
    typesDeMachinesConcernees: ["Frigo", "Congélateur", "Vitrine Réfrigérée", "Chambre Froide"],
    typesDeCapteursNecessaires: ["Température"],
    variablesUtilisees: ["temp"],
    formuleDeVerification: "sensor['temp'].value >= machine.params['seuil_min'] && sensor['temp'].value <= machine.params['seuil_max']",
    description: "Vérifie que la température reste dans les seuils définis.",
    expectedParams: [
      { id: 'seuil_min', label: 'Seuil Température Minimum (°C)', type: 'number', defaultValue: 0 },
      { id: 'seuil_max', label: 'Seuil Température Maximum (°C)', type: 'number', defaultValue: 5 },
    ],
    checklist: [
        { id: 'chk-frigo-1', label: "Vérifier que la porte est bien fermée et étanche." },
        { id: 'chk-frigo-2', label: "Nettoyer le condenseur de toute poussière ou obstruction." },
        { id: 'chk-frigo-3', label: "S'assurer que la ventilation autour n'est pas bloquée." },
    ]
  },
  {
    id: "control-temp-four",
    nomDuControle: "Contrôle Température Four Professionnel",
    typesDeMachinesConcernees: ["Four Professionnel"],
    typesDeCapteursNecessaires: ["Température Four"],
    variablesUtilisees: ["temp_four"],
    formuleDeVerification: "sensor['temp_four'].value <= machine.params['temp_max_four'] && sensor['temp_four'].value >= machine.params['temp_min_cuisson']",
    description: "Surveille la température du four pour une cuisson optimale et la sécurité.",
    expectedParams: [
      { id: 'temp_min_cuisson', label: 'Température Minimale Cuisson (°C)', type: 'number', defaultValue: 160 },
      { id: 'temp_max_four', label: 'Température Maximale Four (°C)', type: 'number', defaultValue: 250 },
    ],
    checklist: [ {id: 'chk-four-1', label: "Vérifier l'étanchéité de la porte du four."}, {id: 'chk-four-2', label: "Nettoyer régulièrement l'intérieur du four."}]
  },
  {
    id: "control-temp-camion",
    nomDuControle: "Contrôle Température Camion Réfrigéré",
    typesDeMachinesConcernees: ["Camion Réfrigéré"],
    typesDeCapteursNecessaires: ["Température Caisson"],
    variablesUtilisees: ["temp_caisson"],
    formuleDeVerification: "sensor['temp_caisson'].value <= machine.params['temp_max']",
    description: "Surveille la température du caisson réfrigéré du camion.",
    expectedParams: [ { id: 'temp_max', label: 'Température Maximale Caisson (°C)', type: 'number', defaultValue: 4 } ],
    checklist: [{id: 'chk-camion-1', label: "Vérifier la fermeture des portes du caisson avant départ."}, {id: 'chk-camion-2', label: "Contrôler le fonctionnement du groupe froid régulièrement."}]
  },
  {
    id: "control-002",
    nomDuControle: "Contrôle Consommation Électrique Moteur/Equipement",
    typesDeMachinesConcernees: ["Moteur Principal", "Pompe Hydraulique", "Compresseur", "HVAC", "Equipement de Production", "Climatiseur", "Unité de Climatisation"],
    typesDeCapteursNecessaires: ["Tension", "Courant"],
    variablesUtilisees: ["tension", "courant", "conso"], 
    formuleDeCalcul: "conso = sensor['tension'].value * sensor['courant'].value",
    formuleDeVerification: "conso <= machine.params['seuil_max_conso']",
    description: "Calcule et vérifie la consommation électrique.",
    expectedParams: [ { id: 'seuil_max_conso', label: 'Seuil Consommation Max (W)', type: 'number', defaultValue: 2000 } ],
    checklist: [
        { id: 'chk-moteur-1', label: "Inspecter visuellement pour des signes de surchauffe ou de dommage." },
        { id: 'chk-moteur-2', label: "Vérifier que les connexions électriques sont bien serrées et non corrodées." },
    ]
  },
  {
    id: "control-003",
    nomDuControle: "Alerte Pression Basse Huile Compresseur",
    typesDeMachinesConcernees: ["Compresseur"],
    typesDeCapteursNecessaires: ["Pression Huile"],
    variablesUtilisees: ["pression_huile"],
    formuleDeVerification: "sensor['pression_huile'].value >= machine.params['seuil_min_pression']",
    description: "Alerte si la pression d'huile du compresseur est trop basse.",
    expectedParams: [ { id: 'seuil_min_pression', label: 'Seuil Pression Huile Minimum (bar)', type: 'number', defaultValue: 0.5 } ],
    checklist: [
        { id: 'chk-comp-1', label: "Vérifier le niveau d'huile du compresseur." },
        { id: 'chk-comp-2', label: "Rechercher des fuites d'huile potentielles." },
    ]
  },
   {
    id: "control-srv-temp",
    nomDuControle: "Surveillance Température Serveur/PC",
    typesDeMachinesConcernees: ["Serveur", "PC", "Hub Sécurité"], 
    typesDeCapteursNecessaires: ["Température CPU/Système"], 
    variablesUtilisees: ["temp_srv"], 
    formuleDeVerification: "sensor['temp_srv'].value <= machine.params['seuil_max_temp_srv']",
    description: "Surveille la température interne pour éviter la surchauffe.",
    expectedParams: [ { id: 'seuil_max_temp_srv', label: 'Seuil Température Max (°C)', type: 'number', defaultValue: 75 } ],
    checklist: [
        { id: 'chk-srv-1', label: "S'assurer que les ventilateurs fonctionnent correctement." },
        { id: 'chk-srv-2', label: "Vérifier que les entrées et sorties d'air ne sont pas obstruées." },
    ]
  },
  {
    id: "control-srv-cpu",
    nomDuControle: "Surveillance Utilisation CPU",
    typesDeMachinesConcernees: ["Serveur", "PC", "Hub Sécurité"],
    typesDeCapteursNecessaires: ["Utilisation CPU"],
    variablesUtilisees: ["cpu_usage_percent"],
    formuleDeVerification: "sensor['cpu_usage_percent'].value <= machine.params['seuil_max_cpu']",
    description: "Alerte si l'utilisation du CPU dépasse un seuil critique.",
    expectedParams: [{ id: 'seuil_max_cpu', label: 'Seuil Utilisation Max CPU (%)', type: 'number', defaultValue: 90 }],
    checklist: [ { id: 'chk-cpu-1', label: "Identifier les processus consommant le plus de CPU." } ]
  },
  {
    id: "control-srv-mem",
    nomDuControle: "Surveillance Utilisation Mémoire",
    typesDeMachinesConcernees: ["Serveur", "PC", "Hub Sécurité"],
    typesDeCapteursNecessaires: ["Utilisation Mémoire"],
    variablesUtilisees: ["mem_usage_percent"],
    formuleDeVerification: "sensor['mem_usage_percent'].value <= machine.params['seuil_max_mem']",
    description: "Alerte si l'utilisation de la RAM dépasse un seuil critique.",
    expectedParams: [{ id: 'seuil_max_mem', label: 'Seuil Utilisation Max Mémoire (%)', type: 'number', defaultValue: 85 }],
    checklist: [ { id: 'chk-mem-1', label: "Identifier les processus consommant le plus de mémoire." } ]
  },
  {
    id: "control-srv-disk",
    nomDuControle: "Surveillance Espace Disque",
    typesDeMachinesConcernees: ["Serveur", "PC", "Hub Sécurité"],
    typesDeCapteursNecessaires: ["Espace Disque Libre"],
    variablesUtilisees: ["disk_free_gb"],
    formuleDeVerification: "sensor['disk_free_gb'].value >= machine.params['seuil_min_disk_gb']",
    description: "Alerte si l'espace disque libre tombe sous un seuil critique.",
    expectedParams: [{ id: 'seuil_min_disk_gb', label: 'Seuil Espace Disque Libre Minimum (GB)', type: 'number', defaultValue: 20 }],
    checklist: [ { id: 'chk-disk-1', label: "Supprimer les fichiers temporaires et inutiles." } ]
  },
  {
    id: "control-srv-latency",
    nomDuControle: "Surveillance Latence Réseau",
    typesDeMachinesConcernees: ["Serveur", "PC", "Hub Sécurité"],
    typesDeCapteursNecessaires: ["Latence Ping"],
    variablesUtilisees: ["ping_latency_ms"],
    formuleDeVerification: "sensor['ping_latency_ms'].value <= machine.params['seuil_max_latency_ms']",
    description: "Alerte si la latence réseau (ping) dépasse un seuil.",
    expectedParams: [{ id: 'seuil_max_latency_ms', label: 'Seuil Latence Max (ms)', type: 'number', defaultValue: 100 }],
    checklist: [ { id: 'chk-lat-1', label: "Vérifier la connectivité réseau physique et la charge du réseau." } ]
  },
  {
    id: "control-motion-security",
    nomDuControle: "Détection de Mouvement (Sécurité Horodatée)",
    typesDeMachinesConcernees: ["Hub Sécurité", "Générique"], 
    typesDeCapteursNecessaires: ["Mouvement"],
    variablesUtilisees: ["motion_detected"], 
    formuleDeVerification: "sensor['motion_detected'].value === true && (machine.params['surveillance_active'] === true)", 
    description: "Alerte si un mouvement est détecté pendant les heures de surveillance.",
    expectedParams: [
      { id: 'heure_debut_surveillance', label: 'Début Surveillance (HH:MM)', type: 'string', defaultValue: '22:00' },
      { id: 'heure_fin_surveillance', label: 'Fin Surveillance (HH:MM)', type: 'string', defaultValue: '06:00' },
      { id: 'surveillance_active', label: 'Surveillance Active (Actuellement)', type: 'boolean', defaultValue: true }, 
    ],
    checklist: securityChecklistMotion
  },
  {
    id: "control-smoke-alarm",
    nomDuControle: "Alarme Incendie (Détection Fumée)",
    typesDeMachinesConcernees: ["Hub Sécurité", "Générique"], 
    typesDeCapteursNecessaires: ["Fumée"],
    variablesUtilisees: ["smoke_detected"],
    formuleDeVerification: "sensor['smoke_detected'].value === true",
    description: "Alerte immédiate si de la fumée est détectée.",
    expectedParams: [], 
    checklist: securityChecklistSmoke
  },
  {
    id: "control-soil-moisture",
    nomDuControle: "Contrôle Humidité du Sol (Irrigation)",
    typesDeMachinesConcernees: ["Système d'Irrigation"],
    typesDeCapteursNecessaires: ["Humidité du Sol"],
    variablesUtilisees: ["soil_moisture_percent"],
    formuleDeVerification: "sensor['soil_moisture_percent'].value < machine.params['seuil_min_humidite_sol']",
    description: "Alerte si l'humidité du sol est trop basse.",
    expectedParams: [{ id: 'seuil_min_humidite_sol', label: 'Seuil Humidité Sol Min (%)', type: 'number', defaultValue: 30 }],
    checklist: farmChecklistSoilMoisture
  },
  {
    id: "control-animal-enclosure-temp",
    nomDuControle: "Contrôle Température Enclos/Serre",
    typesDeMachinesConcernees: ["Ventilation Enclos", "Chauffage Enclos", "Ventilation Serre", "Chauffage Serre"],
    typesDeCapteursNecessaires: ["Température Ambiante"], 
    variablesUtilisees: ["temp_enclos"],
    formuleDeVerification: "sensor['temp_enclos'].value < machine.params['temp_min_enclos'] || sensor['temp_enclos'].value > machine.params['temp_max_enclos']",
    description: "Maintient la température de l'enclos/serre dans une plage optimale.",
    expectedParams: [
      { id: 'temp_min_enclos', label: 'Temp. Min (°C)', type: 'number', defaultValue: 10 },
      { id: 'temp_max_enclos', label: 'Temp. Max (°C)', type: 'number', defaultValue: 25 }
    ],
    checklist: farmChecklistAnimalEnclosure
  },
  {
    id: "control-water-level",
    nomDuControle: "Contrôle Niveau Eau (Abreuvoir/Réservoir)",
    typesDeMachinesConcernees: ["Abreuvoir Automatisé", "Réservoir"],
    typesDeCapteursNecessaires: ["Niveau Eau"],
    variablesUtilisees: ["water_level_percent"],
    formuleDeVerification: "sensor['water_level_percent'].value < machine.params['seuil_min_niveau_eau']",
    description: "Alerte si le niveau d'eau est trop bas.",
    expectedParams: [{ id: 'seuil_min_niveau_eau', label: 'Seuil Niveau Eau Min (%)', type: 'number', defaultValue: 20 }],
    checklist: [{id: 'chk-water-1', label: "Vérifier l'absence de fuites."}, {id: 'chk-water-2', label: "Nettoyer le capteur de niveau si accessible."}]
  },
  {
    id: "control-ac-agro",
    nomDuControle: "Contrôle Climatiseur Agroalimentaire",
    typesDeMachinesConcernees: ["Climatiseur", "Unité de Climatisation"],
    typesDeCapteursNecessaires: ["Température Sortie Air", "Humidité Ambiante Zone", "Consommation Électrique"],
    variablesUtilisees: ["temp_out", "humidity_zone", "power_ac"],
    formuleDeVerification: "(sensor['temp_out'].value <= machine.params['temp_cible_sortie'] + 2) && (sensor['humidity_zone'].value >= machine.params['humidity_min_zone'] && sensor['humidity_zone'].value <= machine.params['humidity_max_zone']) && (sensor['power_ac'].value <= machine.params['power_max_ac'])",
    description: "Vérifie le bon fonctionnement du climatiseur pour préserver la qualité des produits agroalimentaires.",
    expectedParams: [
      { id: 'temp_cible_sortie', label: 'Température Cible Sortie Air (°C)', type: 'number', defaultValue: 12 },
      { id: 'humidity_min_zone', label: 'Humidité Ambiante Min. Zone (%)', type: 'number', defaultValue: 55 },
      { id: 'humidity_max_zone', label: 'Humidité Ambiante Max. Zone (%)', type: 'number', defaultValue: 65 },
      { id: 'power_max_ac', label: 'Consommation Électrique Max. (W)', type: 'number', defaultValue: 1500 },
    ],
    checklist: agroChecklistHumidityCold,
  }
];

interface MachinePageData {
    site?: Site;
    zone?: FullZoneType;
    machine?: FullMachineType;
}

function findMachineHierarchy(siteIdPath: string, zoneIdPath: string, machineIdPath: string): MachinePageData {
    let targetSite: Site | undefined;
    const findInSitesArray = (sitesArr: Site[], sId: string): Site | undefined => {
        for (const s of sitesArr) {
            if (s.id === sId) return s;
            if (s.subSites) {
                const foundInSub = findInSitesArray(s.subSites, sId);
                if (foundInSub) return foundInSub;
            }
        }
        return undefined;
    };
    targetSite = findInSitesArray(DUMMY_CLIENT_SITES_DATA, siteIdPath);
    if (!targetSite) return {};

    let targetZone: FullZoneType | undefined;
    function findZoneRecursive(zones: FullZoneType[], zId: string): FullZoneType | undefined {
        for (const z of zones) {
            if (z.id === zId) return z;
            if (z.subZones) {
                const foundInSub = findZoneRecursive(z.subZones, zId);
                if (foundInSub) return foundInSub;
            }
        }
        return undefined;
    }
    targetZone = findZoneRecursive(targetSite.zones, zoneIdPath);
    if (!targetZone) return { site: targetSite };

    const machine = targetZone.machines.find(m => m.id === machineIdPath);
    if (machine) {
        const augmentedMachine: FullMachineType = { ...machine };
        if (!augmentedMachine.availableSensors) { 
            const zoneSensors = targetZone?.sensors || [];
            const machineSpecificSensors = zoneSensors.filter(s => s.scope === 'machine' && s.affectedMachineIds?.includes(machine.id));
            const ambientZoneSensors = zoneSensors.filter(s => s.scope === 'zone');
            
            augmentedMachine.availableSensors = [
                ...machineSpecificSensors.map(s => ({id: s.id, name: s.name, provides: Array.isArray(s.provides) ? s.provides : []})),
                ...ambientZoneSensors.map(s => ({id: s.id, name: `${s.name} (Ambiant)`, provides: Array.isArray(s.provides) ? s.provides : []}))
            ];
             if (augmentedMachine.availableSensors.length === 0 && augmentedMachine.type !== 'PC' && augmentedMachine.type !== 'Hub Sécurité') { 
                 augmentedMachine.availableSensors = [{id: `${machine.id}-generic`, name: `Capteur générique pour ${machine.name}`, provides:['value']}];
             }
        }
         if (!augmentedMachine.configuredControls) {
            augmentedMachine.configuredControls = {}; 
        }
        
        if (augmentedMachine.activeControlInAlert && !augmentedMachine.activeControlInAlert.historicalData) {
            const currentValues = augmentedMachine.activeControlInAlert.currentValues;
            let baseValue = 70; 
            if (currentValues && Object.keys(currentValues).length > 0) {
                const firstKey = Object.keys(currentValues)[0];
                const val = currentValues[firstKey]?.value;
                if (typeof val === 'number') {
                    baseValue = val;
                } else if (typeof val === 'string') {
                    const parsedVal = parseFloat(val);
                    if (!isNaN(parsedVal)) baseValue = parsedVal;
                }
            }
            
            augmentedMachine.activeControlInAlert.historicalData = [
                { name: 'T-4', value: Math.random() * 10 + baseValue - 5 },
                { name: 'T-3', value: Math.random() * 10 + baseValue - 4 },
                { name: 'T-2', value: Math.random() * 10 + baseValue - 3 },
                { name: 'T-1', value: Math.random() * 10 + baseValue - 2 },
                { name: 'Maintenant', value: baseValue },
            ];
            augmentedMachine.activeControlInAlert.relevantSensorVariable = augmentedMachine.activeControlInAlert.relevantSensorVariable || Object.keys(currentValues || {})[0] || "Valeur Simulée";
        }
        return { site: targetSite, zone: targetZone, machine: augmentedMachine };
    }
    return { site: targetSite, zone: targetZone };
}

function getMachineIconDisplay(type: string): LucideIcon {
    if (type.toLowerCase().includes("frigo") || type.toLowerCase().includes("congélateur") || type.toLowerCase().includes("vitrine")) return Thermometer;
    if (type.toLowerCase().includes("four")) return Flame;
    if (type.toLowerCase().includes("électrique") || type.toLowerCase().includes("elec")) return Zap;
    if (type.toLowerCase().includes("compresseur") || type.toLowerCase().includes("pompe") || type.toLowerCase().includes("hvac") || type.toLowerCase().includes("ventilation")) return Wind;
    if (type.toLowerCase().includes("serveur") || type.toLowerCase().includes("pc") || type.toLowerCase().includes("hub sécurité")) return Server;
    if (type.toLowerCase().includes("camion")) return Truck;
    if (type.toLowerCase().includes("abreuvoir")) return Droplets;
    if (type.toLowerCase().includes("climatiseur") || type.toLowerCase().includes("unité de climatisation")) return Snowflake;
    return HardDrive;
};

export default function ManageMachinePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const siteId = params.siteId as string;
  const zoneId = params.zoneId as string;
  const machineId = params.machineId as string;

  const [pageData, setPageData] = useState<MachinePageData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [controlConfigs, setControlConfigs] = useState<Record<string, ConfiguredControl>>({});
  
  const [eventLogStartDate, setEventLogStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [eventLogEndDate, setEventLogEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!siteId || !zoneId || !machineId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    const foundData = findMachineHierarchy(siteId, zoneId, machineId);
    if (foundData.machine) {
      setPageData(foundData);
      const initialConfigs: Record<string, ConfiguredControl> = {};
      DUMMY_ADMIN_CONTROLS_FOR_MACHINE_PAGE.forEach(control => {
        const existingConfig = foundData.machine!.configuredControls?.[control.id];
        initialConfigs[control.id] = {
          isActive: existingConfig?.isActive || false,
          params: { ...(existingConfig?.params || {}) },
          sensorMappings: { ...(existingConfig?.sensorMappings || {}) },
        };
        control.expectedParams?.forEach(param => {
          if (initialConfigs[control.id].params[param.id] === undefined && param.defaultValue !== undefined) {
            initialConfigs[control.id].params[param.id] = param.defaultValue;
          }
        });
      });
      setControlConfigs(initialConfigs);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  }, [siteId, zoneId, machineId]);

  const handleControlActivationChange = (controlId: string, isActive: boolean) => {
    setControlConfigs(prev => ({
      ...prev,
      [controlId]: {
        ...(prev[controlId] || { params: {}, sensorMappings: {} }),
        isActive,
      },
    }));
  };

  const handleParamChange = (controlId: string, paramId: string, value: any, type: SiteControlParameter['type']) => {
    let processedValue = value;
    if (type === 'number') {
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) processedValue = '';
    } else if (type === 'boolean') {
      processedValue = value === 'true' || value === true;
    }
    setControlConfigs(prev => ({
      ...prev,
      [controlId]: {
        ...(prev[controlId]!),
        params: {
          ...(prev[controlId]!.params),
          [paramId]: processedValue,
        },
      },
    }));
  };

  const handleSensorMappingChange = (controlId: string, variableId: string, sensorInstanceId: string) => {
    setControlConfigs(prev => ({
      ...prev,
      [controlId]: {
        ...(prev[controlId]!),
        sensorMappings: {
          ...(prev[controlId]!.sensorMappings),
          [variableId]: sensorInstanceId === "__NONE__" ? "" : sensorInstanceId,
        },
      },
    }));
  };

  const handleSaveConfiguration = () => {
    console.log("Saving machine control configurations:", { machineId, controlConfigs });
    toast({
      title: "Configuration Sauvegardée",
      description: `Les configurations pour ${pageData.machine?.name} ont été sauvegardées (simulation).`,
    });
  };

  const handleExportEvents = () => {
    alert(`Exportation simulée des événements du ${eventLogStartDate} au ${eventLogEndDate} en format Excel.`);
  };

  const applicableAdminControls = useMemo(() => {
    if (!pageData.machine) return [];
    return DUMMY_ADMIN_CONTROLS_FOR_MACHINE_PAGE.filter(control =>
      control.typesDeMachinesConcernees.length === 0 || 
      control.typesDeMachinesConcernees.includes(pageData.machine!.type) ||
      control.typesDeMachinesConcernees.includes("Générique")
    );
  }, [pageData.machine]);

  const activeMachineControls = useMemo(() => {
    if (!pageData.machine) return [];
    return applicableAdminControls.filter(adminCtrl => controlConfigs[adminCtrl.id]?.isActive);
  }, [pageData.machine, applicableAdminControls, controlConfigs]);

  const machineSensors = useMemo(() => {
    if (!pageData.zone || !pageData.machine) return [];
    const allZoneSensors = pageData.zone.sensors || [];
    return allZoneSensors.filter(s => s.scope === 'machine' && s.affectedMachineIds?.includes(pageData.machine!.id));
  }, [pageData.zone, pageData.machine]);

  const ambientSensors = useMemo(() => {
    if (!pageData.zone) return [];
    return (pageData.zone.sensors || []).filter(s => s.scope === 'zone');
  }, [pageData.zone]);


  if (isLoading) {
    return <AppLayout><div className="p-6 text-center">Chargement des détails de la machine...</div></AppLayout>;
  }

  if (notFound || !pageData.machine) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive">Machine non trouvée</h1>
          <Button onClick={() => router.back()} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
        </div>
      </AppLayout>
    );
  }

  const { machine, site, zone } = pageData;
  const MachineIconToDisplay = getMachineIconDisplay(machine.type);
  
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push(`/client/assets/manage/${siteId}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour à la gestion de {site?.name || 'site'}
          </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                <MachineIconToDisplay className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle className="text-3xl">Gérer: {machine.name}</CardTitle>
                    <CardDescription>Type: {machine.type} | Site: {site?.name} | Zone: {zone?.name}</CardDescription>
                </div>
                </div>
                <Button 
                    variant="outline" 
                    asChild
                >
                    <Link href={`/client/assets/edit-machine-details/${siteId}/${zoneId}/${machineId}`}>
                        <Edit3 className="mr-2 h-4 w-4" /> Modifier les Détails
                    </Link>
                </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid w-full grid-cols-3"> 
                <TabsTrigger value="config">
                  <Settings2 className="mr-2 h-4 w-4" /> Configuration des Contrôles
                </TabsTrigger>
                <TabsTrigger value="monitoring">
                  <Gauge className="mr-2 h-4 w-4" /> Suivi & Métriques
                </TabsTrigger>
                <TabsTrigger value="sensors">
                  <RadioTower className="mr-2 h-4 w-4" /> Capteurs Liés
                </TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="mt-4">
                {applicableAdminControls.length > 0 ? (
                    <Accordion type="multiple" className="w-full space-y-3">
                    {applicableAdminControls.map((control) => {
                        const config = controlConfigs[control.id] || { isActive: false, params: {}, sensorMappings: {} };
                        return (
                        <AccordionItem key={control.id} value={control.id} className="border rounded-md bg-muted/30 shadow-sm">
                             <AccordionPrimitive.Header className="flex items-center justify-between w-full py-3 px-4 hover:bg-muted/50 rounded-t-md data-[state=open]:bg-muted/60 transition-colors">
                                <AccordionPrimitive.Trigger className={cn("flex flex-1 items-center justify-between text-left focus:outline-none p-0 bg-transparent hover:no-underline", "[&[data-state=open]>svg]:rotate-180")}>
                                    <div className="flex-grow">
                                        <CardTitle className="text-lg">{control.nomDuControle}</CardTitle>
                                        <CardDescription className="text-xs mt-0.5">{control.description}</CardDescription>
                                    </div>
                                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 ml-2" />
                                </AccordionPrimitive.Trigger>
                                <div className="flex items-center space-x-2 shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                                    <Label htmlFor={`switch-${control.id}`} className="text-sm font-medium">
                                        {config.isActive ? "Activé" : "Désactivé"}
                                    </Label>
                                    <Switch
                                        id={`switch-${control.id}`}
                                        checked={config.isActive}
                                        onCheckedChange={(checked) => handleControlActivationChange(control.id, checked)}
                                    />
                                </div>
                            </AccordionPrimitive.Header>
                            <AccordionContent className="pt-0 pb-4 px-4">
                            {config.isActive && (
                                <div className="space-y-4 pt-3 border-t mt-3">
                                {control.expectedParams && control.expectedParams.length > 0 && (
                                <div className="space-y-3 p-3 border rounded-md bg-background">
                                    <h4 className="text-md font-semibold text-muted-foreground">Paramètres :</h4>
                                    {control.expectedParams.map(param => (
                                    <div key={param.id} className="space-y-1">
                                        <Label htmlFor={`${control.id}-${param.id}`}>{param.label}</Label>
                                        {param.type === 'boolean' ? (
                                        <Select
                                            value={String(config.params[param.id] ?? param.defaultValue ?? false)}
                                            onValueChange={(value) => handleParamChange(control.id, param.id, value, param.type)}
                                        >
                                            <SelectTrigger id={`${control.id}-${param.id}`}>
                                            <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                            <SelectItem value="true">Oui / Actif</SelectItem>
                                            <SelectItem value="false">Non / Inactif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        ) : (
                                        <Input
                                            id={`${control.id}-${param.id}`}
                                            type={param.type === 'number' ? 'number' : 'text'}
                                            value={config.params[param.id] ?? param.defaultValue ?? ''}
                                            onChange={(e) => handleParamChange(control.id, param.id, e.target.value, param.type)}
                                            placeholder={param.defaultValue !== undefined ? `Ex: ${param.defaultValue}` : ""}
                                        />
                                        )}
                                    </div>
                                    ))}
                                </div>
                                )}
                                {control.variablesUtilisees && control.variablesUtilisees.length > 0 && (
                                <div className="space-y-3 p-3 border rounded-md bg-background">
                                    <h4 className="text-md font-semibold text-muted-foreground">Mappage des Capteurs Requis :</h4>
                                    {control.variablesUtilisees.map(variableId => {
                                    const variableLabel = control.typesDeCapteursNecessaires.find(
                                        tcLabel => tcLabel.toLowerCase().includes(variableId.split('_')[0]) || tcLabel.toLowerCase().includes(variableId)
                                    ) || variableId;
                                    
                                    const compatibleSensors = machine?.availableSensors?.filter(sensor => {
                                        return sensor.provides?.some(p => p.toLowerCase() === variableId.toLowerCase());
                                    }) || [];

                                    return (
                                        <div key={variableId} className="space-y-1">
                                        <Label htmlFor={`${control.id}-map-${variableId}`}>
                                            Nécessite: {variableLabel} (<code>{variableId}</code>)
                                        </Label>
                                        <Select
                                            value={config.sensorMappings[variableId] || "__NONE__"}
                                            onValueChange={(sensorInstanceId) =>
                                            handleSensorMappingChange(control.id, variableId, sensorInstanceId)
                                            }
                                        >
                                            <SelectTrigger id={`${control.id}-map-${variableId}`}>
                                            <SelectValue placeholder="Sélectionner un capteur..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                            <SelectItem value="__NONE__">-- Non Mappé --</SelectItem>
                                            {compatibleSensors.length > 0 ? (
                                                compatibleSensors.map(sensor => (
                                                <SelectItem key={sensor.id} value={sensor.id}>
                                                    {sensor.name} (Fournit: {sensor.provides?.join(', ') || 'N/A'})
                                                </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="__DISABLED_NO_SENSOR__" disabled>Aucun capteur compatible</SelectItem>
                                            )}
                                            {machine?.availableSensors && machine.availableSensors.filter(s => !compatibleSensors.map(cs => cs.id).includes(s.id)).length > 0 && (
                                                machine.availableSensors.filter(s => !compatibleSensors.map(cs => cs.id).includes(s.id)).map(sensor => (
                                                    <SelectItem key={sensor.id} value={sensor.id} disabled>
                                                    {sensor.name} (Non compatible: {sensor.provides?.join(', ') || 'N/A'})
                                                    </SelectItem>
                                                ))
                                            )}
                                            </SelectContent>
                                        </Select>
                                        </div>
                                    );
                                    })}
                                </div>
                                )}
                                </div>
                            )}
                            </AccordionContent>
                        </AccordionItem>
                        );
                    })}
                    </Accordion>
                ) : (
                    <p className="text-muted-foreground text-center py-4">Aucun contrôle administratif n'est applicable à ce type de machine.</p>
                )}
                <div className="flex justify-end pt-8 mt-6 border-t">
                  <Button size="lg" onClick={handleSaveConfiguration} disabled={isLoading}>
                    <Save className="mr-2 h-5 w-5" />
                    Sauvegarder la Configuration
                  </Button>
                </div>
              </TabsContent>

            <TabsContent value="monitoring" className="mt-4 space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {getMachineStatusIcon(machine.status, "h-6 w-6")}
                        État Actuel de la Machine: {getMachineStatusText(machine.status)}
                    </CardTitle>
                    <CardDescription>Vue d'ensemble du statut et des alertes actives de la machine.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {machine.activeControlInAlert && (
                        <div className="p-3 mb-4 bg-destructive/10 border border-destructive/30 rounded-md shadow-sm">
                            <h4 className="font-semibold text-base mb-1 text-destructive flex items-center">
                                <AlertTriangle className="mr-2 h-5 w-5"/> Alerte Active: {machine.activeControlInAlert.controlName}
                            </h4>
                            <p className="text-foreground">{machine.activeControlInAlert.alertDetails}</p>
                            <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-destructive" onClick={() => router.push(`/client/machine-alerts/${machine.id}`)}>
                                Voir les détails de l'alerte <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    {!(machine.activeControlInAlert) && (
                        <p className="text-muted-foreground">Aucune alerte active pour cette machine.</p>
                    )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Suivi Détaillé des Contrôles Actifs</CardTitle>
                        <CardDescription>Visualisez les métriques et l'état de chaque contrôle activé pour cette machine.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activeMachineControls.length > 0 ? (
                        <Accordion type="multiple" className="w-full space-y-3" defaultValue={activeMachineControls.map(c => `monitoring-${c.id}`)}>
                            {activeMachineControls.map(control => {
                                const isCurrentControlInAlert = machine.activeControlInAlert?.controlId === control.id;
                                const controlStatus = isCurrentControlInAlert ? machine.activeControlInAlert!.status || 'red' : 'green';
                                const controlStatusText = isCurrentControlInAlert ? getMachineStatusText(controlStatus) : "OK";
                                const controlStatusIcon = isCurrentControlInAlert 
                                    ? getMachineStatusIcon(controlStatus, "h-5 w-5") 
                                    : <CheckCircle2 className="h-5 w-5 text-green-500" />;
                                
                                const currentControlConfig = controlConfigs[control.id];
                                const chartDataForThisControl = isCurrentControlInAlert ? machine.activeControlInAlert?.historicalData : [];
                                const relevantVariableForChart = isCurrentControlInAlert ? machine.activeControlInAlert?.relevantSensorVariable : control.variablesUtilisees.length > 0 ? control.variablesUtilisees[0] : "N/A";

                                return (
                                    <AccordionItem key={`monitoring-${control.id}`} value={`monitoring-${control.id}`} className="border rounded-md bg-background shadow-sm">
                                        <AccordionPrimitive.Header className="flex items-center w-full py-3 px-4 hover:bg-muted/30 rounded-t-md data-[state=open]:bg-muted/40 transition-colors">
                                          <AccordionPrimitive.Trigger className={cn("flex flex-1 items-center justify-between text-left focus:outline-none p-0 bg-transparent hover:no-underline", "[&[data-state=open]>svg]:rotate-180")}>
                                              <div className="flex items-center gap-2">
                                                  {controlStatusIcon}
                                                  <span className="font-medium text-md">{control.nomDuControle}</span>
                                              </div>
                                              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                          </AccordionPrimitive.Trigger>
                                        </AccordionPrimitive.Header>
                                        <AccordionContent className="pt-0 pb-4 px-4">
                                            <div className="space-y-3 pt-3 border-t mt-2">
                                                <Card className="bg-muted/30">
                                                    <CardHeader className="pb-2 pt-3">
                                                        <CardTitle className="text-sm font-semibold">État Actuel des Données</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="text-xs">
                                                        {isCurrentControlInAlert && machine.activeControlInAlert?.currentValues ? (
                                                            <ul className="list-disc list-inside">
                                                                {Object.entries(machine.activeControlInAlert.currentValues).map(([key, valObj]) => (
                                                                    <li key={key}><strong>{key}:</strong> {valObj.value}{valObj.unit ? ` ${valObj.unit}` : ''}</li>
                                                                ))}
                                                            </ul>
                                                        ) : currentControlConfig?.params && Object.keys(currentControlConfig.params).length > 0 ? (
                                                            <>
                                                                <p className="font-medium mb-1">Paramètres configurés :</p>
                                                                <ul className="list-disc list-inside">
                                                                    {control.expectedParams?.map(paramDef => {
                                                                        const val = currentControlConfig.params[paramDef.id];
                                                                        if (val !== undefined) {
                                                                            return <li key={paramDef.id}><strong>{paramDef.label}:</strong> {String(val)}</li>;
                                                                        }
                                                                        return null;
                                                                    })}
                                                                </ul>
                                                            </>
                                                        ) : (
                                                            <p className="text-muted-foreground">Aucun paramètre spécifique affiché.</p>
                                                        )}
                                                         {!isCurrentControlInAlert && <p className="mt-2 text-muted-foreground italic">Données en temps réel non simulées (contrôle non en alerte).</p>}
                                                    </CardContent>
                                                </Card>

                                                <Card className="bg-muted/30">
                                                    <CardHeader className="pb-2 pt-3">
                                                        <CardTitle className="text-sm font-semibold flex items-center"><LineChartIcon className="mr-2 h-4 w-4 text-primary" /> Graphique du Contrôle</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {isCurrentControlInAlert && chartDataForThisControl && chartDataForThisControl.length > 0 ? (
                                                            <ChartContainer config={{ value: { label: relevantVariableForChart, color: "hsl(var(--chart-1))" }}} className="h-[200px] w-full aspect-auto">
                                                                <LineChart data={chartDataForThisControl} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                                                                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={30} />
                                                                <RechartsTooltip content={<ChartTooltipContent indicator="line" />} />
                                                                <Line dataKey="value" name={relevantVariableForChart} type="monotone" stroke="var(--color-value)" strokeWidth={2} dot={true}/>
                                                                </LineChart>
                                                            </ChartContainer>
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground text-center py-4">Aucune alerte active pour ce contrôle pour afficher un graphique d'historique.</p>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                                 <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="w-full mt-3"
                                                    onClick={() => router.push(`/client/machine-control-monitoring/${siteId}/${zoneId}/${machineId}/${control.id}`)}
                                                >
                                                    Voir la page de suivi dédiée à ce contrôle <ChevronRight className="ml-1 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">Aucun contrôle n'est actuellement actif pour cette machine.</p>
                        )}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>Journal des Événements Récents</CardTitle>
                        <CardDescription>Historique des événements pour cette machine.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="grid w-full sm:w-auto gap-1.5">
                                <Label htmlFor="event-start-date" className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground"/>Date de début</Label>
                                <Input 
                                    type="date" 
                                    id="event-start-date" 
                                    value={eventLogStartDate} 
                                    onChange={(e) => setEventLogStartDate(e.target.value)}
                                    className="bg-input"
                                />
                            </div>
                            <div className="grid w-full sm:w-auto gap-1.5">
                                <Label htmlFor="event-end-date" className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground"/>Date de fin</Label>
                                <Input 
                                    type="date" 
                                    id="event-end-date" 
                                    value={eventLogEndDate} 
                                    onChange={(e) => setEventLogEndDate(e.target.value)}
                                    className="bg-input"
                                />
                            </div>
                            <Button onClick={handleExportEvents} variant="outline" className="w-full sm:w-auto">
                                <Download className="mr-2 h-4 w-4" />
                                Exporter (Excel)
                            </Button>
                        </div>
                        <div className="min-h-[100px] p-4 border rounded-md bg-muted/20 text-center">
                             <p className="text-muted-foreground text-sm">Affichage du journal des événements non implémenté (simulation).</p>
                        </div>
                    </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sensors" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><RadioTower className="h-5 w-5 text-primary"/>Capteurs Liés à {machine.name}</CardTitle>
                        <CardDescription>Liste des capteurs directement liés à cette machine et des capteurs ambiants de la zone.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {machineSensors.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Capteurs de la Machine :</h3>
                                <div className="space-y-2">
                                {machineSensors.map(sensor => (
                                    <div key={sensor.id} className="flex items-center justify-between p-3 border rounded-md bg-background/70 shadow-sm">
                                        <div>
                                            <p className="text-sm font-medium">{sensor.name}</p>
                                            <p className="text-xs text-muted-foreground">Modèle: {sensor.typeModel}</p>
                                        </div>
                                        {getMachineStatusIcon(sensor.status || 'white', "h-5 w-5 shrink-0")}
                                    </div>
                                ))}
                                </div>
                            </div>
                        )}
                        {ambientSensors.length > 0 && (
                             <div>
                                <h3 className="font-semibold text-lg mb-2 mt-4">Capteurs Ambiants de la Zone ({zone?.name}) :</h3>
                                <div className="space-y-2">
                                {ambientSensors.map(sensor => (
                                    <div key={sensor.id} className="flex items-center justify-between p-3 border rounded-md bg-background/70 shadow-sm">
                                        <div>
                                            <p className="text-sm font-medium">{sensor.name}</p>
                                            <p className="text-xs text-muted-foreground">Modèle: {sensor.typeModel}</p>
                                        </div>
                                        {getMachineStatusIcon(sensor.status || 'white', "h-5 w-5 shrink-0")}
                                    </div>
                                ))}
                                </div>
                            </div>
                        )}
                        {machineSensors.length === 0 && ambientSensors.length === 0 && (
                            <p className="text-muted-foreground text-sm text-center py-4">Aucun capteur n'est actuellement associé à cette machine ou à sa zone.</p>
                        )}
                    </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
    

    
