
"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DUMMY_CLIENT_SITES_DATA, type Site, type Zone, type Machine as FullMachineType, type Status } from "@/app/client/sites/[...sitePath]/page"; // Import full structure for finding machine
import { ChevronLeft, Save, Settings2, HardDrive, Server } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Thermometer, Zap, Wind } from "lucide-react"; // Example icons for machines

// --- Data Structures (Simulated for this page) ---

// Simplified Machine Type for this page's context
interface Machine extends FullMachineType {
  availableSensors?: Array<{ id: string; name: string; provides: string[] }>; // e.g., provides: ['temp', 'humidity']
  configuredControls?: Record<string, ConfiguredControl>;
}

interface ConfiguredControl {
  isActive: boolean;
  params: Record<string, any>; // e.g., { seuil_min: 5, seuil_max: 30 }
  sensorMappings: Record<string, string>; // e.g., { temp: 'sensor-id-123', humidity: 'sensor-id-456' }
}

interface ControlParameter {
  id: string;
  label: string;
  type: 'number' | 'text' | 'boolean'; // Add more types as needed
  defaultValue?: any;
}

interface AdminControl {
  id: string;
  nomDuControle: string;
  typesDeMachinesConcernees: string[];
  typesDeCapteursNecessaires: string[]; // Labels, e.g., ["Température", "Courant"]
  variablesUtilisees: string[]; // System variable IDs, e.g., ["temp", "current"]
  formuleDeCalcul?: string;
  formuleDeVerification: string;
  description: string;
  expectedParams?: ControlParameter[];
}

// Dummy Admin Defined Controls (copied and adapted from admin section)
const DUMMY_ADMIN_CONTROLS: AdminControl[] = [
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
    typesDeMachinesConcernees: ["Moteur Principal", "Pompe Hydraulique", "Compresseur"],
    typesDeCapteursNecessaires: ["Tension", "Courant"],
    variablesUtilisees: ["tension", "courant", "conso"],
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
];

