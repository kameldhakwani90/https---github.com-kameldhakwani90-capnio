
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronRight, Layers, Edit3, PlusCircle, Trash2, PackageOpen, Info, HardDrive, RadioTower, ListChecks, Settings2, ExternalLink, BarChart3, Activity, AlertTriangle } from "lucide-react"; 
import { 
    DUMMY_CLIENT_SITES_DATA, 
    DUMMY_ZONE_TYPES,
    type Site, 
    type Zone, 
    type Machine, 
    type Sensor,
    type BreadcrumbSegment,
    findZoneDataForManagePage,
    getZoneOverallStatus, 
    getStatusIcon,      
    getStatusText,
    getMachineIcon,
    getZoneIcon,
    countTotalMachinesInZone,
    countAmbientSensorsInZone,
    countSubZonesInZone,
} from "@/lib/client-data.tsx"; 
import { cn } from "@/lib/utils";

interface FoundZonePageData {
  zone: Zone;
  breadcrumbPath: BreadcrumbSegment[];
  parentSite: Site;
}

const MachineRow: React.FC<{ machine: Machine; rootSiteId: string; zoneId: string; }> = ({ machine, rootSiteId, zoneId }) => {
  const router = useRouter();
  const MachineIcon = getMachineIcon(machine.type);
  return (
    <TableRow className="hover:bg-muted/20">
      <TableCell><MachineIcon className="h-5 w-5 text-muted-foreground" /></TableCell>
      <TableCell className="font-medium">{machine.name}</TableCell>
      <TableCell>{machine.type}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {getStatusIcon(machine.status, "h-4 w-4")}
          {getStatusText(machine.status)}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/client/assets/manage-machine/${rootSiteId}/${zoneId}/${machine.id}`)}>
          Gérer <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

const SubZoneRow: React.FC<{ subZone: Zone; rootSiteId: string; currentZonePath: string; }> = ({ subZone, rootSiteId, currentZonePath }) => {
  const router = useRouter();
  const SubZoneIcon = getZoneIcon(subZone.zoneTypeId);
  const subZoneType = DUMMY_ZONE_TYPES.find(zt => zt.id === subZone.zoneTypeId);
  const subZoneStatus = getZoneOverallStatus(subZone);

  return (
    <TableRow className="hover:bg-muted/20">
      <TableCell><SubZoneIcon className="h-5 w-5 text-muted-foreground" /></TableCell>
      <TableCell className="font-medium">{subZone.name}</TableCell>
      <TableCell>{subZoneType?.name || 'N/A'}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {getStatusIcon(subZoneStatus, "h-4 w-4")}
          {getStatusText(subZoneStatus)}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/client/assets/manage-zone/${rootSiteId}/${currentZonePath}/${subZone.id}`)}>
          Explorer <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

