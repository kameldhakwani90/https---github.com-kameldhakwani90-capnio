
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select
import { DUMMY_CLIENT_SITES_DATA, type Site, DUMMY_ZONE_TYPES } from "@/lib/client-data.tsx"; 
import { ChevronLeft, PlusCircle, Layers } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AddZoneToSitePage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;

  const [zoneName, setZoneName] = useState("");
  const [selectedZoneTypeId, setSelectedZoneTypeId] = useState<string>("");
  const [site, setSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!siteId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    let foundSite: Site | undefined;
    function findSite(sites: Site[], id: string): Site | undefined {
        for (const s of sites) {
            if (s.id === id) return s;
            if (s.subSites) {
                const foundInSub = findSite(s.subSites, id);
                if (foundInSub) return foundInSub;
            }
        }
        return undefined;
    }
    foundSite = findSite(DUMMY_CLIENT_SITES_DATA, siteId);

    if (foundSite) {
      setSite(foundSite);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  }, [siteId]);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Adding zone to site:", siteId, { name: zoneName, zoneTypeId: selectedZoneTypeId });
    alert(`Zone "${zoneName}" (Type: ${DUMMY_ZONE_TYPES.find(zt => zt.id === selectedZoneTypeId)?.name || 'Non spécifié'}) added to site "${site?.name}" (simulated).`);
    // TODO: In a real app, update DUMMY_CLIENT_SITES_DATA or call an API
    // to add the new zone with its typeId
    router.push(`/client/assets/manage/${siteId}`); 
  };
  
  if (isLoading) {
    return <AppLayout><div className="p-6 text-center">Loading site data...</div></AppLayout>;
  }

  if (notFound || !site) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive">Site Not Found</h1>
          <p className="text-muted-foreground mb-4">The site you are trying to add a zone to does not exist.</p>
          <Button onClick={() => router.push(`/client/assets/manage/${siteId}`)} variant="outline">
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
          <Button variant="outline" onClick={() => router.push(`/client/assets/manage/${siteId}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to {site.name}
          </Button>
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Layers className="h-6 w-6 text-primary" />Ajouter une Nouvelle Zone à {site.name}</CardTitle>
            <CardDescription>Définissez une nouvelle zone (ex: cuisine, entrepôt, atelier) au sein de ce site.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="zoneName">Nom de la Zone *</Label>
                <Input 
                  id="zoneName" 
                  value={zoneName} 
                  onChange={(e) => setZoneName(e.target.value)} 
                  placeholder="e.g., Cuisine Principale, Entrepôt Froid"
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
                    <SelectItem value="">-- Aucun type spécifique --</SelectItem>
                    {DUMMY_ZONE_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Choisir un type peut aider à pré-configurer des contrôles et bonnes pratiques.</p>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">
                  <PlusCircle className="mr-2 h-4 w-4" /> Ajouter la Zone
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