// Function to find a machine by its ID within the full sites data structure
function findMachineFromGlobalData(siteId: string, zoneId: string, machineId: string): Machine | undefined {
    const site = DUMMY_CLIENT_SITES_DATA.find(s => s.id === siteId || s.subSites?.some(sub => sub.id === siteId)); // Check top-level or sub-sites
    let targetSite = site;
    if (!targetSite && site?.subSites) {
        targetSite = site.subSites.find(s => s.id === siteId);
    }
    if (!targetSite) return undefined;

    let targetZone: Zone | undefined;
    function findZoneRecursive(zones: Zone[], id: string): Zone | undefined {
        for (const z of zones) {
            if (z.id === id) return z;
            if (z.subZones) {
                const foundInSub = findZoneRecursive(z.subZones, id);
                if (foundInSub) return foundInSub;
            }
        }
        return undefined;
    }
    targetZone = findZoneRecursive(targetSite.zones, zoneId);
    if (!targetZone) return undefined;

    const machine = targetZone.machines.find(m => m.id === machineId);
    
    // Augment machine with simulated available sensors and default configuredControls if not present
    if (machine) {
        const augmentedMachine: Machine = { ...machine };
        if (!augmentedMachine.availableSensors) {
            // Simulate some available sensors based on machine type
            if (augmentedMachine.type === "Frigo" || augmentedMachine.type === "Congélateur") {
                augmentedMachine.availableSensors = [
                    { id: `${machine.id}-temp-sensor`, name: `Sonde Température ${machine.name}`, provides: ["temp"] },
                    { id: `${machine.id}-door-sensor`, name: `Contacteur Porte ${machine.name}`, provides: ["door_status"] },
                ];
            } else if (augmentedMachine.type === "Compresseur") {
                 augmentedMachine.availableSensors = [
                    { id: `${machine.id}-pressure-sensor`, name: `Sonde Pression ${machine.name}`, provides: ["pression_huile", "pressure"] },
                    { id: `${machine.id}-current-sensor`, name: `Capteur Courant ${machine.name}`, provides: ["courant"] },
                    { id: `${machine.id}-voltage-sensor`, name: `Capteur Tension ${machine.name}`, provides: ["tension"] },
                ];
            } else {
                 augmentedMachine.availableSensors = [
                    { id: `${machine.id}-generic-sensor`, name: `Capteur Générique ${machine.name}`, provides: ["value"] },
                 ];
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

  const [machine, setMachine] = useState<Machine | null>(null);
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
      // Initialize configurations from machine's existing configuredControls or defaults
      const initialConfigs: Record<string, ConfiguredControl> = {};
      DUMMY_ADMIN_CONTROLS.forEach(control => {
        const existingConfig = foundMachine.configuredControls?.[control.id];
        initialConfigs[control.id] = {
          isActive: existingConfig?.isActive || false,
          params: { ...existingConfig?.params }, // Initialize with existing or empty
          sensorMappings: { ...existingConfig?.sensorMappings }, // Initialize with existing or empty
        };
        // Pre-fill default param values if not set
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
        ...(prev[controlId] || { params: {}, sensorMappings: {} }),
        isActive,
      },
    }));
  };

  const handleParamChange = (controlId: string, paramId: string, value: any, type: ControlParameter['type']) => {
    let processedValue = value;
    if (type === 'number') {
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) processedValue = ''; // Or some default/error state
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

  const handleSensorMappingChange = (controlId: string, variableId: string, sensorId: string) => {
    setConfigurations(prev => ({
      ...prev,
      [controlId]: {
        ...(prev[controlId]!),
        sensorMappings: {
          ...(prev[controlId]!.sensorMappings),
          [variableId]: sensorId === "__NONE__" ? "" : sensorId,
        },
      },
    }));
  };

  const handleSaveConfiguration = () => {
    console.log("Saving machine control configurations:", { machineId, configurations });
    // Here you would typically update DUMMY_CLIENT_SITES_DATA or send to a backend
    // For simulation, we just log it.
    toast({
      title: "Configuration Sauvegardée",
      description: `Les configurations des contrôles pour ${machine?.name} ont été sauvegardées (simulation).`,
    });
    router.push(`/client/assets/manage/${siteId}/${zoneId}`); // Navigate back to zone or site
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

  const applicableControls = DUMMY_ADMIN_CONTROLS.filter(control =>
    control.typesDeMachinesConcernees.length === 0 || control.typesDeMachinesConcernees.includes(machine.type)
  );
  
  const getMachineIcon = (type: string) => {
    if (type === "Frigo" || type === "Congélateur") return Thermometer;
    if (type === "Armoire Électrique") return Zap;
    if (type === "Compresseur" || type === "Pompe Hydraulique" || type === "HVAC") return Wind;
    if (type === "Serveur") return Server;
    return HardDrive;
  };
  const MachineIcon = getMachineIcon(machine.type);


  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push(`/client/assets/manage/${siteId}/${zoneId}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour à la zone
          </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
                <MachineIcon className="h-8 w-8 text-primary" />
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
                        {/* Paramètres du Contrôle */}
                        {control.expectedParams && control.expectedParams.length > 0 && (
                          <div className="space-y-3 p-3 border rounded-md bg-background">
                            <h4 className="text-md font-semibold text-muted-foreground">Paramètres Spécifiques :</h4>
                            {control.expectedParams.map(param => (
                              <div key={param.id} className="space-y-1">
                                <Label htmlFor={`${control.id}-${param.id}`}>{param.label}</Label>
                                <Input
                                  id={`${control.id}-${param.id}`}
                                  type={param.type === 'number' ? 'number' : 'text'}
                                  value={config.params[param.id] || ''}
                                  onChange={(e) => handleParamChange(control.id, param.id, e.target.value, param.type)}
                                  placeholder={param.defaultValue !== undefined ? `Ex: ${param.defaultValue}`: ""}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Mappage des Capteurs */}
                        {control.variablesUtilisees && control.variablesUtilisees.length > 0 && (
                           <div className="space-y-3 p-3 border rounded-md bg-background">
                            <h4 className="text-md font-semibold text-muted-foreground">Mappage des Capteurs Requis :</h4>
                            {control.variablesUtilisees.map(variableId => {
                              // Find the label for this system variable (e.g., "Température" for "temp")
                              // This requires a mapping from system variable ID to a human-readable label
                              // For now, we'll just use the ID. Ideally, typesDeCapteursNecessaires should be more structured.
                              const variableLabel = control.typesDeCapteursNecessaires.find(
                                tc => tc.toLowerCase().includes(variableId.split('_')[0]) // crude match
                              ) || variableId;

                              const compatibleSensors = machine?.availableSensors?.filter(sensor =>
                                sensor.provides.includes(variableId)
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
                                            {sensor.name} (Fournit: {sensor.provides.join(', ')})
                                          </SelectItem>
                                        ))
                                      ) : (
                                        <SelectItem value="__DISABLED__" disabled>Aucun capteur compatible disponible</SelectItem>
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
              <Button size="lg" onClick={handleSaveConfiguration}>
                <Save className="mr-2 h-5 w-5" />
                Sauvegarder la Configuration des Contrôles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

    