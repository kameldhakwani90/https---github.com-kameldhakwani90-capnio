
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { DUMMY_CLIENT_SITES_DATA, type Site, type Zone as FullZoneType, type Machine as FullMachineType, type Status, type ConfiguredControl, type ControlParameter as SiteControlParameter, type ActiveControlInAlert, type HistoricalDataPoint, type ChecklistItem, getStatusIcon as getMachineStatusIcon, getStatusText as getMachineStatusText } from "@/app/client/sites/[...sitePath]/page";
import { ChevronLeft, Settings2, HardDrive, Server, Thermometer, Zap, Wind, LineChart as LineChartIcon, FileText, ListChecks, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from "recharts";

// Re-using AdminControl interface and dummy data from ManageMachinePage for consistency
// In a real app, this would come from a shared service/store
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

const DUMMY_ADMIN_CONTROLS_DEFINITIONS: AdminControlDefinition[] = [
 {
    id: "control-001",
    nomDuControle: "Contrôle Température Frigo",
    typesDeMachinesConcernees: ["Frigo", "Congélateur"],
    typesDeCapteursNecessaires: ["Température"],
    variablesUtilisees: ["temp"],
    formuleDeVerification: "sensor['temp'].value >= machine.params['seuil_min'] && sensor['temp'].value <= machine.params['seuil_max']",
    description: "Vérifie que la température du frigo reste dans les seuils définis.",
    expectedParams: [
      { id: 'seuil_min', label: 'Seuil Température Minimum (°C)', type: 'number', defaultValue: 0 },
      { id: 'seuil_max', label: 'Seuil Température Maximum (°C)', type: 'number', defaultValue: 5 },
    ],
    checklist: [
        { id: 'chk-frigo-1', label: "Vérifier que la porte du frigo est bien fermée et étanche." },
        { id: 'chk-frigo-2', label: "Nettoyer le condenseur de toute poussière ou obstruction." },
        { id: 'chk-frigo-3', label: "S'assurer que la ventilation autour du frigo n'est pas bloquée." },
    ]
  },
  {
    id: "control-002",
    nomDuControle: "Contrôle Consommation Électrique Moteur",
    typesDeMachinesConcernees: ["Moteur Principal", "Pompe Hydraulique", "Compresseur", "HVAC"],
    typesDeCapteursNecessaires: ["Tension", "Courant"],
    variablesUtilisees: ["tension", "courant", "conso"], 
    formuleDeCalcul: "conso = sensor['tension'].value * sensor['courant'].value",
    formuleDeVerification: "conso <= machine.params['seuil_max_conso']",
    description: "Calcule et vérifie la consommation électrique des moteurs.",
    expectedParams: [
      { id: 'seuil_max_conso', label: 'Seuil Consommation Max (W)', type: 'number', defaultValue: 2000 },
    ],
     checklist: [
        { id: 'chk-moteur-1', label: "Inspecter visuellement le moteur pour des signes de surchauffe ou de dommage." },
        { id: 'chk-moteur-2', label: "Vérifier que les connexions électriques sont bien serrées et non corrodées." },
    ]
  },
  {
    id: "control-003",
    nomDuControle: "Alerte Pression Basse Huile Compresseur",
    typesDeMachinesConcernees: ["Compresseur"],
    typesDeCapteursNecessaires: ["Pression"],
    variablesUtilisees: ["pression_huile"],
    formuleDeVerification: "sensor['pression_huile'].value >= machine.params['seuil_min_pression']",
    description: "Alerte si la pression d'huile du compresseur est trop basse.",
    expectedParams: [
      { id: 'seuil_min_pression', label: 'Seuil Pression Huile Minimum (bar)', type: 'number', defaultValue: 0.5 },
    ],
    checklist: [
        { id: 'chk-comp-1', label: "Vérifier le niveau d'huile du compresseur." },
        { id: 'chk-comp-2', label: "Rechercher des fuites d'huile potentielles." },
    ]
  },
   {
    id: "control-srv-temp",
    nomDuControle: "Surveillance Température Serveur",
    typesDeMachinesConcernees: ["Serveur", "PC"],
    typesDeCapteursNecessaires: ["Température Serveur"],
    variablesUtilisees: ["temp_srv"], 
    formuleDeVerification: "sensor['temp_srv'].value <= machine.params['seuil_max_temp_srv']",
    description: "Surveille la température interne du serveur pour éviter la surchauffe.",
    expectedParams: [
      { id: 'seuil_max_temp_srv', label: 'Seuil Température Max Serveur (°C)', type: 'number', defaultValue: 75 },
    ],
    checklist: [
        { id: 'chk-srv-1', label: "S'assurer que les ventilateurs du serveur fonctionnent correctement." },
        { id: 'chk-srv-2', label: "Vérifier que les entrées et sorties d'air du serveur ne sont pas obstruées." },
        { id: 'chk-srv-3', label: "Contrôler la température ambiante de la salle des serveurs." },
    ]
  },
  {
    id: "control-srv-cpu",
    nomDuControle: "Surveillance Utilisation CPU Serveur",
    typesDeMachinesConcernees: ["Serveur", "PC"],
    typesDeCapteursNecessaires: ["Utilisation CPU"],
    variablesUtilisees: ["cpu_usage_percent"],
    formuleDeVerification: "sensor['cpu_usage_percent'].value <= machine.params['seuil_max_cpu']",
    description: "Alerte si l'utilisation du CPU dépasse un seuil critique.",
    expectedParams: [{ id: 'seuil_max_cpu', label: 'Seuil Utilisation Max CPU (%)', type: 'number', defaultValue: 90 }],
    checklist: [
        { id: 'chk-cpu-1', label: "Identifier les processus consommant le plus de CPU." },
        { id: 'chk-cpu-2', label: "Vérifier les mises à jour système et logicielles." }
    ]
  },
  {
    id: "control-srv-mem",
    nomDuControle: "Surveillance Utilisation Mémoire Serveur",
    typesDeMachinesConcernees: ["Serveur", "PC"],
    typesDeCapteursNecessaires: ["Utilisation Mémoire"],
    variablesUtilisees: ["mem_usage_percent"],
    formuleDeVerification: "sensor['mem_usage_percent'].value <= machine.params['seuil_max_mem']",
    description: "Alerte si l'utilisation de la mémoire vive (RAM) dépasse un seuil critique.",
    expectedParams: [{ id: 'seuil_max_mem', label: 'Seuil Utilisation Max Mémoire (%)', type: 'number', defaultValue: 85 }],
    checklist: [
        { id: 'chk-mem-1', label: "Identifier les processus consommant le plus de mémoire." },
        { id: 'chk-mem-2', label: "Vérifier les fuites de mémoire potentielles." }
    ]
  },
  {
    id: "control-srv-disk",
    nomDuControle: "Surveillance Espace Disque Serveur",
    typesDeMachinesConcernees: ["Serveur", "PC"],
    typesDeCapteursNecessaires: ["Espace Disque Libre"],
    variablesUtilisees: ["disk_free_gb"],
    formuleDeVerification: "sensor['disk_free_gb'].value >= machine.params['seuil_min_disk_gb']",
    description: "Alerte si l'espace disque libre tombe sous un seuil critique.",
    expectedParams: [{ id: 'seuil_min_disk_gb', label: 'Seuil Espace Disque Libre Minimum (GB)', type: 'number', defaultValue: 20 }],
    checklist: [
        { id: 'chk-disk-1', label: "Supprimer les fichiers temporaires et inutiles." },
        { id: 'chk-disk-2', label: "Archiver les anciennes données." },
        { id: 'chk-disk-3', label: "Planifier une augmentation de la capacité disque si nécessaire." }
    ]
  },
  {
    id: "control-srv-latency",
    nomDuControle: "Surveillance Latence Réseau Serveur",
    typesDeMachinesConcernees: ["Serveur"],
    typesDeCapteursNecessaires: ["Latence Ping"],
    variablesUtilisees: ["ping_latency_ms"],
    formuleDeVerification: "sensor['ping_latency_ms'].value <= machine.params['seuil_max_latency_ms']",
    description: "Alerte si la latence réseau (ping vers une cible de référence) dépasse un seuil.",
    expectedParams: [{ id: 'seuil_max_latency_ms', label: 'Seuil Latence Max (ms)', type: 'number', defaultValue: 100 }],
    checklist: [
        { id: 'chk-lat-1', label: "Vérifier la connectivité réseau physique." },
        { id: 'chk-lat-2', label: "Contrôler la charge du réseau." }
    ]
  }
];


// Helper to find a machine (can be moved to a shared util)
function findMachineFromGlobalData(siteIdPath: string, zoneIdPath: string, machineIdPath: string): FullMachineType | undefined {
    // ... (same implementation as in ManageMachinePage)
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
    return targetZone.machines.find(m => m.id === machineIdPath);
}

// Helper to find an admin control definition
function findAdminControlById(controlId: string): AdminControlDefinition | undefined {
  return DUMMY_ADMIN_CONTROLS_DEFINITIONS.find(c => c.id === controlId);
}


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
  const controlStatusIcon = isControlInAlert ? getMachineStatusIcon(controlStatus) : (configuredControl?.isActive ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Info className="h-5 w-5 text-gray-400" />);

  const chartData = isControlInAlert ? machine.activeControlInAlert?.historicalData || [] : []; // Placeholder for non-alert data
  const relevantSensorVariable = isControlInAlert ? machine.activeControlInAlert?.relevantSensorVariable : "N/A";
  const chartConfig = { value: { label: relevantSensorVariable, color: "hsl(var(--chart-1))" } };
  
  const currentChecklist = isControlInAlert ? machine.activeControlInAlert?.checklist : adminControl.checklist;

  const getMachineIconDisplay = (type: string) => {
    if (type === "Frigo" || type === "Congélateur") return Thermometer;
    if (type === "Armoire Électrique") return Zap;
    if (type === "Compresseur" || type === "Pompe Hydraulique" || type === "HVAC") return Wind;
    if (type.toLowerCase().includes("serveur") || type === "PC") return Server;
    return HardDrive;
  };
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
