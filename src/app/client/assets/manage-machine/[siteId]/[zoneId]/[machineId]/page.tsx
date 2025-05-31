
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link"; 
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DUMMY_CLIENT_SITES_DATA, type Site, type Zone as FullZoneType, type Machine as FullMachineType, type Status, type ConfiguredControl, type ControlParameter as SiteControlParameter, type ActiveControlInAlert, type HistoricalDataPoint, type ChecklistItem, getStatusIcon as getMachineStatusIcon, getStatusText as getMachineStatusText, securityChecklistMotion, securityChecklistSmoke, farmChecklistSoilMoisture, farmChecklistAnimalEnclosure } from "@/lib/client-data"; 
import { ChevronLeft, Save, Settings2, HardDrive, Server, Thermometer, Zap, Wind, LineChart as LineChartIcon, FileText, ListChecks, AlertTriangle, CheckCircle2, Info, ChevronRight, Move, Flame, Droplets } from "lucide-react"; 
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

// Combined and extended dummy admin controls
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
    typesDeMachinesConcernees: ["Moteur Principal", "Pompe Hydraulique", "Compresseur", "HVAC", "Equipement de Production"],
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
    typesDeCapteursNecessaires: ["Température CPU/Système"], // Changed from "Température Serveur"
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
    typesDeMachinesConcernees: ["Hub Sécurité", "Générique"], // Applicable à une zone via un hub ou directement
    typesDeCapteursNecessaires: ["Mouvement"],
    variablesUtilisees: ["motion_detected"], // Simplified: current_time logic is hard for static demo
    formuleDeVerification: "sensor['motion_detected'].value === true && (machine.params['surveillance_active'] === true)", // Placeholder for time logic
    description: "Alerte si un mouvement est détecté pendant les heures de surveillance.",
    expectedParams: [
      { id: 'heure_debut_surveillance', label: 'Début Surveillance (HH:MM)', type: 'string', defaultValue: '22:00' },
      { id: 'heure_fin_surveillance', label: 'Fin Surveillance (HH:MM)', type: 'string', defaultValue: '06:00' },
      { id: 'surveillance_active', label: 'Surveillance Active (Actuellement)', type: 'boolean', defaultValue: true }, // Simulates if current time is within range
    ],
    checklist: securityChecklistMotion
  },
  {
    id: "control-smoke-alarm",
    nomDuControle: "Alarme Incendie (Détection Fumée)",
    typesDeMachinesConcernees: ["Hub Sécurité", "Générique"], // Applicable à une zone
    typesDeCapteursNecessaires: ["Fumée"],
    variablesUtilisees: ["smoke_detected"],
    formuleDeVerification: "sensor['smoke_detected'].value === true",
    description: "Alerte immédiate si de la fumée est détectée.",
    expectedParams: [], // Peut être sans paramètre si binaire
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
    typesDeCapteursNecessaires: ["Température Ambiante"], // Sensor provides 'temp' or 'temp_enclos'
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
  }
];

function findMachineFromGlobalData(siteIdPath: string, zoneIdPath: string, machineIdPath: string): FullMachineType | undefined {
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
    if (!targetSite) return undefined;

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
    if (!targetZone) return undefined;

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
             if (augmentedMachine.availableSensors.length === 0 && augmentedMachine.type !== 'PC' && augmentedMachine.type !== 'Hub Sécurité') { // Hub Sécurité might not have its own provides
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


        return augmentedMachine;
    }
    return undefined;
}

function getMachineIconDisplay(type: string): LucideIcon {
    if (type.toLowerCase().includes("frigo") || type.toLowerCase().includes("congélateur") || type.toLowerCase().includes("vitrine")) return Thermometer;
    if (type.toLowerCase().includes("four")) return Flame;
    if (type.toLowerCase().includes("électrique") || type.toLowerCase().includes("elec")) return Zap;
    if (type.toLowerCase().includes("compresseur") || type.toLowerCase().includes("pompe") || type.toLowerCase().includes("hvac") || type.toLowerCase().includes("ventilation")) return Wind;
    if (type.toLowerCase().includes("serveur") || type.toLowerCase().includes("pc") || type.toLowerCase().includes("hub sécurité")) return Server;
    if (type.toLowerCase().includes("camion")) return Truck;
    if (type.toLowerCase().includes("abreuvoir")) return Droplets;
    return HardDrive;
};

