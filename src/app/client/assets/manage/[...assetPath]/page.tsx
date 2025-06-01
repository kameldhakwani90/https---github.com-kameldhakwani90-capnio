
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronRight, Home as HomeIcon, PackageOpen, Edit3, PlusCircle, Settings2, AlertTriangle, Trash2, Layers, Server, RadioTower, HardDrive, Thermometer, Zap, Wind, Info } from "lucide-react"; 
import { 
    DUMMY_CLIENT_SITES_DATA, 
    type Site, 
    type Zone, 
    type Machine, 
    type Sensor,
    getZoneOverallStatus, 
    getSiteOverallStatus, 
    getStatusIcon,      
    getStatusText,
    getMachineIcon,
    DUMMY_ZONE_TYPES // Import zone types
} from "@/lib/client-data.tsx"; 
import { cn } from "@/lib/utils";

interface BreadcrumbSegment {
  id: string;
  name: string;
  type: 'site' | 'zone';
}

interface FoundAssetInfo {
  asset: Site | Zone;
  assetType: 'site' | 'zone';
  breadcrumbPath: BreadcrumbSegment[];
  rootSiteId: string; 
}

const findAssetInHierarchy = (
  pathArray: string[],
  topLevelSites: Site[]
): FoundAssetInfo | undefined => {
  if (!pathArray || pathArray.length === 0) return undefined;

  const rootSiteId = pathArray[0];
  let currentAsset: Site | Zone | undefined = topLevelSites.find(s => s.id === rootSiteId);
  if (!currentAsset) return undefined;

  const breadcrumbPath: BreadcrumbSegment[] = [{ id: currentAsset.id, name: currentAsset.name, type: 'site' }];
  let currentAssetType: 'site' | 'zone' = 'site';

  for (let i = 1; i < pathArray.length; i++) {
    const segmentId = pathArray[i];
    if (currentAssetType === 'site') {
      const site = currentAsset as Site;
      let nextAsset: Site | Zone | undefined = site.subSites?.find(ss => ss.id === segmentId);
      if (nextAsset) {
        currentAsset = nextAsset;
        currentAssetType = 'site';
        breadcrumbPath.push({ id: nextAsset.id, name: nextAsset.name, type: 'site' });
        continue;
      }
      nextAsset = site.zones?.find(z => z.id === segmentId);
      if (nextAsset) {
        currentAsset = nextAsset;
        currentAssetType = 'zone';
        breadcrumbPath.push({ id: nextAsset.id, name: nextAsset.name, type: 'zone' });
        continue;
      }
      return undefined; 
    } else { 
      const zone = currentAsset as Zone;
      const nextSubZone = zone.subZones?.find(sz => sz.id === segmentId);
      if (nextSubZone) {
        currentAsset = nextSubZone;
        currentAssetType = 'zone'; 
        breadcrumbPath.push({ id: nextSubZone.id, name: nextSubZone.name, type: 'zone' });
        continue;
      }
      return undefined; 
    }
  }
  return currentAsset ? { asset: currentAsset, assetType: currentAssetType, breadcrumbPath, rootSiteId } : undefined;
};


const SubSiteCardDisplay: React.FC<{ subSite: Site; currentAssetPathSegments: string[] }> = ({ subSite, currentAssetPathSegments }) => {
  const siteStatus = getSiteOverallStatus(subSite); 
  const SiteOrSubSiteIcon = subSite.isConceptualSubSite ? Layers : HomeIcon;
  const href = `/client/assets/manage/${[...currentAssetPathSegments, subSite.id].join('/')}`;

  return (
    <Link href={href} className="block group">
      <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col bg-card/90 hover:bg-card">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg mb-1 flex items-center gap-2 group-hover:text-primary transition-colors">
              <SiteOrSubSiteIcon className="h-5 w-5 text-primary" />
              {subSite.name}
            </CardTitle>
            <CardDescription>{subSite.location}</CardDescription>
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
            {subSite.zones.length} zone(s), {subSite.subSites?.length || 0} sous-site(s).
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
    const handleManageSensor = (sensorId: string, sensorName: string) => {
        alert(`Gestion du capteur ambiant "${sensorName}" (ID: ${sensorId}) - Fonctionnalité de gestion détaillée non implémentée pour le moment.`);
    };
    const handleDeleteSensor = (sensorId: string, sensorName: string) => {
        alert(`Suppression du capteur ambiant "${sensorName}" (ID: ${sensorId}) - Non implémenté.`);
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
                <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => handleManageSensor(sensor.id, sensor.name)}>
                    <Settings2 className="mr-1 h-4 w-4" /> Gérer
                </Button>
                 <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive h-8 px-2" onClick={() => handleDeleteSensor(sensor.id, sensor.name)}>
                    <Trash2 className="mr-1 h-4 w-4" /> Suppr.
                </Button>
            </div>
        </div>
    );
};


