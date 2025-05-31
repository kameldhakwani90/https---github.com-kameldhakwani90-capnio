
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronRight, Home as HomeIcon, PackageOpen, Edit3, PlusCircle, Settings2, AlertTriangle, Trash2, Layers, Server, RadioTower, HardDrive, Thermometer, Zap, Wind } from "lucide-react"; 
import { 
    DUMMY_CLIENT_SITES_DATA, 
    type Site, 
    type Zone, 
    type Machine, 
    type Sensor,
    getZoneOverallStatus, 
    getSiteOverallStatus, 
    getStatusIcon,      
    getStatusText       
} from "@/app/client/sites/[...sitePath]/page"; 
import { cn } from "@/lib/utils";


interface FoundAssetInfo {
  asset: Site; 
  path: { id: string; name: string }[]; 
}

const findAssetByPath = (
  pathArray: string[],
  sites: Site[]
): FoundAssetInfo | undefined => {
  let currentSearchSpace = sites;
  let currentAsset: Site | undefined = undefined;
  const breadcrumbPath: { id: string; name: string }[] = [];

  for (const segment of pathArray) {
    const found = currentSearchSpace.find(s => s.id === segment);
    if (found) {
      currentAsset = found;
      breadcrumbPath.push({ id: found.id, name: found.name });
      currentSearchSpace = found.subSites || []; 
    } else {
      return undefined; 
    }
  }
  return currentAsset ? { asset: currentAsset, path: breadcrumbPath } : undefined;
};

const getMachineIcon = (type: string) => {
    if (type === "Frigo" || type === "Congélateur") return Thermometer;
    if (type === "Armoire Électrique" || type.toLowerCase().includes("elec")) return Zap;
    if (type === "Compresseur" || type === "Pompe Hydraulique" || type.toLowerCase().includes("hvac") || type.toLowerCase().includes("ventilation")) return Wind;
    if (type.toLowerCase().includes("serveur") || type.toLowerCase().includes("pc")) return Server;
    if (type.toLowerCase().includes("robot") || type.toLowerCase().includes("presse") || type.toLowerCase().includes("grue")) return Settings2;
    return HardDrive; // Default icon
};


