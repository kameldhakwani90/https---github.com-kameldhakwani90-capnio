"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger as ShadAccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronRight, Home as HomeIcon, PackageOpen, Edit3, PlusCircle, Settings2, AlertTriangle, Trash2, Layers, Server, RadioTower, HardDrive, Thermometer, Zap, Wind, Info, Building as BuildingIcon, Package as DefaultSiteIcon, ChevronDown, Gauge } from "lucide-react"; 
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
    getZoneIcon,
    getSiteIcon as getTopLevelSiteIcon, // Renamed to avoid conflict
    DUMMY_ZONE_TYPES 
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
        // This will now link to the dedicated zone page, so the breadcrumb path stops here for this view.
        // The dedicated zone page will build its own breadcrumb further.
        breadcrumbPath.push({ id: nextAsset.id, name: nextAsset.name, type: 'zone' });
        // For this page, currentAsset is still the site, and we list its zones.
        // The 'asset' returned will be the site, and its zones will be iterated over.
        // If the path *ends* on a zone ID, it means we are trying to manage that zone,
        // which should now redirect or be handled by the new manage-zone page.
        // This function is for displaying the *parent* asset and its children.
        // If the pathArray fully matches up to a zone, then the currentAsset is that zone.
        // This logic might need refinement if pathArray implies deeper navigation.
        // For now, if pathArray[i] is a zone, we set currentAsset to that zone and break.
        // This makes sense for the breadcrumb part.
        // currentAsset = nextAsset; 
        // currentAssetType = 'zone';
        // return { asset: currentAsset, assetType: currentAssetType, breadcrumbPath, rootSiteId };
        continue; // Continue building breadcrumb if there are more segments
      }
      return undefined; 
    } else { 
      // This case should ideally not be hit if we are managing a site that contains zones,
      // as the path would resolve to the site itself.
      // If currentAssetType is 'zone', it means we've navigated to a zone.
      // This page (manage/[...assetPath]) is for sites, or zones acting as containers for sub-zones.
      // The new manage-zone page will handle individual zone details.
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
  const SiteOrSubSiteIcon = getTopLevelSiteIcon(subSite.isConceptualSubSite);
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

interface ZoneItemLinkProps {
  zone: Zone; 
  rootSiteId: string; 
  currentPathSegments: string[]; // Path from root site to the PARENT of this zone
  router: ReturnType<typeof useRouter>;
  level?: number;
}

const ZoneItemLink: React.FC<ZoneItemLinkProps> = ({ zone, rootSiteId, currentPathSegments, router, level = 0 }) => {
    const zoneStatus = getZoneOverallStatus(zone); 
    // currentPathSegments lead to the site/zone that *contains* this zone.
    // zonePathForLink should be segments from rootSite's children down to *this* zone.
    const relativeZonePathArray = [...currentPathSegments.slice(1), zone.id];
    const zoneManagelink = `/client/assets/manage-zone/${rootSiteId}/${relativeZonePathArray.join('/')}`;
    const zoneTypeInfo = DUMMY_ZONE_TYPES.find(zt => zt.id === zone.zoneTypeId);
    const CurrentZoneIcon = getZoneIcon(zone.zoneTypeId);

    return (
        <div className="border-b bg-muted/30 rounded-md mb-2 shadow-sm hover:shadow-md transition-shadow" style={{ marginLeft: `${level * 1.5}rem` }}>
            <Link href={zoneManagelink} className="block group">
                <div className="flex items-center justify-between w-full py-3 px-4 hover:bg-muted/50 rounded-md transition-colors">
                    <div className="flex items-center gap-2">
                        <CurrentZoneIcon className="h-5 w-5 text-primary/80 group-hover:text-primary" />
                        <div>
                          <span className="font-medium text-md group-hover:text-primary group-hover:underline">{zone.name}</span>
                          {zoneTypeInfo && <p className="text-xs text-muted-foreground group-hover:text-primary/80">{zoneTypeInfo.name}</p>}
                        </div>
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
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                </div>
            </Link>
        </div>
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
  const AssetIcon = assetType === 'site' ? getTopLevelSiteIcon((asset as Site).isConceptualSubSite) : getZoneIcon((asset as Zone).zoneTypeId);

  const generateBreadcrumbUrl = (index: number) => {
    const pathSegments = breadcrumbPath.slice(0, index + 1).map(p => p.id);
    return `/client/assets/manage/${pathSegments.join('/')}`;
  };

  const handleEditAssetDetails = () => {
    // For sites, the current edit page is okay.
    // For zones, editing should happen on the new manage-zone page.
    // This button might need to be conditional or removed if this page only shows sites.
    if (assetType === 'site') {
      router.push(`/client/assets/edit-site/${asset.id}`);
    } else { 
      // This case (editing a zone from this page) should ideally not happen
      // if zones always navigate to their dedicated manage-zone page.
      // But if a zone *is* the current asset (e.g. a parent zone displaying sub-zones),
      // its edit button should go to its dedicated edit page.
      const zonePathForEdit = breadcrumbPath.slice(1).map(p=>p.id).join('/');
      router.push(`/client/assets/edit-zone/${rootSiteId}/${zonePathForEdit}`);
    }
  };

  const handleAddPrimaryZoneOrSubZone = () => { 
    if (assetType === 'site') {
      router.push(`/client/assets/add-zone/${asset.id}`);
    } else { 
       // This button should primarily be on the manage-zone page now.
       // For adding a sub-zone to a zone listed here, the user should click into that zone first.
       // However, if this page *can* display a zone directly (as a container), then:
       const zonePathForAdd = breadcrumbPath.slice(1).map(p=>p.id).join('/');
       router.push(`/client/assets/add-sub-zone/${rootSiteId}/${asset.id}`); // asset.id is the current zone's ID
    }
  };
  
  const mainCardTitle = asset.name;
  const mainCardDescription = assetType === 'site' ? (asset as Site).location : `Zone de ${breadcrumbPath.length > 1 ? breadcrumbPath[breadcrumbPath.length - 2].name : DUMMY_CLIENT_SITES_DATA.find(s=>s.id ===rootSiteId)?.name}`;
  
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
                    </div>
                </div>
                 {/* Edit button is now more relevant on the specific manage-zone page */}
                <Button variant="outline" size="lg" onClick={handleEditAssetDetails}>
                    <Edit3 className="mr-2 h-5 w-5" /> Modifier les Détails de l'Actif
                </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            
            {/* This page (manage/[...assetPath]) will now primarily list zones of a site, or sub-sites of a site. */}
            {/* The detailed management of a zone (machines, sensors, sub-zones within it) will be on manage-zone page */}

            {assetType === 'site' && (asset as Site).zones && (asset as Site).zones.length > 0 && (
              <section>
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <h2 className="text-2xl font-semibold flex items-center gap-2"><Layers className="h-6 w-6 text-primary/70"/>Zones Principales</h2>
                   <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => router.push(`/client/assets/add-zone/${asset.id}`)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Zone
                        </Button>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" aria-label="Information sur les Zones"><Info className="h-4 w-4" /></Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 text-sm">
                                <h4 className="font-medium leading-none mb-1">Qu'est-ce qu'une Zone ?</h4>
                                <p className="text-muted-foreground mb-2">Une zone divise un site en sections (ex: Cuisine, Entrepôt). Cliquez sur une zone pour voir ses détails, machines et capteurs.</p>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className="space-y-2">
                  {(asset as Site).zones.map(zone => (
                    <ZoneItemLink 
                      key={zone.id} 
                      zone={zone} 
                      rootSiteId={rootSiteId} 
                      currentPathSegments={breadcrumbPath.map(b => b.id)} // Path to the current site
                      router={router} 
                      level={0}
                    />
                  ))}
                </div>
              </section>
            )}
             {assetType === 'site' && (asset as Site).zones.length === 0 && (
                <div className="text-center py-6 bg-muted/40 rounded-md">
                    <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-2"/>
                    <p className="text-muted-foreground">Aucune zone définie pour ce site.</p>
                    <Button variant="outline" className="mt-3" onClick={() => router.push(`/client/assets/add-zone/${asset.id}`)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Ajouter votre première Zone
                    </Button>
                </div>
             )}

            {assetType === 'site' && (asset as Site).subSites && (asset as Site).subSites!.length > 0 && (
              <section className="mt-8">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <h2 className="text-2xl font-semibold flex items-center gap-2"><BuildingIcon className="h-6 w-6 text-primary/70" />Sous-Sites / Bâtiments</h2>
                    {/* Button to add sub-site could go here if needed */}
                </div>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                  {(asset as Site).subSites!.map(subSite => (
                    <SubSiteCardDisplay key={subSite.id} subSite={subSite} currentAssetPathSegments={breadcrumbPath.map(b => b.id)} />
                  ))}
                </div>
              </section>
            )}
            
            {/* If the current asset IS a zone (meaning we are viewing a zone that acts as a parent for sub-zones) */}
            {/* This logic will now mostly live on the dedicated manage-zone page */}
            {assetType === 'zone' && (asset as Zone).subZones && (asset as Zone).subZones.length > 0 && (
                 <section>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                        <h2 className="text-2xl font-semibold flex items-center gap-2"><Layers className="h-6 w-6 text-primary/70"/>Sous-Zones</h2>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => router.push(`/client/assets/add-sub-zone/${rootSiteId}/${asset.id}`)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Sous-Zone
                            </Button>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="icon" aria-label="Information sur les Sous-Zones"><Info className="h-4 w-4" /></Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 text-sm">
                                    <h4 className="font-medium leading-none mb-1">Qu'est-ce qu'une Sous-Zone ?</h4>
                                    <p className="text-muted-foreground mb-2">Une sous-zone détaille une zone existante. Cliquez pour gérer.</p>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                     <div className="space-y-2">
                        {(asset as Zone).subZones!.map(subZone => (
                            <ZoneItemLink
                            key={subZone.id}
                            zone={subZone}
                            rootSiteId={rootSiteId}
                            currentPathSegments={breadcrumbPath.map(b => b.id)} // Path to the current parent zone
                            router={router}
                            level={0} // Or adjust level based on breadcrumbPath.length
                            />
                        ))}
                    </div>
                 </section>
            )}


            {/* Controls section is removed from here as it's not generic for sites containing zones. Controls are machine or zone specific */}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