export default function ManageMachinePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const siteId = params.siteId as string;
  const zoneId = params.zoneId as string;
  const machineId = params.machineId as string;

  const [machine, setMachine] = useState<FullMachineType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [controlConfigs, setControlConfigs] = useState<Record<string, ConfiguredControl>>({});

  useEffect(() => {
    if (!siteId || !zoneId || !machineId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    const foundMachine = findMachineFromGlobalData(siteId, zoneId, machineId);
    if (foundMachine) {
      setMachine(foundMachine);
      const initialConfigs: Record<string, ConfiguredControl> = {};
      DUMMY_ADMIN_CONTROLS_FOR_MACHINE_PAGE.forEach(control => {
        const existingConfig = foundMachine.configuredControls?.[control.id];
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
      description: `Les configurations pour ${machine?.name} ont été sauvegardées (simulation).`,
    });
    // Here you would typically update the DUMMY_CLIENT_SITES_DATA or send to a backend
    // For this demo, we are not persisting changes beyond the session.
  };

  const applicableAdminControls = useMemo(() => {
    if (!machine) return [];
    return DUMMY_ADMIN_CONTROLS_FOR_MACHINE_PAGE.filter(control =>
      control.typesDeMachinesConcernees.length === 0 || 
      control.typesDeMachinesConcernees.includes(machine.type) ||
      control.typesDeMachinesConcernees.includes("Générique")
    );
  }, [machine]);

  const activeMachineControls = useMemo(() => {
    if (!machine) return [];
    return applicableAdminControls.filter(adminCtrl => controlConfigs[adminCtrl.id]?.isActive);
  }, [machine, applicableAdminControls, controlConfigs]);


  if (isLoading) {
    return <AppLayout><div className="p-6 text-center">Chargement des détails de la machine...</div></AppLayout>;
  }

  if (notFound || !machine) {
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

  const MachineIconToDisplay = getMachineIconDisplay(machine.type);
  
  const chartData = machine.activeControlInAlert?.historicalData || [];
  const chartConfig = {
    value: {
      label: machine.activeControlInAlert?.relevantSensorVariable || "Donnée",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push(`/client/assets/manage/${siteId}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour à la gestion du site
          </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <MachineIconToDisplay className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">Gérer: {machine.name}</CardTitle>
                <CardDescription>Type: {machine.type} | Site: {siteId} | Zone: {zoneId}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-2"> 
                <TabsTrigger value="config">
                  <Settings2 className="mr-2 h-4 w-4" /> Configuration des Contrôles
                </TabsTrigger>
                <TabsTrigger value="monitoring">
                  <LineChartIcon className="mr-2 h-4 w-4" /> Suivi & Données
                </TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="mt-4">
                <div className="space-y-6">
                  {applicableAdminControls.map((control) => {
                    const config = controlConfigs[control.id] || { isActive: false, params: {}, sensorMappings: {} };
                    return (
                      <Card key={control.id} className="bg-muted/30 shadow-md">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">{control.nomDuControle}</CardTitle>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`switch-${control.id}`} className="text-sm font-medium">
                                {config.isActive ? "Activé" : "Désactivé"}
                              </Label>
                              <Switch
                                id={`switch-${control.id}`}
                                checked={config.isActive}
                                onCheckedChange={(checked) => handleControlActivationChange(control.id, checked)}
                              />
                            </div>
                          </div>
                          <CardDescription>{control.description}</CardDescription>
                        </CardHeader>
                        {config.isActive && (
                          <CardContent className="space-y-4 pt-2">
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
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
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
                        État Actuel: {getMachineStatusText(machine.status)}
                    </CardTitle>
                    <CardDescription>Vue d'ensemble du statut et des contrôles actifs de la machine.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     {machine.activeControlInAlert && (
                        <div className="p-3 mb-4 bg-destructive/10 border border-destructive/30 rounded-md shadow-sm">
                            <h4 className="font-semibold text-base mb-1 text-destructive flex items-center">
                                <AlertTriangle className="mr-2 h-5 w-5"/> Alerte Active: {machine.activeControlInAlert.controlName}
                            </h4>
                            <p className="text-foreground">{machine.activeControlInAlert.alertDetails}</p>
                            <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-destructive" onClick={() => router.push(`/client/machine-alerts/${machine.id}`)}>
                                Voir les détails de l'alerte
                            </Button>
                        </div>
                    )}
                    
                    <h3 className="text-lg font-semibold mb-2">Contrôles Actifs</h3>
                    {activeMachineControls.length > 0 ? (
                      <div className="space-y-2">
                        {activeMachineControls.map(control => {
                          const isAlerting = machine.activeControlInAlert?.controlId === control.id;
                          const controlStatusText = isAlerting ? "En Alerte" : "OK";
                          const controlStatusIcon = isAlerting 
                            ? <AlertTriangle className="h-4 w-4 text-destructive" /> 
                            : <CheckCircle2 className="h-4 w-4 text-green-500" />;

                          return (
                             <Link
                                key={control.id}
                                href={`/client/machine-control-monitoring/${siteId}/${zoneId}/${machineId}/${control.id}`}
                                className="block p-3 border rounded-md bg-background/50 hover:bg-muted/50 transition-colors cursor-pointer"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{control.nomDuControle}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        {controlStatusIcon} {controlStatusText}
                                    </div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Aucun contrôle n'est actuellement actif pour cette machine.</p>
                    )}
                  </CardContent>
                </Card>

                {chartData.length > 0 && machine.activeControlInAlert ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LineChartIcon className="h-5 w-5 text-primary" />
                        Historique de l'Alerte : {chartConfig.value.label}
                      </CardTitle>
                      <CardDescription>Données historiques relatives à l'alerte en cours.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[250px] w-full aspect-auto">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            tickLine={false} 
                            axisLine={false} 
                            tickMargin={8}
                            tickFormatter={(value) => typeof value === 'string' ? value.slice(0, 5) : value}
                          />
                          <YAxis tickLine={false} axisLine={false} tickMargin={8} width={30}/>
                          <RechartsTooltip cursor={true} content={<ChartTooltipContent indicator="line" />} />
                          <Legend />
                          <Line dataKey="value" name={chartConfig.value.label} type="monotone" stroke="var(--color-value)" strokeWidth={2} dot={true}/>
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                ) : (
                   <Card>
                     <CardHeader><CardTitle>Graphiques des Capteurs</CardTitle></CardHeader>
                     <CardContent><p className="text-muted-foreground">Aucune donnée d'alerte active à afficher. (À terme: graphiques des capteurs principaux)</p></CardContent>
                   </Card>
                )}
                
                <Card>
                    <CardHeader><CardTitle>Journal des Événements Récents</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">Aucun événement récent pour cette machine (simulation).</p></CardContent>
                </Card>

              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

