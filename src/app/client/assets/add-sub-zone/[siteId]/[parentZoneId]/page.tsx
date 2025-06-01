
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select
import { DUMMY_CLIENT_SITES_DATA, type Site, type Zone, DUMMY_ZONE_TYPES } from "@/lib/client-data.tsx"; 
import { ChevronLeft, PlusCircle, Layers } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const NO_TYPE_VALUE = "__NONE__";

function findSiteOrZone(sites: Site[], siteId: string, zoneId?: string): { site?: Site, zone?: Zone } {
    const site = sites.find(s => s.id === siteId);
    if (!site) { // Check top-level sites first
        for (const topSite of sites) { // If not found, check subSites recursively
            if(topSite.subSites) {
                const foundInSub = findSiteOrZone(topSite.subSites, siteId, zoneId);
                if (foundInSub.site) return foundInSub; // Return if site is found in subSite
            }
        }
        return {}; // Site not found at all
    }

    if (!zoneId) return { site }; // Site found, no zoneId to search

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
    const zone = findZoneRecursive(site.zones, zoneId);
    return { site, zone };
}


export default function AddSubZonePage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;
  const parentZoneId = params.parentZoneId as string;

  const [subZoneName, setSubZoneName] = useState("");
  const [selectedZoneTypeId, setSelectedZoneTypeId] = useState<string>(NO_TYPE_VALUE);
  const [parentSite, setParentSite] = useState<Site | null>(null);
  const [parentZone, setParentZone] = useState<Zone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!siteId || !parentZoneId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    
    const { site, zone } = findSiteOrZone(DUMMY_CLIENT_SITES_DATA, siteId, parentZoneId);

    if (site && zone) {
      setParentSite(site);
      setParentZone(zone);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  }, [siteId, parentZoneId]);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subZoneData = {
      name: subZoneName,
      zoneTypeId: selectedZoneTypeId === NO_TYPE_VALUE ? undefined : selectedZoneTypeId,
    };
    console.log(`Adding sub-zone to site "${parentSite?.name}", parent zone "${parentZone?.name}":`, subZoneData);
    alert(`Sous-zone "${subZoneName}" (Type: ${DUMMY_ZONE_TYPES.find(zt => zt.id === selectedZoneTypeId)?.name || 'Non spécifié'}) ajoutée à la zone "${parentZone?.name}" (simulation).`);
    // TODO: In a real app, update DUMMY_CLIENT_SITES_DATA or call an API
    // to add the new sub-zone with its typeId
    router.push(`/client/assets/manage/${siteId}/${parentZoneId}`); 
  };
  
  if (isLoading) {
    return <AppLayout><div className="p-6 text-center">Chargement des données...</div></AppLayout>;
  }

  if (notFound || !parentSite || !parentZone) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive">Site ou Zone Parent Non Trouvé</h1>
          <p className="text-muted-foreground mb-4">Le site ou la zone parente pour cette nouvelle sous-zone n'existe pas.</p>
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
          <Button variant="outline" onClick={() => router.push(`/client/assets/manage/${siteId}/${parentZoneId}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour à la gestion de {parentZone.name}
          </Button>
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
                <Layers className="h-6 w-6 text-primary"/>
                Ajouter une Sous-Zone à "{parentZone.name}"
            </CardTitle>
            <CardDescription>Définissez une nouvelle sous-zone (ex: chambre, section) à l'intérieur de la zone "{parentZone.name}" du site "{parentSite.name}".</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subZoneName">Nom de la Sous-Zone *</Label>
                <Input 
                  id="subZoneName" 
                  value={subZoneName} 
                  onChange={(e) => setSubZoneName(e.target.value)} 
                  placeholder="e.g., Chambre Froide A, Section Usinage B"
                  required 
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="zoneType">Type de Sous-Zone (Optionnel)</Label>
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
                <p className="text-xs text-muted-foreground">Choisir un type peut aider à pré-configurer des contrôles et bonnes pratiques.</p>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">
                  <PlusCircle className="mr-2 h-4 w-4" /> Ajouter la Sous-Zone
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
