
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { DUMMY_CLIENT_SITES_DATA, type Site, type Zone as FullZoneType, type Machine as FullMachineType, type Status, type ConfiguredControl, type ControlParameter as SiteControlParameter, type ActiveControlInAlert, type HistoricalDataPoint, type ChecklistItem, getStatusIcon as getMachineStatusIcon, getStatusText as getMachineStatusText, getMachineIcon, securityChecklistMotion, securityChecklistSmoke, farmChecklistSoilMoisture, farmChecklistAnimalEnclosure, agroChecklistHumidityCold } from "@/lib/client-data.tsx"; 
import { ChevronLeft, Settings2, HardDrive, Server, Thermometer, Zap, Wind, LineChart as LineChartIcon, FileText, ListChecks, AlertTriangle, CheckCircle2, Info, Move, Flame, Droplets, Snowflake } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from "recharts";

interface AdminControlDefinition {
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

// Ensure this list is consistent with DUMMY_ADMIN_CONTROLS_FOR_MACHINE_PAGE
const DUMMY_ADMIN_CONTROLS_DEFINITIONS: AdminControlDefinition[] = [
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

function findMachineFromGlobalData(siteIdPath: string, zoneIdPath: string, machineIdPath: string): FullMachineType | undefined {
    let foundMachine: FullMachineType | undefined;

    const searchRecursively = (sitesToSearch: Site[]): boolean => {
        for (const site of sitesToSearch) {
            const zone = site.zones.find(z => z.id === zoneIdPath);
            if (zone) {
                const machine = zone.machines.find(m => m.id === machineIdPath);
                if (machine) {
                    foundMachine = machine;
                    return true; // Machine found
                }
                // If zone is found but machine isn't, and zone has subZones, search in subZones.
                // This part might need adjustment if zones can be deeply nested and machine is in a sub-sub-zone.
                // For now, assuming machineIdPath is within the direct zoneIdPath or its immediate subZones.
                 if (zone.subZones) { // Search in subZones of the found zone
                    for (const subZone of zone.subZones) {
                        // This recursive call is a bit tricky if zoneIdPath itself refers to a subZone.
                        // Let's assume zoneIdPath refers to the DIRECT parent zone of the machine for now.
                        // If zoneIdPath can be a grandparent, this needs more robust traversal.
                        const machineInSubZone = subZone.machines.find(m => m.id === machineIdPath);
                        if (machineInSubZone) {
                            foundMachine = machineInSubZone;
                            return true;
                        }
                    }
                 }

            }
            if (site.subSites) {
                if (searchRecursively(site.subSites)) {
                    return true; // Machine found in a subSite's zone
                }
            }
        }
        return false; // Machine not found in this branch
    };

    searchRecursively(DUMMY_CLIENT_SITES_DATA);
    return foundMachine;
}

function findAdminControlById(controlId: string): AdminControlDefinition | undefined {
  return DUMMY_ADMIN_CONTROLS_DEFINITIONS.find(c => c.id === controlId);
}

function getMachineIconDisplay(type: string): LucideIcon {
    if (type.toLowerCase().includes("frigo") || type.toLowerCase().includes("congélateur") || type.toLowerCase().includes("vitrine")) return Thermometer;
    if (type.toLowerCase().includes("four")) return Flame;
    if (type.toLowerCase().includes("électrique") || type.toLowerCase().includes("elec")) return Zap;
    if (type.toLowerCase().includes("compresseur") || type.toLowerCase().includes("pompe") || type.toLowerCase().includes("hvac") || type.toLowerCase().includes("ventilation")) return Wind;
    if (type.toLowerCase().includes("serveur") || type.toLowerCase().includes("pc") || type.toLowerCase().includes("hub sécurité")) return Server;
    if (type.toLowerCase().includes("camion")) return Truck; // Assuming Truck is imported
    if (type.toLowerCase().includes("abreuvoir")) return Droplets;
    if (type.toLowerCase().includes("climatiseur") || type.toLowerCase().includes("unité de climatisation")) return Snowflake;
    return HardDrive;
};


export default function MachineControlMonitoringPage() {
  const router = useRouter();
  const params = useParams();
  
  const siteId = params.siteId as string;
  const zoneId = params.zoneId as string;
  const machineId = params.machineId as string;
  const controlId = params.controlId as string;

  const [machine, setMachine] = useState<FullMachineType | null>(null);
  const [adminControl, setAdminControl] = useState<AdminControlDefinition | null>(null);
  const [configuredControl, setConfiguredControl] = useState<ConfiguredControl | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!siteId || !zoneId || !machineId || !controlId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    const foundMachine = findMachineFromGlobalData(siteId, zoneId, machineId);
    const foundAdminControl = findAdminControlById(controlId);

    if (foundMachine && foundAdminControl) {
      setMachine(foundMachine);
      setAdminControl(foundAdminControl);
      setConfiguredControl(foundMachine.configuredControls?.[controlId] || null);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  }, [siteId, zoneId, machineId, controlId]);

  if (isLoading) {
    return <AppLayout><div className="p-6 text-center">Chargement des détails du contrôle...</div></AppLayout>;
  }

  if (notFound || !machine || !adminControl) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive">Machine ou Contrôle non trouvé</h1>
           <p className="text-muted-foreground mb-4">Machine ID: {machineId}, Control ID: {controlId}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  const isControlInAlert = machine.activeControlInAlert?.controlId === controlId;
  const controlStatus: Status = isControlInAlert ? machine.activeControlInAlert!.status || 'red' : (configuredControl?.isActive ? 'green' : 'white');
  const controlStatusText = isControlInAlert ? getMachineStatusText(controlStatus) : (configuredControl?.isActive ? "OK" : "Inactif");
  const controlStatusIcon = isControlInAlert ? getMachineStatusIcon(controlStatus, "h-5 w-5") : (configuredControl?.isActive ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Info className="h-5 w-5 text-gray-400" />);

  const chartData = isControlInAlert && machine.activeControlInAlert?.historicalData ? machine.activeControlInAlert.historicalData : []; 
  const relevantSensorVariable = isControlInAlert ? machine.activeControlInAlert?.relevantSensorVariable : "N/A";
  const chartConfig = { value: { label: relevantSensorVariable, color: "hsl(var(--chart-1))" } };
  
  const currentChecklist = (isControlInAlert && machine.activeControlInAlert?.checklist ? machine.activeControlInAlert.checklist 
    : adminControl.checklist) || [];


  const MachineIconToDisplay = getMachineIconDisplay(machine.type);


  return (
    <AppLayout>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push(`/client/assets/manage-machine/${siteId}/${zoneId}/${machineId}`)}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Retour à la Gestion de {machine.name}
            </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="text-2xl mb-1 flex items-center gap-2">
                        {controlStatusIcon}
                        {adminControl.nomDuControle}
                    </CardTitle>
                    <CardDescription>
                        Machine: {machine.name} ({machine.type}) - État du contrôle: {controlStatusText}
                    </CardDescription>
                </div>
                 <MachineIconToDisplay className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">
                    <FileText className="mr-2 h-4 w-4" /> Informations & Paramètres
                </TabsTrigger>
                <TabsTrigger value="history">
                    <LineChartIcon className="mr-2 h-4 w-4" />Données & Historique
                </TabsTrigger>
                <TabsTrigger value="checklist">
                    <ListChecks className="mr-2 h-4 w-4" />Bonnes Pratiques
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4 p-4 border rounded-md bg-muted/30 space-y-4">
                <div>
                  <h4 className="font-semibold text-base mb-1">Description du Contrôle</h4>
                  <p className="text-muted-foreground text-sm">{adminControl.description}</p>
                </div>

                {isControlInAlert && machine.activeControlInAlert && (
                    <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md shadow-sm">
                        <h4 className="font-semibold text-base mb-1 text-destructive flex items-center">
                            <AlertTriangle className="mr-2 h-5 w-5"/> Détails de l'Alerte Actuelle
                        </h4>
                        <p className="text-foreground text-sm">{machine.activeControlInAlert.alertDetails}</p>
                    </div>
                )}
                
                <div>
                  <h4 className="font-semibold text-base mb-1">Formule de Vérification</h4>
                  <p className="font-mono text-xs text-muted-foreground p-2 bg-background/70 rounded-md border">{adminControl.formuleDeVerification}</p>
                </div>

                {configuredControl?.params && Object.keys(configuredControl.params).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-base mb-2">Paramètres Configurés pour cette Machine :</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      {adminControl.expectedParams?.map(paramDef => {
                        const value = configuredControl.params[paramDef.id];
                        return (
                          <div key={paramDef.id} className="flex justify-between">
                            <span className="text-muted-foreground">{paramDef.label}:</span>
                            <span className="font-medium">{value !== undefined ? String(value) : 'N/A'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {configuredControl?.sensorMappings && Object.keys(configuredControl.sensorMappings).length > 0 && (
                    <div>
                        <h4 className="font-semibold text-base mb-2">Capteurs Mappés :</h4>
                        <ul className="list-disc list-inside pl-1 text-sm">
                        {Object.entries(configuredControl.sensorMappings).map(([variable, sensorId]) => {
                            const sensor = machine.availableSensors?.find(s => s.id === sensorId);
                            const variableLabel = adminControl.typesDeCapteursNecessaires.find(
                                tcLabel => tcLabel.toLowerCase().includes(variable.split('_')[0]) || tcLabel.toLowerCase().includes(variable)
                            ) || variable;
                            return (
                                <li key={variable}>
                                <span className="text-muted-foreground">{variableLabel} (<code>{variable}</code>) → </span>
                                <span className="font-medium">{sensor ? sensor.name : (sensorId ? 'Capteur non trouvé' : 'Non mappé')}</span>
                                </li>
                            );
                        })}
                        </ul>
                    </div>
                )}


              </TabsContent>

              <TabsContent value="history" className="mt-4 p-4 border rounded-md bg-muted/30">
                {chartData.length > 0 ? (
                  <div>
                    <h4 className="font-semibold text-base mb-2 flex items-center">
                      <LineChartIcon className="mr-2 h-5 w-5 text-primary" />
                      Historique des Données ({relevantSensorVariable})
                    </h4>
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
                        <YAxis 
                          tickLine={false} 
                          axisLine={false} 
                          tickMargin={8}
                          width={30}
                        />
                        <RechartsTooltip cursor={true} content={<ChartTooltipContent indicator="line" />} />
                        <Legend />
                        <Line dataKey="value" name={chartConfig.value.label} type="monotone" stroke="var(--color-value)" strokeWidth={2} dot={true}/>
                      </LineChart>
                    </ChartContainer>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucun historique de données disponible pour ce contrôle dans l'état actuel. Le graphique s'affiche si le contrôle est en alerte et que des données sont disponibles.</p>
                )}
              </TabsContent>

              <TabsContent value="checklist" className="mt-4 p-4 border rounded-md bg-muted/30">
                <h4 className="font-semibold text-base mb-3">Vérifications et Bonnes Pratiques</h4>
                {currentChecklist && currentChecklist.length > 0 ? (
                  <div className="space-y-3">
                    {currentChecklist.map((item) => (
                      <div key={item.id} className="flex items-start space-x-2 p-2 bg-background/70 rounded-md border">
                        <Checkbox id={`chk-${item.id}`} className="mt-0.5"/>
                        <Label htmlFor={`chk-${item.id}`} className="text-sm font-normal leading-snug">
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucune checklist de bonnes pratiques définie pour ce contrôle.</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}