const SubSiteCardDisplay: React.FC<{ site: Site; currentAssetPath: string[] }> = ({ site, currentAssetPath }) => {
  const siteStatus = getSiteOverallStatus(site); 
  const SiteOrSubSiteIcon = site.isConceptualSubSite ? Layers : HomeIcon;
  const href = `/client/assets/manage/${[...currentAssetPath, site.id].join('/')}`;

  return (
    <Link href={href} className="block group">
      <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col bg-card/90 hover:bg-card">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg mb-1 flex items-center gap-2 group-hover:text-primary transition-colors">
              <SiteOrSubSiteIcon className="h-5 w-5 text-primary" />
              {site.name}
            </CardTitle>
            <CardDescription>{site.location}</CardDescription>
          </div>
          <div className="flex flex-col items-end">
            {getStatusIcon(siteStatus, "h-6 w-6")}
            <span className={cn("text-xs font-semibold mt-1",
              siteStatus === 'red' ? 'text-red-600' :
              siteStatus === 'orange' ? 'text-orange-600' :
              siteStatus === 'green' ? 'text-green-600' : 'text-gray-500'
            )}>
              {getStatusText(siteStatus)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-xs text-muted-foreground">
            {site.zones.length} zone(s), {site.subSites?.length || 0} sous-site(s).
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

const MachineItemDisplay: React.FC<{ machine: Machine; siteId: string; zoneId: string; router: ReturnType<typeof useRouter>; allZoneSensors?: Sensor[]; }> = ({ machine, siteId, zoneId, router, allZoneSensors }) => {
    const CurrentMachineIcon = machine.icon || getMachineIcon(machine.type);
    const machineSensors = allZoneSensors?.filter(s => s.scope === 'machine' && s.affectedMachineIds?.includes(machine.id)) || [];
    
    const handleMachineAlertNavigation = (mId: string) => {
        router.push(`/client/machine-alerts/${mId}`);
    };
    const handleManageMachine = (mId: string) => {
        router.push(`/client/assets/manage-machine/${siteId}/${zoneId}/${mId}`);
    };

    return (
        <div className="flex justify-between items-center p-2.5 border rounded-md bg-background shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2">
                <CurrentMachineIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                    <p className="font-medium">{machine.name} <span className="text-xs text-muted-foreground">({machine.type})</span></p>
                    <div className="flex items-center gap-1 text-xs">
                        {getStatusIcon(machine.status, "h-4 w-4")}
                        <span className={cn(
                            machine.status === 'red' && 'text-red-600',
                            machine.status === 'orange' && 'text-orange-600',
                            machine.status === 'green' && 'text-green-600',
                            'font-medium'
                        )}>
                        {getStatusText(machine.status)}
                        </span>
                    </div>
                    {machineSensors.length > 0 && (
                        <div className="mt-1">
                            <span className="text-xs font-medium text-muted-foreground">Capteurs liés: </span>
                            {machineSensors.map((sensor, index) => (
                                <span key={sensor.id} className="text-xs text-muted-foreground italic">
                                    {sensor.name}{index < machineSensors.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1">
                {machine.status !== 'green' && machine.activeControlInAlert && (
                    <Button size="sm" variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 h-8 px-2" onClick={() => handleMachineAlertNavigation(machine.id)}>
                        <AlertTriangle className="mr-1 h-4 w-4" /> Alerte
                    </Button>
                )}
                <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => handleManageMachine(machine.id)}>
                    <Settings2 className="mr-1 h-4 w-4" /> Gérer
                </Button>
            </div>
        </div>
    );
};

const SensorItemDisplay: React.FC<{ sensor: Sensor; siteId: string; zoneId: string; router: ReturnType<typeof useRouter> }> = ({ sensor, siteId, zoneId, router }) => {
    const handleManageSensor = (sensorId: string) => {
        alert(`Gestion du capteur ${sensor.name} (ID: ${sensorId}) - Non implémenté`);
    };
    const handleDeleteSensor = (sensorId: string) => {
        alert(`Suppression du capteur ${sensor.name} (ID: ${sensorId}) - Non implémenté`);
    };

    return (
        <div className="flex justify-between items-center p-2.5 border rounded-md bg-background shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2">
                <RadioTower className="h-5 w-5 text-muted-foreground" />
                <div>
                    <p className="font-medium">{sensor.name}</p>
                    <p className="text-xs text-muted-foreground">Modèle: {sensor.typeModel} | Portée: {sensor.scope === 'zone' ? 'Ambiant (Zone)' : 'Machine'}</p>
                    {sensor.status && (
                         <div className="flex items-center gap-1 text-xs">
                            {getStatusIcon(sensor.status, "h-4 w-4")}
                            <span className={cn(
                                sensor.status === 'red' && 'text-red-600',
                                sensor.status === 'orange' && 'text-orange-600',
                                sensor.status === 'green' && 'text-green-600',
                                'font-medium'
                            )}>
                            {getStatusText(sensor.status)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => handleManageSensor(sensor.id)}>
                    <Settings2 className="mr-1 h-4 w-4" /> Gérer
                </Button>
                 <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive h-8 px-2" onClick={() => handleDeleteSensor(sensor.id)}>
                    <Trash2 className="mr-1 h-4 w-4" /> Suppr.
                </Button>
            </div>
        </div>
    );
};


interface ZoneItemForManagementProps {
  zone: Zone; 
  siteId: string; 
  parentZoneId?: string; 
  router: ReturnType<typeof useRouter>;
  level?: number;
}

const ZoneItemForManagement: React.FC<ZoneItemForManagementProps> = ({ zone, siteId, parentZoneId, router, level = 0 }) => {
    const zoneStatus = getZoneOverallStatus(zone); 
    const paddingLeft = level > 0 ? `${level * 1.5}rem` : '0'; 
    
    const ambientSensors = zone.sensors?.filter(s => s.scope === 'zone') || [];
    const hasMachines = zone.machines && zone.machines.length > 0;
    const hasAmbientSensors = ambientSensors.length > 0;
    const hasSubZones = zone.subZones && zone.subZones.length > 0;
    const isEmptyZoneOverall = !hasMachines && !hasAmbientSensors && !hasSubZones;

    return (
        <AccordionItem value={`${parentZoneId || siteId}-${zone.id}`} className="border-b bg-muted/30 rounded-md mb-2" style={{ marginLeft: paddingLeft }}>
            <AccordionTrigger className="py-3 px-4 hover:no-underline hover:bg-muted/50 rounded-t-md data-[state=open]:bg-muted/60 transition-colors">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary/80" /> 
                        <span className="font-medium text-md">{zone.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                        {getStatusIcon(zoneStatus, "h-5 w-5")}
                        <span className={cn(
                        zoneStatus === 'red' && 'text-red-600',
                        zoneStatus === 'orange' && 'text-orange-600',
                        zoneStatus === 'green' && 'text-green-600',
                        )}>
                        {getStatusText(zoneStatus)}
                        </span>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3 pt-2 space-y-3">
                <div className="flex flex-wrap justify-end gap-2 my-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/client/assets/edit-zone/${siteId}/${zone.id}`)}><Edit3 className="mr-1 h-3 w-3" /> Modifier Zone</Button>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/client/assets/add-sub-zone/${siteId}/${zone.id}`)}><PlusCircle className="mr-1 h-3 w-3" /> Ajouter Sous-Zone</Button>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/client/assets/add-machine/${siteId}/${zone.id}`)}><PlusCircle className="mr-1 h-3 w-3" /> Ajouter Machine</Button>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/client/assets/add-sensor/${siteId}/${zone.id}`)}><PlusCircle className="mr-1 h-3 w-3" /> Ajouter Capteur</Button>
                    <Button variant="destructive" size="sm" onClick={() => router.push(`/client/assets/delete-zone/${siteId}/${zone.id}`)}><Trash2 className="mr-1 h-3 w-3" /> Supprimer Zone</Button>
                </div>
                
                {isEmptyZoneOverall ? (
                    <p className="text-sm text-muted-foreground p-2 text-center">Aucune machine, sous-zone ou capteur d'ambiance défini.</p>
                ) : (
                    <Accordion type="multiple" className="w-full space-y-1.5 mt-3">
                        {hasMachines && (
                            <AccordionItem value={`machines-${zone.id}`} className="border-none rounded-md bg-background/50">
                                <AccordionTrigger className="py-2 px-3 text-sm font-medium hover:bg-muted/40 rounded-t-md">
                                    Machines ({zone.machines.length})
                                </AccordionTrigger>
                                <AccordionContent className="p-2 space-y-1.5">
                                    {zone.machines.map(machine => (
                                       <MachineItemDisplay key={machine.id} machine={machine} siteId={siteId} zoneId={zone.id} router={router} allZoneSensors={zone.sensors} />
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {hasAmbientSensors && (
                             <AccordionItem value={`ambient-sensors-${zone.id}`} className="border-none rounded-md bg-background/50">
                                <AccordionTrigger className="py-2 px-3 text-sm font-medium hover:bg-muted/40 rounded-t-md">
                                    Capteurs Ambiants (Zone) ({ambientSensors.length})
                                </AccordionTrigger>
                                <AccordionContent className="p-2 space-y-1.5">
                                    {ambientSensors.map(sensor => (
                                       <SensorItemDisplay key={sensor.id} sensor={sensor} siteId={siteId} zoneId={zone.id} router={router} />
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {hasSubZones && (
                          <AccordionItem value={`sub-zones-${zone.id}`} className="border-none rounded-md bg-background/50">
                            <AccordionTrigger className="py-2 px-3 text-sm font-medium hover:bg-muted/40 rounded-t-md">
                                Sous-Zones ({zone.subZones!.length})
                            </AccordionTrigger>
                            <AccordionContent className="p-0"> 
                                <Accordion type="multiple" className="w-full space-y-1.5 pt-1">
                                  {zone.subZones!.map(subZone => (
                                    <ZoneItemForManagement 
                                      key={subZone.id} 
                                      zone={subZone} 
                                      siteId={siteId} 
                                      parentZoneId={zone.id} 
                                      router={router} 
                                      level={level + 1} 
                                    />
                                  ))}
                                </Accordion>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                    </Accordion>
                )}
            </AccordionContent>
        </AccordionItem>
    );
};


export default function ManageAssetPage() {
  const params = useParams();
  const router = useRouter();
  const { assetPath } = params as { assetPath: string[] }; 

  const [currentAssetInfo, setCurrentAssetInfo] = React.useState<FoundAssetInfo | null | undefined>(undefined);

  React.useEffect(() => {
    if (assetPath && Array.isArray(assetPath) && assetPath.length > 0) {
      const found = findAssetByPath(assetPath, DUMMY_CLIENT_SITES_DATA);
      setCurrentAssetInfo(found || null);
    } else {
      setCurrentAssetInfo(null); 
    }
  }, [assetPath]);

  if (currentAssetInfo === undefined) {
    return (
      <AppLayout>
        <div className="p-6 text-center text-lg font-semibold">Chargement des détails de l'actif...</div>
      </AppLayout>
    );
  }

  if (!currentAssetInfo) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-destructive">Actif Non Trouvé</h1>
          <p className="text-muted-foreground">L'actif que vous essayez de gérer n'existe pas ou le chemin est incorrect.</p>
          <Button onClick={() => router.push('/assets')} className="mt-6">
            Retour à la Gestion des Actifs
          </Button>
        </div>
      </AppLayout>
    );
  }

  const { asset: currentAsset, path: breadcrumbPath } = currentAssetInfo;
  const SiteOrSubSiteIcon = currentAsset.isConceptualSubSite ? Layers : HomeIcon;

  const generateBreadcrumbUrl = (index: number) => {
    const pathSegments = breadcrumbPath.slice(0, index + 1).map(p => p.id);
    return `/client/assets/manage/${pathSegments.join('/')}`;
  };

  const handleEditSiteDetails = () => {
    router.push(`/client/assets/edit-site/${currentAsset.id}`);
  };

  const handleAddZoneToSite = () => { 
    router.push(`/client/assets/add-zone/${currentAsset.id}`);
  };

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
                <Link href={generateBreadcrumbUrl(index)} className="hover:text-primary font-medium">
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
                    <SiteOrSubSiteIcon className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle className="text-3xl">{currentAsset.name}</CardTitle>
                        <CardDescription className="text-md">{currentAsset.location}</CardDescription>
                    </div>
                </div>
                <Button variant="outline" size="lg" onClick={handleEditSiteDetails}>
                    <Edit3 className="mr-2 h-5 w-5" /> Modifier les Détails du Site
                </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            
            <section>
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h2 className="text-2xl font-semibold flex items-center gap-2"><Layers className="h-6 w-6 text-primary/70"/>Zones</h2>
                <Button variant="outline" onClick={handleAddZoneToSite}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Zone au Site
                </Button>
              </div>
              {currentAsset.zones && currentAsset.zones.length > 0 ? (
                <Accordion type="multiple" className="w-full space-y-2">
                  {currentAsset.zones.map(zone => (
                    <ZoneItemForManagement 
                      key={zone.id} 
                      zone={zone} 
                      siteId={currentAsset.id} 
                      router={router} 
                      level={0}
                    />
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-6 bg-muted/40 rounded-md">
                    <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-2"/>
                    <p className="text-muted-foreground">Aucune zone définie pour ce site.</p>
                </div>
              )}
            </section>
            
            {currentAsset.subSites && currentAsset.subSites.length > 0 && (
              <section>
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <h2 className="text-2xl font-semibold flex items-center gap-2"><SiteOrSubSiteIcon className="h-6 w-6 text-primary/70" />Sous-Sites / Bâtiments</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                  {currentAsset.subSites.map(subSite => (
                    <SubSiteCardDisplay key={subSite.id} site={subSite} currentAssetPath={assetPath} />
                  ))}
                </div>
              </section>
            )}

            <section className="pt-6 border-t">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold flex items-center gap-2"><Settings2 className="h-6 w-6 text-primary/70" />Contrôles au Niveau du Site</h2>
                    <Button variant="outline" onClick={() => alert(`Configuration des contrôles pour ${currentAsset.name} (Non implémenté)`)}>
                        <Settings2 className="mr-2 h-4 w-4" /> Configurer les Contrôles
                    </Button>
                </div>
                 <p className="text-sm text-muted-foreground mt-2">Gérer les contrôles et paramètres généraux applicables à l'ensemble du site.</p>
            </section>

          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