interface ZoneItemForManagementProps {
  zone: Zone; 
  rootSiteId: string; 
  currentPathSegments: string[]; 
  router: ReturnType<typeof useRouter>;
  level?: number;
}

const ZoneItemForManagement: React.FC<ZoneItemForManagementProps> = ({ zone, rootSiteId, currentPathSegments, router, level = 0 }) => {
    const zoneStatus = getZoneOverallStatus(zone); 
    const paddingLeft = level > 0 ? `${level * 1.5}rem` : '0'; 
    
    const ambientSensors = zone.sensors?.filter(s => s.scope === 'zone') || [];
    const hasMachines = zone.machines && zone.machines.length > 0;
    const hasAmbientSensors = ambientSensors.length > 0;
    const hasSubZones = zone.subZones && zone.subZones.length > 0;
    const isEmptyZoneOverall = !hasMachines && !hasAmbientSensors && !hasSubZones;

    const zoneNavLink = `/client/assets/manage/${[...currentPathSegments, zone.id].join('/')}`;
    const zoneTypeInfo = DUMMY_ZONE_TYPES.find(zt => zt.id === zone.zoneTypeId);

    return (
        <AccordionItem value={`${currentPathSegments.join('-')}-${zone.id}`} className="border-b bg-muted/30 rounded-md mb-2" style={{ marginLeft: paddingLeft }}>
            <AccordionTrigger className="py-3 px-4 hover:no-underline hover:bg-muted/50 rounded-t-md data-[state=open]:bg-muted/60 transition-colors">
                <div className="flex items-center justify-between w-full">
                    <Link href={zoneNavLink} className="flex items-center gap-2 group" onClick={(e) => { e.preventDefault(); router.push(zoneNavLink); }}>
                        <Layers className="h-5 w-5 text-primary/80 group-hover:text-primary" />
                        <div>
                          <span className="font-medium text-md group-hover:text-primary group-hover:underline">{zone.name}</span>
                          {zoneTypeInfo && <p className="text-xs text-muted-foreground group-hover:text-primary/80">{zoneTypeInfo.name}</p>}
                        </div>
                    </Link>
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
                {zoneTypeInfo && (
                    <Card className="bg-blue-50 border-blue-200 my-2 shadow-sm">
                        <CardHeader className="pb-2 pt-3">
                            <CardTitle className="text-sm font-semibold text-blue-700 flex items-center"><Info className="h-4 w-4 mr-2"/>Bonnes Pratiques: {zoneTypeInfo.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-blue-600">
                            <p>{zoneTypeInfo.bestPractices}</p>
                        </CardContent>
                    </Card>
                )}
                <div className="flex flex-wrap justify-end items-center gap-2 my-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/client/assets/edit-zone/${rootSiteId}/${zone.id}`)}><Edit3 className="mr-1 h-3 w-3" /> Modifier Zone</Button>
                    
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/client/assets/add-sub-zone/${rootSiteId}/${zone.id}`)}><PlusCircle className="mr-1 h-3 w-3" /> Ajouter Sous-Zone</Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><Info className="h-4 w-4 text-muted-foreground" /></Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 text-sm">
                                <h4 className="font-medium leading-none mb-1">Qu'est-ce qu'une Sous-Zone ?</h4>
                                <p className="text-muted-foreground mb-2">Une sous-zone détaille encore plus une zone existante, utile pour des suivis très localisés.</p>
                                <p className="font-semibold mb-1">Exemples :</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                                    <li>Dans "Cuisine" (restaurant): "Poste Froid", "Plonge".</li>
                                    <li>Dans "Rayon Frais" (magasin): "Étagère Produits Laitiers".</li>
                                    <li>Dans "Ligne d'Assemblage" (usine): "Poste Contrôle Qualité".</li>
                                </ul>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/client/assets/add-machine/${rootSiteId}/${zone.id}`)}><PlusCircle className="mr-1 h-3 w-3" /> Ajouter Machine</Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><Info className="h-4 w-4 text-muted-foreground" /></Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 text-sm">
                                <h4 className="font-medium leading-none mb-1">Qu'est-ce qu'une Machine ?</h4>
                                <p className="text-muted-foreground mb-2">Une machine est un équipement spécifique à surveiller (Réfrigérateur, Four, Pompe, etc.) ou un "Serveur Pi Capnio" qui collecte des données.</p>
                                <p className="font-semibold mb-1">Exemples :</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                                    <li>Machine Générique: "Vitrine Réfrigérée N°3", "Compresseur Atlas C10".</li>
                                    <li>Serveur Pi: "Boîtier Pi - Cuisine", "Collecteur Pi - Atelier B".</li>
                                </ul>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/client/assets/add-sensor/${rootSiteId}/${zone.id}`)}><PlusCircle className="mr-1 h-3 w-3" /> Ajouter Capteur</Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><Info className="h-4 w-4 text-muted-foreground" /></Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 text-sm">
                                <h4 className="font-medium leading-none mb-1">Qu'est-ce qu'un Capteur ?</h4>
                                <p className="text-muted-foreground mb-2">Un capteur mesure des données (température, humidité, etc.). Déclarez-le ici en choisissant son type et son emplacement (ambiant ou sur machine).</p>
                                <p className="font-semibold mb-1">Exemples :</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                                    <li>Sonde de température pour frigo.</li>
                                    <li>Capteur de CO2 pour qualité de l'air.</li>
                                </ul>
                            </PopoverContent>
                        </Popover>
                    </div>
                    
                    <Button variant="destructive" size="sm" onClick={() => alert(`Suppression de la zone ${zone.name} non implémentée.`)}><Trash2 className="mr-1 h-3 w-3" /> Supprimer Zone</Button>
                </div>
                
                {isEmptyZoneOverall ? (
                    <p className="text-sm text-muted-foreground p-2 text-center">Aucune machine, sous-zone ou capteur d'ambiance défini.</p>
                ) : (
                    <Accordion type="multiple" className="w-full space-y-1.5 mt-3" defaultValue={['machines', 'ambient-sensors', 'sub-zones']}>
                        {hasMachines && (
                            <AccordionItem value={`machines-${zone.id}`} className="border-none rounded-md bg-background/50">
                                <AccordionTrigger className="py-2 px-3 text-sm font-medium hover:bg-muted/40 rounded-t-md">
                                    Machines ({zone.machines.length})
                                </AccordionTrigger>
                                <AccordionContent className="p-2 space-y-1.5">
                                    {zone.machines.map(machine => (
                                       <MachineItemDisplay key={machine.id} machine={machine} siteId={rootSiteId} zoneId={zone.id} router={router} allZoneSensors={zone.sensors} />
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
                                       <SensorItemDisplay key={sensor.id} sensor={sensor} siteId={rootSiteId} zoneId={zone.id} router={router} />
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
                                <Accordion type="multiple" className="w-full space-y-1.5 pt-1"  defaultValue={zone.subZones!.map(sz => `${currentPathSegments.join('-')}-${zone.id}-${sz.id}`)}>
                                  {zone.subZones!.map(subZone => (
                                    <ZoneItemForManagement 
                                      key={subZone.id} 
                                      zone={subZone} 
                                      rootSiteId={rootSiteId} 
                                      currentPathSegments={[...currentPathSegments, zone.id]}
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
  const { assetPath: urlAssetPath } = params as { assetPath: string[] }; 

  const [currentAssetInfo, setCurrentAssetInfo] = React.useState<FoundAssetInfo | null | undefined>(undefined);

  React.useEffect(() => {
    if (urlAssetPath && Array.isArray(urlAssetPath) && urlAssetPath.length > 0) {
      const found = findAssetInHierarchy(urlAssetPath, DUMMY_CLIENT_SITES_DATA);
      setCurrentAssetInfo(found || null);
    } else {
      setCurrentAssetInfo(null); 
    }
  }, [urlAssetPath]);

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

  const { asset, assetType, breadcrumbPath, rootSiteId } = currentAssetInfo;
  const AssetIcon = assetType === 'site' ? ((asset as Site).isConceptualSubSite ? Layers : HomeIcon) : Layers;

  const generateBreadcrumbUrl = (index: number) => {
    const pathSegments = breadcrumbPath.slice(0, index + 1).map(p => p.id);
    return `/client/assets/manage/${pathSegments.join('/')}`;
  };

  const handleEditAssetDetails = () => {
    if (assetType === 'site') {
      router.push(`/client/assets/edit-site/${asset.id}`);
    } else { 
      router.push(`/client/assets/edit-zone/${rootSiteId}/${asset.id}`);
    }
  };

  const handleAddPrimaryZoneOrSubZone = () => { 
    if (assetType === 'site') {
      router.push(`/client/assets/add-zone/${asset.id}`);
    } else { 
       router.push(`/client/assets/add-sub-zone/${rootSiteId}/${asset.id}`);
    }
  };
  
  const mainCardTitle = asset.name;
  const mainCardDescription = assetType === 'site' ? (asset as Site).location : `Zone de ${breadcrumbPath.length > 1 ? breadcrumbPath[breadcrumbPath.length - 2].name : DUMMY_CLIENT_SITES_DATA.find(s=>s.id ===rootSiteId)?.name}`;
  const currentZoneTypeInfo = assetType === 'zone' ? DUMMY_ZONE_TYPES.find(zt => zt.id === (asset as Zone).zoneTypeId) : null;
  
  const addZoneButtonLabel = assetType === 'site' ? "Ajouter une Zone au Site" : "Ajouter une Sous-Zone";
  const addZonePopoverTitle = assetType === 'site' ? "Qu'est-ce qu'une Zone ?" : "Qu'est-ce qu'une Sous-Zone ?";
  const addZonePopoverExplanation = assetType === 'site' 
    ? "Une zone vous permet de diviser un site en sections plus petites pour une meilleure organisation et surveillance." 
    : "Une sous-zone affine davantage une zone existante, utile pour des suivis très localisés.";
  const addZonePopoverExamples = assetType === 'site' 
    ? [
        "Pour un magasin: Rayon Boulangerie, Réserve Fraîche.",
        "Pour un restaurant: Cuisine, Salle Principale.",
        "Pour une usine: Ligne d'Emballage, Atelier Maintenance."
      ] 
    : [
        "Dans 'Cuisine' (restaurant): Poste Froid, Plonge.",
        "Dans 'Rayon Frais' (magasin): Étagère Produits Laitiers.",
        "Dans 'Ligne d'Assemblage' (usine): Poste Contrôle Qualité."
      ];


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
                    <AssetIcon className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle className="text-3xl">{mainCardTitle}</CardTitle>
                        <CardDescription className="text-md">{mainCardDescription}</CardDescription>
                        {currentZoneTypeInfo && assetType === 'zone' && (
                             <CardDescription className="text-sm text-blue-600 mt-1">Type: {currentZoneTypeInfo.name}</CardDescription>
                        )}
                    </div>
                </div>
                <Button variant="outline" size="lg" onClick={handleEditAssetDetails}>
                    <Edit3 className="mr-2 h-5 w-5" /> Modifier les Détails
                </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            
            {assetType === 'site' && (
              <>
                <section>
                  <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <h2 className="text-2xl font-semibold flex items-center gap-2"><Layers className="h-6 w-6 text-primary/70"/>Zones</h2>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleAddPrimaryZoneOrSubZone}>
                        <PlusCircle className="mr-2 h-4 w-4" /> {addZoneButtonLabel}
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" aria-label="Information sur les Zones/Sous-Zones"><Info className="h-4 w-4" /></Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 text-sm">
                                <h4 className="font-medium leading-none mb-1">{addZonePopoverTitle}</h4>
                                <p className="text-muted-foreground mb-2">{addZonePopoverExplanation}</p>
                                <p className="font-semibold mb-1">Exemples :</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                                    {addZonePopoverExamples.map((ex, i) => <li key={i}>{ex}</li>)}
                                </ul>
                            </PopoverContent>
                        </Popover>
                    </div>
                  </div>
                  {(asset as Site).zones && (asset as Site).zones.length > 0 ? (
                    <Accordion type="multiple" className="w-full space-y-2" defaultValue={(asset as Site).zones.map(z => `${currentAssetInfo.asset.id}-${z.id}`)}>
                      {(asset as Site).zones.map(zone => (
                        <ZoneItemForManagement 
                          key={zone.id} 
                          zone={zone} 
                          rootSiteId={rootSiteId} 
                          currentPathSegments={breadcrumbPath.map(b => b.id)} 
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
                
                {(asset as Site).subSites && (asset as Site).subSites.length > 0 && (
                  <section>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                        <h2 className="text-2xl font-semibold flex items-center gap-2"><HomeIcon className="h-6 w-6 text-primary/70" />Sous-Sites / Bâtiments</h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                      {(asset as Site).subSites!.map(subSite => (
                        <SubSiteCardDisplay key={subSite.id} subSite={subSite} currentAssetPathSegments={breadcrumbPath.map(b => b.id)} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {assetType === 'zone' && (
              <section>
                 <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <h2 className="text-2xl font-semibold">Contenu de la Zone: {asset.name}</h2>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleAddPrimaryZoneOrSubZone}>
                        <PlusCircle className="mr-2 h-4 w-4" /> {addZoneButtonLabel}
                        </Button>
                        <Popover>
                             <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" aria-label="Information sur les Zones/Sous-Zones"><Info className="h-4 w-4" /></Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 text-sm">
                                <h4 className="font-medium leading-none mb-1">{addZonePopoverTitle}</h4>
                                <p className="text-muted-foreground mb-2">{addZonePopoverExplanation}</p>
                                <p className="font-semibold mb-1">Exemples :</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                                    {addZonePopoverExamples.map((ex, i) => <li key={i}>{ex}</li>)}
                                </ul>
                            </PopoverContent>
                        </Popover>
                    </div>
                  </div>
                  {currentZoneTypeInfo && (
                      <Card className="bg-blue-50 border-blue-200 my-4 shadow-sm">
                          <CardHeader className="pb-2 pt-3">
                              <CardTitle className="text-base font-semibold text-blue-700 flex items-center"><Info className="h-5 w-5 mr-2"/>Focus: {currentZoneTypeInfo.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm text-blue-600">
                              <p>{currentZoneTypeInfo.bestPractices}</p>
                          </CardContent>
                      </Card>
                  )}
                  <div className="px-4 pb-3 pt-2 space-y-3">
                    <div className="flex flex-wrap justify-end items-center gap-2 my-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/client/assets/edit-zone/${rootSiteId}/${asset.id}`)}><Edit3 className="mr-1 h-3 w-3" /> Modifier Zone</Button>
                        
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" onClick={() => router.push(`/client/assets/add-machine/${rootSiteId}/${asset.id}`)}><PlusCircle className="mr-1 h-3 w-3" /> Ajouter Machine</Button>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7"><Info className="h-4 w-4 text-muted-foreground" /></Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 text-sm">
                                    <h4 className="font-medium leading-none mb-1">Qu'est-ce qu'une Machine ?</h4>
                                    <p className="text-muted-foreground mb-2">Une machine est un équipement spécifique à surveiller (Réfrigérateur, Four, Pompe, etc.) ou un "Serveur Pi Capnio" qui collecte des données.</p>
                                    <p className="font-semibold mb-1">Exemples :</p>
                                    <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                                        <li>Machine Générique: "Vitrine Réfrigérée N°3", "Compresseur Atlas C10".</li>
                                        <li>Serveur Pi: "Boîtier Pi - Cuisine", "Collecteur Pi - Atelier B".</li>
                                    </ul>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" onClick={() => router.push(`/client/assets/add-sensor/${rootSiteId}/${asset.id}`)}><PlusCircle className="mr-1 h-3 w-3" /> Ajouter Capteur</Button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7"><Info className="h-4 w-4 text-muted-foreground" /></Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 text-sm">
                                    <h4 className="font-medium leading-none mb-1">Qu'est-ce qu'un Capteur ?</h4>
                                    <p className="text-muted-foreground mb-2">Un capteur mesure des données (température, humidité, etc.). Déclarez-le ici en choisissant son type et son emplacement (ambiant ou sur machine).</p>
                                    <p className="font-semibold mb-1">Exemples :</p>
                                    <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                                        <li>Sonde de température pour frigo.</li>
                                        <li>Capteur de CO2 pour qualité de l'air.</li>
                                    </ul>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => alert(`Suppression de la zone ${asset.name} non implémentée.`)}><Trash2 className="mr-1 h-3 w-3" /> Supprimer Zone</Button>
                    </div>
                    
                    <Accordion type="multiple" className="w-full space-y-1.5 mt-3" defaultValue={['machines', 'ambient-sensors', 'sub-zones']}>
                        {(asset as Zone).machines && (asset as Zone).machines.length > 0 && (
                            <AccordionItem value={`machines-${asset.id}`} className="border-none rounded-md bg-background/50">
                                <AccordionTrigger className="py-2 px-3 text-sm font-medium hover:bg-muted/40 rounded-t-md">
                                    Machines ({(asset as Zone).machines.length})
                                </AccordionTrigger>
                                <AccordionContent className="p-2 space-y-1.5">
                                    {(asset as Zone).machines.map(machine => (
                                       <MachineItemDisplay key={machine.id} machine={machine} siteId={rootSiteId} zoneId={asset.id} router={router} allZoneSensors={(asset as Zone).sensors} />
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {((asset as Zone).sensors?.filter(s => s.scope === 'zone') || []).length > 0 && (
                             <AccordionItem value={`ambient-sensors-${asset.id}`} className="border-none rounded-md bg-background/50">
                                <AccordionTrigger className="py-2 px-3 text-sm font-medium hover:bg-muted/40 rounded-t-md">
                                    Capteurs Ambiants (Zone) ({((asset as Zone).sensors?.filter(s => s.scope === 'zone') || []).length})
                                </AccordionTrigger>
                                <AccordionContent className="p-2 space-y-1.5">
                                    {(asset as Zone).sensors?.filter(s => s.scope === 'zone').map(sensor => (
                                       <SensorItemDisplay key={sensor.id} sensor={sensor} siteId={rootSiteId} zoneId={asset.id} router={router} />
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {(asset as Zone).subZones && (asset as Zone).subZones!.length > 0 && (
                          <AccordionItem value={`sub-zones-${asset.id}`} className="border-none rounded-md bg-background/50">
                            <AccordionTrigger className="py-2 px-3 text-sm font-medium hover:bg-muted/40 rounded-t-md">
                                Sous-Zones ({(asset as Zone).subZones!.length})
                            </AccordionTrigger>
                            <AccordionContent className="p-0"> 
                                <Accordion type="multiple" className="w-full space-y-1.5 pt-1" defaultValue={(asset as Zone).subZones!.map(sz => `${breadcrumbPath.map(b => b.id).join('-')}-${asset.id}-${sz.id}`)} >
                                  {(asset as Zone).subZones!.map(subZone => (
                                    <ZoneItemForManagement 
                                      key={subZone.id} 
                                      zone={subZone} 
                                      rootSiteId={rootSiteId}
                                      currentPathSegments={breadcrumbPath.map(b => b.id)} 
                                      router={router} 
                                      level={0} 
                                    />
                                  ))}
                                </Accordion>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                        
                        {((asset as Zone).machines?.length || 0) === 0 && 
                         (((asset as Zone).sensors?.filter(s => s.scope === 'zone') || []).length) === 0 && 
                         ((asset as Zone).subZones?.length || 0) === 0 && (
                           <p className="text-sm text-muted-foreground p-2 text-center">Cette zone est vide.</p>
                        )}
                    </Accordion>
                  </div>
              </section>
            )}


            <section className="pt-6 border-t">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold flex items-center gap-2"><Settings2 className="h-6 w-6 text-primary/70" />Contrôles au Niveau de l'Actif</h2>
                    <Button variant="outline" onClick={() => alert(`Configuration des contrôles pour ${asset.name} (Non implémenté)`)}>
                        <Settings2 className="mr-2 h-4 w-4" /> Configurer les Contrôles
                    </Button>
                </div>
                 <p className="text-sm text-muted-foreground mt-2">Gérer les contrôles et paramètres généraux applicables à {assetType === 'site' ? "l'ensemble du site" : "cette zone"}.</p>
            </section>

          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

