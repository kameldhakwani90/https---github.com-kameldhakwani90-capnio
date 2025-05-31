
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DUMMY_CLIENT_SITES_DATA, type Site, type Zone as FullZoneType, type Machine as FullMachineType } from "@/lib/client-data.tsx";
import { ChevronLeft, Save, HardDrive } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface MachineDetailsPageData {
    site?: Site;
    zone?: FullZoneType;
    machine?: FullMachineType;
}

function findMachineForEditing(siteIdPath: string, zoneIdPath: string, machineIdPath: string): MachineDetailsPageData {
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
    return { site: targetSite, zone: targetZone, machine };
}


export default function EditMachineDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const siteId = params.siteId as string;
  const zoneId = params.zoneId as string;
  const machineId = params.machineId as string;

  const [pageData, setPageData] = useState<MachineDetailsPageData>({});
  const [machineName, setMachineName] = useState("");
  const [machineType, setMachineType] = useState("");
  const [machineModel, setMachineModel] = useState("");
  const [machineNotes, setMachineNotes] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!siteId || !zoneId || !machineId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    
    const foundData = findMachineForEditing(siteId, zoneId, machineId);

    if (foundData.machine) {
      setPageData(foundData);
      setMachineName(foundData.machine.name);
      setMachineType(foundData.machine.type);
      setMachineModel(foundData.machine.model || "");
      setMachineNotes(foundData.machine.notes || "");
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  }, [siteId, zoneId, machineId]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!machineName.trim() || !machineType.trim()) {
        toast({ title: "Validation Error", description: "Machine name and type are required.", variant: "destructive" });
        return;
    }
    const updatedMachineData = {
      ...pageData.machine,
      id: machineId,
      name: machineName,
      type: machineType,
      model: machineModel,
      notes: machineNotes,
    };
    console.log("Updated machine details (simulated):", updatedMachineData);
    toast({
      title: "Machine Details Updated",
      description: `Details for "${machineName}" have been saved (simulation).`,
    });
    // In a real app, update DUMMY_CLIENT_SITES_DATA or call an API
    router.push(`/client/assets/manage-machine/${siteId}/${zoneId}/${machineId}`); 
  };
  
  if (isLoading) {
    return <AppLayout><div className="p-6 text-center">Loading machine details...</div></AppLayout>;
  }

  if (notFound || !pageData.machine) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive">Machine Not Found</h1>
          <p className="text-muted-foreground mb-4">The machine you are trying to edit does not exist.</p>
          <Button onClick={() => router.back()} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push(`/client/assets/manage-machine/${siteId}/${zoneId}/${machineId}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour à la gestion de {pageData.machine.name}
          </Button>
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
                <HardDrive className="h-6 w-6 text-primary"/>
                <CardTitle className="text-2xl">Modifier les Détails de la Machine</CardTitle>
            </div>
            <CardDescription>Machine: {pageData.machine.name} (ID: {machineId})</CardDescription>
            <CardDescription>Site: {pageData.site?.name} | Zone: {pageData.zone?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="machineName">Nom de la Machine *</Label>
                <Input 
                  id="machineName" 
                  value={machineName} 
                  onChange={(e) => setMachineName(e.target.value)} 
                  required 
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="machineType">Type de Machine *</Label>
                <Input 
                  id="machineType" 
                  value={machineType} 
                  onChange={(e) => setMachineType(e.target.value)} 
                  placeholder="Ex: Frigo, Compresseur, Serveur Pi"
                  required 
                />
                 <p className="text-xs text-muted-foreground">Doit correspondre à un type reconnu par les contrôles (voir admin).</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="machineModel">Modèle Spécifique (Optionnel)</Label>
                <Input 
                  id="machineModel" 
                  value={machineModel} 
                  onChange={(e) => setMachineModel(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machineNotes">Notes (Optionnel)</Label>
                <Textarea 
                  id="machineNotes" 
                  value={machineNotes}
                  onChange={(e) => setMachineNotes(e.target.value)} 
                  placeholder="Informations additionnelles, date de mise en service, etc."
                  rows={3}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg">
                  <Save className="mr-2 h-4 w-4" /> Sauvegarder les Modifications
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
