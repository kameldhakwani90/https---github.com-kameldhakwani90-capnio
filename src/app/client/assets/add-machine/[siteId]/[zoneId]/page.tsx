
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DUMMY_CLIENT_SITES_DATA, type Site, type Zone } from "@/app/client/sites/[...sitePath]/page";
import { ChevronLeft, PlusCircle, Router, Wifi, CheckCircle, Settings, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

// Helper function to find a site and a specific zone within it
function findSiteAndZone(sites: Site[], siteId: string, zoneId: string): { site?: Site, zone?: Zone } {
  const site = sites.find(s => s.id === siteId);
  if (!site) return {};

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

export default function AddMachineToZonePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const siteId = params.siteId as string;
  const zoneId = params.zoneId as string;

  const [machineName, setMachineName] = useState("");
  const [machineModel, setMachineModel] = useState("");
  const [selectedMachineType, setSelectedMachineType] = useState<string>("generic"); // "generic" or "pi_server"
  
  // Pi Server Setup State
  const [piSetupStep, setPiSetupStep] = useState<"instructions" | "wifiConfig" | "confirmation">("instructions");
  const [piSsid, setPiSsid] = useState("");
  const [piPassword, setPiPassword] = useState("");
  const [piServerName, setPiServerName] = useState("");
  const [isConnectingPi, setIsConnectingPi] = useState(false);

  const [parentSite, setParentSite] = useState<Site | null>(null);
  const [parentZone, setParentZone] = useState<Zone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!siteId || !zoneId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    
    const { site, zone } = findSiteAndZone(DUMMY_CLIENT_SITES_DATA, siteId, zoneId);

    if (site && zone) {
      setParentSite(site);
      setParentZone(zone);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  }, [siteId, zoneId]);

  const handleGenericMachineSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!machineName.trim()) {
      toast({ title: "Validation Error", description: "Machine name is required.", variant: "destructive" });
      return;
    }
    console.log("Adding generic machine to site/zone:", siteId, zoneId, { name: machineName, model: machineModel });
    toast({ title: "Machine Ajoutée (Simulation)", description: `La machine "${machineName}" a été ajoutée à la zone "${parentZone?.name}".` });
    router.push(`/client/assets/manage/${siteId}`);
  };

  const handlePiInstructionsNext = () => {
    setPiSetupStep("wifiConfig");
  };

  const handlePiWifiConfigSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!piSsid.trim() || !piServerName.trim()) {
      toast({ title: "Validation Error", description: "Wi-Fi SSID and Pi Server Name are required.", variant: "destructive" });
      return;
    }
    setIsConnectingPi(true);
    console.log("Simulating Pi connection with data:", {
      ssid: piSsid,
      password: piPassword, // In a real app, be careful with password logging
      piName: piServerName,
      siteId,
      zoneId,
      siteName: parentSite?.name,
      zoneName: parentZone?.name,
    });
    
    setTimeout(() => {
      setIsConnectingPi(false);
      setPiSetupStep("confirmation");
      toast({ title: "Serveur Pi (Simulation)", description: `Le serveur Pi "${piServerName}" est en cours de liaison.` });
      
      setTimeout(() => {
        toast({ title: "Serveur Pi Lié (Simulation)", description: `Le serveur Pi "${piServerName}" a été lié à la zone "${parentZone?.name}". Redirection...` });
        router.push(`/client/assets/manage/${siteId}`);
      }, 2000); // Simulate registration and redirect
    }, 3000); // Simulate connection attempt
  };

  if (isLoading) {
    return <AppLayout><div className="p-6 text-center">Chargement des données...</div></AppLayout>;
  }

  if (notFound || !parentSite || !parentZone) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive">Site ou Zone Parent Non Trouvé</h1>
          <p className="text-muted-foreground mb-4">Le site ou la zone parente pour cette nouvelle machine n'existe pas.</p>
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
            <CardTitle className="text-2xl">Ajouter une Machine à "{parentZone.name}"</CardTitle>
            <CardDescription>Site: {parentSite.name} / Zone: {parentZone.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="machineTypeSelect">Type de Machine</Label>
              <Select value={selectedMachineType} onValueChange={setSelectedMachineType}>
                <SelectTrigger id="machineTypeSelect">
                  <SelectValue placeholder="Sélectionnez un type de machine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generic">
                    <Settings className="inline-block mr-2 h-4 w-4 text-muted-foreground" /> Machine Générique
                  </SelectItem>
                  <SelectItem value="pi_server">
                    <Router className="inline-block mr-2 h-4 w-4 text-muted-foreground" /> Serveur Pi Capnio
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedMachineType === "generic" && (
              <form onSubmit={handleGenericMachineSubmit} className="space-y-6 pt-4 border-t">
                <CardTitle className="text-lg">Détails de la Machine Générique</CardTitle>
                <div className="space-y-2">
                  <Label htmlFor="machineName">Nom de la Machine *</Label>
                  <Input 
                    id="machineName" 
                    value={machineName} 
                    onChange={(e) => setMachineName(e.target.value)} 
                    placeholder="e.g., Pompe P-101, Compresseur C-02"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="machineModel">Type / Modèle (Optionnel)</Label>
                  <Input 
                    id="machineModel" 
                    value={machineModel} 
                    onChange={(e) => setMachineModel(e.target.value)} 
                    placeholder="e.g., Atlas Copco GA 75, Frigo Industriel XYZ" 
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit">
                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter la Machine
                  </Button>
                </div>
              </form>
            )}

            {selectedMachineType === "pi_server" && (
              <div className="pt-4 border-t">
                {piSetupStep === "instructions" && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Router className="mr-2 h-5 w-5 text-primary" /> Étape 1: Préparation du Serveur Pi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <p>Suivez ces étapes pour commencer :</p>
                      <ol className="list-decimal list-inside space-y-1 pl-2">
                        <li>Branchez votre boîtier Pi à une prise électrique.</li>
                        <li>Attendez environ 30 secondes jusqu’à ce qu’un réseau Wi-Fi nommé <strong className="font-mono">Capnio_Setup_XXXX</strong> apparaisse.</li>
                        <li>Depuis votre téléphone ou ordinateur, connectez-vous à ce réseau Wi-Fi temporaire.</li>
                      </ol>
                      <div className="flex justify-end pt-3">
                        <Button onClick={handlePiInstructionsNext}>
                          Je suis connecté au Wi-Fi Capnio_Setup <ChevronLeft className="mr-0 ml-2 h-4 w-4 rotate-180" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {piSetupStep === "wifiConfig" && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Wifi className="mr-2 h-5 w-5 text-primary" /> Étape 2: Configuration du Wi-Fi Local
                      </CardTitle>
                      <CardDescription>
                        Ces informations permettront à votre Serveur Pi de se connecter à votre réseau Wi-Fi local et à Capnio.pro.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePiWifiConfigSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="piSsid">Nom du réseau Wi-Fi (SSID) *</Label>
                          <Input 
                            id="piSsid" 
                            value={piSsid} 
                            onChange={(e) => setPiSsid(e.target.value)} 
                            placeholder="Le nom de votre réseau Wi-Fi"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="piPassword">Mot de passe Wi-Fi</Label>
                          <Input 
                            id="piPassword" 
                            type="password" 
                            value={piPassword} 
                            onChange={(e) => setPiPassword(e.target.value)} 
                            placeholder="Laissez vide si pas de mot de passe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="piServerName">Nom du Serveur Pi *</Label>
                          <Input 
                            id="piServerName" 
                            value={piServerName} 
                            onChange={(e) => setPiServerName(e.target.value)} 
                            placeholder="Ex: Pi Cuisine Froide, Pi Atelier B"
                          />
                        </div>
                        <div className="space-y-1 text-sm">
                            <p className="font-medium">Sera lié à :</p>
                            <p className="text-muted-foreground">Site: {parentSite.name}</p>
                            <p className="text-muted-foreground">Zone: {parentZone.name}</p>
                        </div>
                        <div className="flex justify-end pt-3">
                          <Button type="submit" disabled={isConnectingPi}>
                            {isConnectingPi ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Wifi className="mr-2 h-4 w-4" />
                            )}
                            Lier et Connecter le Serveur Pi
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {piSetupStep === "confirmation" && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                       <CardTitle className="text-lg flex items-center">
                        <CheckCircle className="mr-2 h-5 w-5 text-green-500" /> Étape 3: Connexion et Enregistrement
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-3">
                      <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
                      <p className="text-lg font-medium">Le Serveur Pi est en cours de connexion à votre réseau et à Capnio.pro...</p>
                      <p className="text-muted-foreground">
                        Veuillez patienter. Vous serez redirigé automatiquement une fois le processus terminé.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

    