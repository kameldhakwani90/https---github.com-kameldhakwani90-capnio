
"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DUMMY_ZONE_TYPES, type Site, type Zone, findAssetById } from "@/lib/client-data.tsx";
import { ChevronLeft, Save, Layers } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const NO_TYPE_VALUE = "__NONE__";

export default function EditZoneDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const rootSiteId = params.rootSiteId as string;
  const zoneId = params.zoneId as string;

  const [zoneName, setZoneName] = useState("");
  const [selectedZoneTypeId, setSelectedZoneTypeId] = useState<string>(NO_TYPE_VALUE);
  
  const [currentZone, setCurrentZone] = useState<Zone | null>(null);
  const [currentRootSite, setCurrentRootSite] = useState<Site | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!rootSiteId || !zoneId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    const zoneAsset = findAssetById(zoneId);
    const siteAsset = findAssetById(rootSiteId);

    if (zoneAsset && zoneAsset.machines !== undefined && siteAsset && siteAsset.zones !== undefined) { // Check if it's a Zone and Site
      const zone = zoneAsset as Zone;
      const site = siteAsset as Site;
      setCurrentZone(zone);
      setCurrentRootSite(site);
      setZoneName(zone.name);
      setSelectedZoneTypeId(zone.zoneTypeId || NO_TYPE_VALUE);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  }, [rootSiteId, zoneId]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!zoneName.trim()) {
      toast({ title: "Validation Error", description: "Zone name is required.", variant: "destructive" });
      return;
    }

    const updatedZoneData = {
      ...currentZone,
      id: zoneId,
      name: zoneName,
      zoneTypeId: selectedZoneTypeId === NO_TYPE_VALUE ? undefined : selectedZoneTypeId,
    };

    console.log("Updated zone details (simulated):", updatedZoneData);
    // In a real app, update DUMMY_CLIENT_SITES_DATA or call an API
    toast({
      title: "Zone Details Updated",
      description: `Details for zone "${zoneName}" have been saved (simulation).`,
    });
    // Navigate back to the asset management page, constructing the path up to the zone
    // This might need adjustment if the zone is a sub-sub-zone. For simplicity, assume it's a direct zone of rootSite for this nav.
    // A more robust way would be to reconstruct the full path.
    router.push(`/client/assets/manage/${rootSiteId}/${zoneId}`); 
  };
  
  if (isLoading) {
    return <AppLayout><div className="p-6 text-center">Loading zone details...</div></AppLayout>;
  }

  if (notFound || !currentZone || !currentRootSite) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive">Zone or Root Site Not Found</h1>
          <p className="text-muted-foreground mb-1">Root Site ID: {rootSiteId}</p>
          <p className="text-muted-foreground mb-4">Zone ID: {zoneId}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  const parentContext = currentRootSite.name; // Simplified, could be a parent zone name in deeper nesting

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour à la gestion des actifs
          </Button>
        </div>
        <Card className="shadow-xl">
          <CardHeader>
             <div className="flex items-center gap-2">
                <Layers className="h-6 w-6 text-primary"/>
                <CardTitle className="text-2xl">Modifier les Détails de la Zone</CardTitle>
            </div>
            <CardDescription>Zone: {currentZone.name} (ID: {zoneId})</CardDescription>
            <CardDescription>Fait partie de: {parentContext}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="zoneName">Nom de la Zone *</Label>
                <Input 
                  id="zoneName" 
                  value={zoneName} 
                  onChange={(e) => setZoneName(e.target.value)} 
                  required 
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="zoneType">Type de Zone (Optionnel)</Label>
                <Select value={selectedZoneTypeId} onValueChange={setSelectedZoneTypeId}>
                  <SelectTrigger id="zoneType">
                    <SelectValue placeholder="Sélectionnez un type de zone..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_TYPE_VALUE}>-- Aucun type spécifique --</SelectItem>
                    {DUMMY_ZONE_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Choisir un type peut aider à pré-configurer des bonnes pratiques.</p>
              </div>
              
              {/* Add other editable fields for a zone if necessary, e.g., custom description */}

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
