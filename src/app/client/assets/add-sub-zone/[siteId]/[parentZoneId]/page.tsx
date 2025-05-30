
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DUMMY_CLIENT_SITES_DATA, type Site, type Zone } from "@/app/client/sites/[...sitePath]/page";
import { ChevronLeft, PlusCircle, Layers } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// Helper function to find a site or zone (could be moved to a shared util)
function findSiteOrZone(sites: Site[], siteId: string, zoneId?: string): { site?: Site, zone?: Zone } {
    const site = sites.find(s => s.id === siteId);
    if (!site) return {};

    if (!zoneId) return { site };

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
    // Simulate adding sub-zone
    console.log(`Adding sub-zone to site "${parentSite?.name}", parent zone "${parentZone?.name}":`, { name: subZoneName });
    alert(`Sous-zone "${subZoneName}" ajoutée à la zone "${parentZone?.name}" (simulation).`);
    // Typically, you'd update your data source here.
    // For now, navigate back to the manage page of the parent site.
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
          <Button variant="outline" onClick={() => router.push(`/client/assets/manage/${siteId}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour à la gestion de {parentSite.name}
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
                <Label htmlFor="subZoneName">Nom de la Sous-Zone</Label>
                <Input 
                  id="subZoneName" 
                  value={subZoneName} 
                  onChange={(e) => setSubZoneName(e.target.value)} 
                  placeholder="e.g., Chambre Froide A, Section Usinage B"
                  required 
                />
              </div>
              {/* Add more fields for sub-zone details as needed */}
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

    