const AmbientSensorRow: React.FC<{ sensor: Sensor; }> = ({ sensor }) => {
  return (
    <TableRow className="hover:bg-muted/20">
      <TableCell><RadioTower className="h-5 w-5 text-muted-foreground" /></TableCell>
      <TableCell className="font-medium">{sensor.name}</TableCell>
      <TableCell>{sensor.typeModel}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {getStatusIcon(sensor.status || 'white', "h-4 w-4")}
          {getStatusText(sensor.status || 'white')}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => alert(`Gestion du capteur ambiant ${sensor.name} (non implémenté)`)}>
          Gérer <Settings2 className="ml-1 h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};


export default function ManageZonePage() {
  const params = useParams();
  const router = useRouter();
  
  const rootSiteId = params.rootSiteId as string;
  // zonePath from URL is an array if it has multiple segments, or string if single segment
  const zonePathArray = Array.isArray(params.zonePath) ? params.zonePath : [params.zonePath];

  const [zonePageData, setZonePageData] = React.useState<FoundZonePageData | null | undefined>(undefined);

  React.useEffect(() => {
    if (rootSiteId && zonePathArray && zonePathArray.length > 0) {
      const foundData = findZoneDataForManagePage(rootSiteId, zonePathArray);
      setZonePageData(foundData || null);
    } else {
      setZonePageData(null);
    }
  }, [rootSiteId, zonePathArray]);


  if (zonePageData === undefined) {
    return (
      <AppLayout>
        <div className="p-6 text-center text-lg font-semibold">Chargement des détails de la zone...</div>
      </AppLayout>
    );
  }

  if (!zonePageData) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-destructive">Zone Non Trouvée</h1>
          <p className="text-muted-foreground">La zone que vous essayez de gérer n'existe pas ou le chemin est incorrect.</p>
          <Button onClick={() => router.push('/assets')} className="mt-6">
            Retour à la Gestion des Actifs
          </Button>
        </div>
      </AppLayout>
    );
  }

  const { zone, breadcrumbPath, parentSite } = zonePageData;
  const zoneStatus = getZoneOverallStatus(zone);
  const CurrentZoneIcon = getZoneIcon(zone.zoneTypeId);
  const zoneTypeDetails = DUMMY_ZONE_TYPES.find(zt => zt.id === zone.zoneTypeId);
  const currentZonePathForLinks = breadcrumbPath.slice(1).map(p => p.id).join('/');

  const handleDeleteZone = () => {
    alert(`Suppression de la zone "${zone.name}" (non implémenté).`);
    // Potentially navigate up: router.push(breadcrumbPath[breadcrumbPath.length - 2]?.path || '/assets');
  }

  const bestPracticesChecklist = zoneTypeDetails?.bestPracticesContent?.split('\n').filter(line => line.trim() !== '') || [];


  return (
    <AppLayout>
      <div className="space-y-6">
        <nav className="flex items-center space-x-1.5 text-sm text-muted-foreground mb-4 bg-muted p-3 rounded-md shadow-sm">
          <Link href="/assets" className="hover:text-primary font-medium">Gestion des Actifs</Link>
          {breadcrumbPath.map((segment, index) => (
            <React.Fragment key={segment.id}>
              <ChevronRight className="h-4 w-4" />
              {index === breadcrumbPath.length - 1 ? (
                <span className="font-semibold text-foreground">{segment.name}</span>
              ) : (
                <Link href={segment.path} className="hover:text-primary font-medium">
                  {segment.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        <Card className="shadow-xl">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CurrentZoneIcon className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle className="text-3xl">{zone.name}</CardTitle>
                        <CardDescription className="text-md">
                            {zoneTypeDetails ? `Type: ${zoneTypeDetails.name}` : 'Type non spécifié'} | Dans: {breadcrumbPath[breadcrumbPath.length - 2]?.name || parentSite.name}
                        </CardDescription>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                    {getStatusIcon(zoneStatus, "h-6 w-6")}
                    <span className={cn(
                    zoneStatus === 'red' && 'text-red-600',
                    zoneStatus === 'orange' && 'text-orange-600',
                    zoneStatus === 'green' && 'text-green-600',
                    'font-semibold text-lg'
                    )}>
                    {getStatusText(zoneStatus)}
                    </span>
                </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="flex flex-wrap justify-start w-full gap-1 p-1 mb-4 rounded-md bg-muted">
                <TabsTrigger value="overview"><Info className="mr-1 h-4 w-4 md:mr-2"/>Vue d'Ensemble</TabsTrigger>
                <TabsTrigger value="machines"><HardDrive className="mr-1 h-4 w-4 md:mr-2"/>Machines</TabsTrigger>
                <TabsTrigger value="subzones"><Layers className="mr-1 h-4 w-4 md:mr-2"/>Sous-Zones</TabsTrigger>
                <TabsTrigger value="ambientSensors"><RadioTower className="mr-1 h-4 w-4 md:mr-2"/>Capteurs Ambiants</TabsTrigger>
                <TabsTrigger value="bestPractices"><ListChecks className="mr-1 h-4 w-4 md:mr-2"/>Bonnes Pratiques</TabsTrigger>
                <TabsTrigger value="zoneControls"><Settings2 className="mr-1 h-4 w-4 md:mr-2"/>Contrôles (Zone)</TabsTrigger>
                <TabsTrigger value="zoneEvents"><Activity className="mr-1 h-4 w-4 md:mr-2"/>Événements (Zone)</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Actions Rapides</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => router.push(`/client/assets/edit-zone/${rootSiteId}/${zone.id}`)}><Edit3 className="mr-2 h-4 w-4" /> Modifier la Zone</Button>
                    <Button variant="outline" onClick={() => router.push(`/client/assets/add-machine/${rootSiteId}/${zone.id}`)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter Machine</Button>
                    <Button variant="outline" onClick={() => router.push(`/client/assets/add-sub-zone/${rootSiteId}/${zone.id}`)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter Sous-Zone</Button>
                    <Button variant="outline" onClick={() => router.push(`/client/assets/add-sensor/${rootSiteId}/${zone.id}`)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter Capteur</Button>
                    <Button variant="destructive" onClick={handleDeleteZone}><Trash2 className="mr-2 h-4 w-4" /> Supprimer la Zone</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Statistiques de la Zone</CardTitle></CardHeader>
                  <CardContent className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-muted rounded-lg">
                        <HardDrive className="h-8 w-8 mx-auto mb-2 text-primary"/>
                        <p className="text-3xl font-bold">{countTotalMachinesInZone(zone)}</p>
                        <p className="text-sm text-muted-foreground">Machine(s)</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                        <Layers className="h-8 w-8 mx-auto mb-2 text-primary"/>
                        <p className="text-3xl font-bold">{countSubZonesInZone(zone)}</p>
                        <p className="text-sm text-muted-foreground">Sous-Zone(s)</p>
                    </div>
                     <div className="p-4 bg-muted rounded-lg">
                        <RadioTower className="h-8 w-8 mx-auto mb-2 text-primary"/>
                        <p className="text-3xl font-bold">{countAmbientSensorsInZone(zone)}</p>
                        <p className="text-sm text-muted-foreground">Capteur(s) Ambiant(s)</p>
                    </div>
                  </CardContent>
                </Card>
                 {zone.activeZoneControlInAlert && (
                        <Card className="border-destructive">
                            <CardHeader>
                                <CardTitle className="text-destructive flex items-center"><AlertTriangle className="mr-2 h-5 w-5"/> Alerte Active pour la Zone</CardTitle>
                                <CardDescription>{zone.activeZoneControlInAlert.controlName}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>{zone.activeZoneControlInAlert.alertDetails}</p>
                                {/* TODO: Add button to view zone alert details page if created */}
                            </CardContent>
                        </Card>
                    )}
              </TabsContent>

              <TabsContent value="machines">
                <Card>
                  <CardHeader>
                    <CardTitle>Machines dans {zone.name}</CardTitle>
                    <CardDescription>Liste des machines présentes dans cette zone.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {zone.machines.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">Icône</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {zone.machines.map(m => <MachineRow key={m.id} machine={m} rootSiteId={rootSiteId} zoneId={zone.id} />)}
                        </TableBody>
                      </Table>
                    ) : <p className="text-muted-foreground">Aucune machine dans cette zone.</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subzones">
                 <Card>
                    <CardHeader>
                        <CardTitle>Sous-Zones de {zone.name}</CardTitle>
                        <CardDescription>Liste des sous-zones directes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(zone.subZones && zone.subZones.length > 0) ? (
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Icône</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {zone.subZones.map(sz => <SubZoneRow key={sz.id} subZone={sz} rootSiteId={rootSiteId} currentZonePath={currentZonePathForLinks} />)}
                            </TableBody>
                        </Table>
                        ) : <p className="text-muted-foreground">Aucune sous-zone définie ici.</p>}
                    </CardContent>
                 </Card>
              </TabsContent>

              <TabsContent value="ambientSensors">
                 <Card>
                    <CardHeader>
                        <CardTitle>Capteurs Ambiants de {zone.name}</CardTitle>
                        <CardDescription>Capteurs surveillant l'environnement général de cette zone.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(zone.sensors && zone.sensors.filter(s => s.scope === 'zone').length > 0) ? (
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Icône</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Modèle</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {zone.sensors.filter(s => s.scope === 'zone').map(s => <AmbientSensorRow key={s.id} sensor={s} />)}
                            </TableBody>
                        </Table>
                        ) : <p className="text-muted-foreground">Aucun capteur ambiant défini pour cette zone.</p>}
                    </CardContent>
                 </Card>
              </TabsContent>

              <TabsContent value="bestPractices">
                <Card>
                    <CardHeader>
                        <CardTitle>{zoneTypeDetails?.bestPracticesTitle || `Bonnes Pratiques pour ${zone.name}`}</CardTitle>
                         {zoneTypeDetails && <CardDescription>Recommandations pour le type de zone : {zoneTypeDetails.name}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        {bestPracticesChecklist.length > 0 ? (
                            <div className="space-y-3">
                                {bestPracticesChecklist.map((item, index) => (
                                    <div key={`bp-item-${index}`} className="flex items-start space-x-3 p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors">
                                        <Checkbox id={`bp-chk-${index}`} className="mt-1" />
                                        <div className="grid gap-1.5 leading-snug">
                                        <Label htmlFor={`bp-chk-${index}`} className="font-medium text-sm cursor-pointer">
                                          {item.startsWith('- ') || item.startsWith('* ') ? item.substring(2) : item}
                                        </Label>
                                        {/* Potential for sub-text or actions in the future */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ): <p className="text-muted-foreground">Aucune bonne pratique spécifique définie pour ce type de zone ou le contenu n'est pas formaté en liste.</p>}
                    </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="zoneControls">
                <Card>
                    <CardHeader><CardTitle>Configuration des Contrôles de Zone (Ambiant)</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Cette section permettra de configurer des contrôles spécifiques à l'ambiance de la zone {zone.name}. Fonctionnalité à venir.</p>
                    </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="zoneEvents">
                <Card>
                    <CardHeader><CardTitle>Journal d'Événements pour la Zone {zone.name}</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Historique des événements spécifiques à cette zone. Fonctionnalité à venir.</p>
                    </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

