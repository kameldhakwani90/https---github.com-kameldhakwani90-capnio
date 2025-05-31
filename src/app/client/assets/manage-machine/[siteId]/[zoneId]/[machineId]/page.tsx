
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link"; // Import Link
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DUMMY_CLIENT_SITES_DATA, type Site, type Zone as FullZoneType, type Machine as FullMachineType, type Status, type ConfiguredControl, type ControlParameter as SiteControlParameter, type ActiveControlInAlert, getStatusIcon as getMachineStatusIcon, getStatusText as getMachineStatusText, type ChecklistItem } from "@/app/client/sites/[...sitePath]/page"; // Added ChecklistItem
import { ChevronLeft, Save, Settings2, HardDrive, Server, Thermometer, Zap, Wind, LineChart as LineChartIcon, FileText, ListChecks, AlertTriangle, CheckCircle2, Info, ChevronRight } from "lucide-react"; // Added ChevronRight
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
  checklist?: ChecklistItem[]; // Added checklist
}

// DUMMY_ADMIN_CONTROLS_FOR_MACHINE_PAGE with checklists
const DUMMY_ADMIN_CONTROLS_FOR_MACHINE_PAGE: AdminControl[] = [
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
                ...machineSpecificSensors.map(s => ({id: s.id, name: s.name, provides: s.provides || []})),
                ...ambientZoneSensors.map(s => ({id: s.id, name: `${s.name} (Ambiant)`, provides: s.provides || []}))
            ];
             if (augmentedMachine.availableSensors.length === 0) {
                 augmentedMachine.availableSensors = [{id: `${machine.id}-generic`, name: `Capteur générique pour ${machine.name}`, provides:['value']}];
             }
        }
        if (!augmentedMachine.configuredControls) {
            augmentedMachine.configuredControls = {};
        }
        
        if (augmentedMachine.activeControlInAlert && !augmentedMachine.activeControlInAlert.historicalData) {
            augmentedMachine.activeControlInAlert.historicalData = [
                { name: 'T-4', value: Math.random() * 10 + (parseFloat(augmentedMachine.activeControlInAlert.currentValues?.['value']?.value as string) || 65) - 5 },
                { name: 'T-3', value: Math.random() * 10 + (parseFloat(augmentedMachine.activeControlInAlert.currentValues?.['value']?.value as string) || 66) - 4 },
                { name: 'T-2', value: Math.random() * 10 + (parseFloat(augmentedMachine.activeControlInAlert.currentValues?.['value']?.value as string) || 67) - 3 },
                { name: 'T-1', value: Math.random() * 10 + (parseFloat(augmentedMachine.activeControlInAlert.currentValues?.['value']?.value as string) || 68) - 2 },
                { name: 'Maintenant', value: parseFloat(augmentedMachine.activeControlInAlert.currentValues?.['value']?.value as string) || 70 },
            ];
            augmentedMachine.activeControlInAlert.relevantSensorVariable = augmentedMachine.activeControlInAlert.relevantSensorVariable || Object.keys(augmentedMachine.activeControlInAlert.currentValues || {})[0] || "Valeur Simulée";
        }


        return augmentedMachine;
    }
    return undefined;
}

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
    // Here you would typically update DUMMY_CLIENT_SITES_DATA or send to a backend
    // For now, just a log and toast
  };

  const applicableAdminControls = useMemo(() => {
    if (!machine) return [];
    return DUMMY_ADMIN_CONTROLS_FOR_MACHINE_PAGE.filter(control =>
      control.typesDeMachinesConcernees.length === 0 || control.typesDeMachinesConcernees.includes(machine.type)
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

  const getMachineIconDisplay = (type: string) => {
    if (type === "Frigo" || type === "Congélateur") return Thermometer;
    if (type === "Armoire Électrique") return Zap;
    if (type === "Compresseur" || type === "Pompe Hydraulique" || type === "HVAC") return Wind;
    if (type.toLowerCase().includes("serveur") || type === "PC") return Server;
    return HardDrive;
  };
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
                                    <Input
                                      id={`${control.id}-${param.id}`}
                                      type={param.type === 'number' ? 'number' : 'text'}
                                      value={config.params[param.id] ?? ''}
                                      onChange={(e) => handleParamChange(control.id, param.id, e.target.value, param.type)}
                                      placeholder={param.defaultValue !== undefined ? `Ex: ${param.defaultValue}` : ""}
                                    />
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
                                    // A sensor is compatible if it provides AT LEAST ONE of the variable types.
                                    // Example: variableId = "temp", sensor.provides = ["temp", "humidity"] -> compatible
                                    // Example: variableId = "temp_cpu", sensor.provides = ["temp_cpu"] -> compatible
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
                                           {machine?.availableSensors && machine.availableSensors.filter(s => !compatibleSensors.includes(s)).length > 0 && (
                                              machine.availableSensors.filter(s => !compatibleSensors.includes(s)).map(sensor => (
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


    