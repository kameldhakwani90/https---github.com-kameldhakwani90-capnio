
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { DUMMY_CLIENT_SITES_DATA, type Site, type Zone, type Machine } from "@/lib/client-data"; // Updated import
import { ChevronLeft, PlusCircle, Router as PiIcon, Thermometer, Zap, Wind, Cog } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

const DUMMY_ADMIN_DEFINED_SENSOR_TYPES = [
  { id: "st-001", name: "Sonde Ambiante THL v2.1 (Temp/Hum)" },
  { id: "st-002", name: "Capteur de Pression P-500" },
  { id: "st-003", name: "Détecteur CO2 Z-Air" },
  { id: "st-004", name: "Capteur de Courant Monophasé CM-100" },
  { id: "st-005", name: "Capteur de Vibration VibraSense M" },
];

const DUMMY_AVAILABLE_PI_SERVERS = [
  { id: "pi-001", name: "Pi Serveur - Local Technique" },
  { id: "pi-002", name: "Pi Serveur - Atelier A" },
  { id: "pi-003", name: "Pi Serveur - Entrepôt Principal" },
];

function findSiteAndZoneMachines(sites: Site[], siteId: string, zoneId: string): { site?: Site, zone?: Zone, machines: Machine[] } {
  const site = sites.find(s => s.id === siteId);
  if (!site) return { machines: [] };

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
  targetZone = findZoneRecursive(site.zones, zoneId);
  return { site, zone: targetZone, machines: targetZone?.machines || [] };
}

export default function AddSensorToZonePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const siteId = params.siteId as string;
  const zoneId = params.zoneId as string;

  const [sensorName, setSensorName] = useState("");
  const [selectedPiServer, setSelectedPiServer] = useState<string>("");
  const [selectedAdminSensorType, setSelectedAdminSensorType] = useState<string>("");
  const [sensorScope, setSensorScope] = useState<"zone" | "machine">("zone");
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);

  const [parentSite, setParentSite] = useState<Site | null>(null);
  const [parentZone, setParentZone] = useState<Zone | null>(null);
  const [availableMachinesInZone, setAvailableMachinesInZone] = useState<Machine[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!siteId || !zoneId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    
    const { site, zone, machines } = findSiteAndZoneMachines(DUMMY_CLIENT_SITES_DATA, siteId, zoneId);

    if (site && zone) {
      setParentSite(site);
      setParentZone(zone);
      setAvailableMachinesInZone(machines);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  }, [siteId, zoneId]);

  const handleMachineSelection = (machineId: string, checked: boolean | "indeterminate") => {
    if (typeof checked === 'boolean') {
        setSelectedMachines(prev =>
        checked ? [...prev, machineId] : prev.filter(id => id !== machineId)
        );
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sensorName.trim()) {
      toast({ title: "Erreur de validation", description: "Le nom du capteur est requis.", variant: "destructive" });
      return;
    }
    if (!selectedAdminSensorType) {
      toast({ title: "Erreur de validation", description: "Le type de capteur (modèle) est requis.", variant: "destructive" });
      return;
    }
    if (sensorScope === "machine" && selectedMachines.length === 0) {
      toast({ title: "Erreur de validation", description: "Veuillez sélectionner au moins une machine si le capteur est affecté à des machines.", variant: "destructive" });
      return;
    }

    const sensorData = {
      name: sensorName,
      piServerId: selectedPiServer === "__NONE__" ? "" : selectedPiServer,
      adminSensorTypeId: selectedAdminSensorType,
      scope: sensorScope,
      affectedMachineIds: sensorScope === "machine" ? selectedMachines : [],
      siteId,
      zoneId,
      siteName: parentSite?.name,
      zoneName: parentZone?.name,
    };

    console.log("Déclaration du nouveau capteur (simulation):", sensorData);
    toast({ 
      title: "Capteur Déclaré (Simulation)", 
      description: `Le capteur "${sensorName}" a été ajouté à la zone "${parentZone?.name}".` 
    });
    router.push(`/client/assets/manage/${siteId}`);
  };
  
  if (isLoading) {
    return <AppLayout><div className="p-6 text-center">Chargement des données...</div></AppLayout>;
  }

  if (notFound || !parentSite || !parentZone) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive">Site ou Zone Parent Non Trouvé</h1>
          <p className="text-muted-foreground mb-4">Le site ou la zone parente pour ce nouveau capteur n'existe pas.</p>
          <Button onClick={() => router.push(`/client/assets/manage/${siteId}`)} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour à la gestion du site
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl py-8">
         <div className="mb-6">
          <Button variant="outline" onClick={() => router.push(`/client/assets/manage/${siteId}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour à la gestion de {parentSite.name}
          </Button>
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
                <Cog className="h-6 w-6 text-primary"/>
                Déclarer un Nouveau Capteur dans "{parentZone.name}"
            </CardTitle>
            <CardDescription>Site: {parentSite.name} / Zone: {parentZone.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sensorName">Nom du capteur *</Label>
                <Input 
                  id="sensorName" 
                  value={sensorName} 
                  onChange={(e) => setSensorName(e.target.value)} 
                  placeholder="Ex: Capteur Température Ambiante Entrée"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="piServer">Serveur Pi associé (Optionnel)</Label>
                <Select value={selectedPiServer} onValueChange={setSelectedPiServer}>
                  <SelectTrigger id="piServer">
                    <SelectValue placeholder="Sélectionnez un serveur Pi..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__NONE__">-- Aucun --</SelectItem>
                    {DUMMY_AVAILABLE_PI_SERVERS.map(pi => (
                      <SelectItem key={pi.id} value={pi.id}>{pi.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <p className="text-xs text-muted-foreground">Si ce capteur est connecté via un serveur Pi Capnio.pro.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminSensorType">Type de capteur (Modèle admin) *</Label>
                <Select value={selectedAdminSensorType} onValueChange={setSelectedAdminSensorType}>
                  <SelectTrigger id="adminSensorType">
                    <SelectValue placeholder="Sélectionnez un type de capteur..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DUMMY_ADMIN_DEFINED_SENSOR_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Basé sur les types déclarés par l'administrateur.</p>
              </div>

              <div className="space-y-2">
                <Label>Ce capteur est : *</Label>
                <RadioGroup value={sensorScope} onValueChange={(value: "zone" | "machine") => setSensorScope(value)} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="zone" id="scope-zone" />
                    <Label htmlFor="scope-zone">Ambiant (pour la zone)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="machine" id="scope-machine" />
                    <Label htmlFor="scope-machine">Affecté à une/des machine(s)</Label>
                  </div>
                </RadioGroup>
              </div>

              {sensorScope === "machine" && (
                <div className="space-y-2 pt-2 border-t">
                  <Label>Machines concernées *</Label>
                  {availableMachinesInZone.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 p-3 border rounded-md max-h-48 overflow-y-auto">
                      {availableMachinesInZone.map(machine => (
                        <div key={machine.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`machine-${machine.id}`}
                            checked={selectedMachines.includes(machine.id)}
                            onCheckedChange={(checked) => handleMachineSelection(machine.id, checked)}
                          />
                          <Label htmlFor={`machine-${machine.id}`} className="font-normal text-sm">
                            {machine.name} ({machine.type})
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">Aucune machine n'est définie dans cette zone pour l'instant.</p>
                  )}
                </div>
              )}
              
              <div className="flex justify-end pt-4">
                <Button type="submit">
                  <PlusCircle className="mr-2 h-4 w-4" /> Déclarer le Capteur
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
