
"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DUMMY_CLIENT_SITES_DATA, type Site, type Zone as FullZoneType, type Machine as FullMachineType, type Status, type ConfiguredControl, type ControlParameter as SiteControlParameter } from "@/app/client/sites/[...sitePath]/page"; // Import full structure for finding machine
import { ChevronLeft, Save, Settings2, HardDrive, Server, Thermometer, Zap, Wind } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// --- Data Structures (Simulated for this page) ---
// Re-using ConfiguredControl from sites/[...sitePath]/page.tsx
// We need AdminControl definition here or from a shared place

interface AdminControl {
  id: string;
  nomDuControle: string;
  typesDeMachinesConcernees: string[];
  typesDeCapteursNecessaires: string[]; // Labels, e.g., ["Température", "Courant"]
  variablesUtilisees: string[]; // System variable IDs, e.g., ["temp", "current"]
  formuleDeCalcul?: string;
  formuleDeVerification: string;
  description: string;
  expectedParams?: SiteControlParameter[]; // Using the one from sitePath for consistency
}

// Dummy Admin Defined Controls (copied and adapted from admin section or similar)
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
    ]
  },
  {
    id: "control-002",
    nomDuControle: "Contrôle Consommation Électrique Moteur",
    typesDeMachinesConcernees: ["Moteur Principal", "Pompe Hydraulique", "Compresseur", "HVAC"],
    typesDeCapteursNecessaires: ["Tension", "Courant"], // These are labels, mapping to variablesUtilisees
    variablesUtilisees: ["tension", "courant", "conso"], // System variable names
    formuleDeCalcul: "conso = sensor['tension'].value * sensor['courant'].value",
    formuleDeVerification: "conso <= machine.params['seuil_max_conso']",
    description: "Calcule et vérifie la consommation électrique des moteurs.",
    expectedParams: [
      { id: 'seuil_max_conso', label: 'Seuil Consommation Max (W)', type: 'number', defaultValue: 2000 },
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
    ]
  },
   {
    id: "control-srv-temp", // Control for Servers
    nomDuControle: "Surveillance Température Serveur",
    typesDeMachinesConcernees: ["Serveur", "PC"],
    typesDeCapteursNecessaires: ["Température Serveur"], // Label for sensor type
    variablesUtilisees: ["temp_srv"], // System variable name
    formuleDeVerification: "sensor['temp_srv'].value <= machine.params['seuil_max_temp_srv']",
    description: "Surveille la température interne du serveur pour éviter la surchauffe.",
    expectedParams: [
      { id: 'seuil_max_temp_srv', label: 'Seuil Température Max Serveur (°C)', type: 'number', defaultValue: 75 },
    ]
  },
];

// Function to find a machine by its ID within the full sites data structure
function findMachineFromGlobalData(siteIdPath: string, zoneIdPath: string, machineIdPath: string): FullMachineType | undefined {
    // Simplified finding logic for this flat structure example
    // In a real app with nested sites/zones, this would be recursive
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
            // Simulate some available sensors based on machine type or zone sensors
            // For simplicity, we'll use what's already defined in DUMMY_CLIENT_SITES_DATA if present,
            // or a generic one otherwise.
            const zoneSensors = targetZone?.sensors || [];
            const machineSpecificSensors = zoneSensors.filter(s => s.scope === 'machine' && s.affectedMachineIds?.includes(machine.id));
            const ambientZoneSensors = zoneSensors.filter(s => s.scope === 'zone');

            augmentedMachine.availableSensors = [
                ...machineSpecificSensors.map(s => ({id: s.id, name: s.name, provides: s.provides || []})),
                ...ambientZoneSensors.map(s => ({id: s.id, name: `${s.name} (Ambiant)`, provides: s.provides || []})) // Mark ambient sensors
            ];
             if (augmentedMachine.availableSensors.length === 0) {
                 augmentedMachine.availableSensors = [{id: `${machine.id}-generic`, name: `Capteur générique pour ${machine.name}`, provides:['value']}];
             }
        }
        if (!augmentedMachine.configuredControls) {
            augmentedMachine.configuredControls = {};
        }
        return augmentedMachine;
    }
    return undefined;
}


export default function ManageMachineControlsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const siteId = params.siteId as string;
  const zoneId = params.zoneId as string;
  const machineId = params.machineId as string;

  const [machine, setMachine] = useState<FullMachineType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [configurations, setConfigurations] = useState<Record<string, ConfiguredControl>>({});

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
      setConfigurations(initialConfigs);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  }, [siteId, zoneId, machineId]);

  const handleControlActivationChange = (controlId: string, isActive: boolean) => {
    setConfigurations(prev => ({
      ...prev,
      [controlId]: {
        ...(prev[controlId] || { params: {}, sensorMappings: {} }), // Ensure object exists
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
    setConfigurations(prev => ({
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
    setConfigurations(prev => ({
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
    console.log("Saving machine control configurations:", { machineId, configurations });
    toast({
      title: "Configuration Sauvegardée",
      description: `Les configurations des contrôles pour ${machine?.name} ont été sauvegardées (simulation).`,
    });
    // In a real app, update DUMMY_CLIENT_SITES_DATA or send to backend.
    // Then potentially navigate back.
    router.push(`/client/assets/manage/${siteId}`);
  };

  if (isLoading) {
    return <AppLayout><div className="p-6 text-center">Chargement des détails de la machine...</div></AppLayout>;
  }

  if (notFound || !machine) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive">Machine non trouvée</h1>
          <p className="text-muted-foreground mb-4">Impossible de charger les détails pour cette machine.</p>
          <Button onClick={() => router.back()} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
        </div>
      </AppLayout>
    );
  }

  const applicableControls = DUMMY_ADMIN_CONTROLS_FOR_MACHINE_PAGE.filter(control =>
    control.typesDeMachinesConcernees.length === 0 || control.typesDeMachinesConcernees.includes(machine.type)
  );

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
          <CardContent className="pt-6 space-y-8">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Settings2 className="h-6 w-6 text-primary/80" />
              Configuration des Contrôles Métier
            </h2>

            {applicableControls.length === 0 && (
              <p className="text-muted-foreground">Aucun contrôle métier applicable n'est défini pour ce type de machine.</p>
            )}

            <div className="space-y-6">
              {applicableControls.map((control) => {
                const config = configurations[control.id] || { isActive: false, params: {}, sensorMappings: {} };
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
                                  placeholder={param.defaultValue !== undefined ? `Ex: ${param.defaultValue}`: ""}
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
                                tcLabel => tcLabel.toLowerCase().includes(variableId.split('_')[0])
                              ) || variableId;

                              const compatibleSensors = machine?.availableSensors?.filter(sensor =>
                                sensor.provides?.includes(variableId)
                              ) || [];

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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
