
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronRight, Home as HomeIcon, PackageOpen, Edit3, PlusCircle, Settings2, AlertTriangle, Trash2, Layers, Server } from "lucide-react";
import { 
    DUMMY_CLIENT_SITES_DATA, 
    type Site, 
    type Zone, 
    type Machine, 
    type Status,
    getZoneOverallStatus, // Assuming this is exported or redefined
    getSiteOverallStatus, // Assuming this is exported or redefined
    getStatusIcon,      // Assuming this is exported or redefined
    getStatusText       // Assuming this is exported or redefined
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

// Re-usable SubSiteCard, similar to dashboard but adapted for management context
const SubSiteCardDisplay: React.FC<{ site: Site; currentAssetPath: string[] }> = ({ site, currentAssetPath }) => {
  const siteStatus = getSiteOverallStatus(site); // Make sure this function is available
  const SiteIcon = site.isConceptualSubSite ? Layers : HomeIcon;
  const href = `/client/assets/manage/${[...currentAssetPath, site.id].join('/')}`;

  return (
    <Link href={href} className="block group">
      <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col bg-card/90 hover:bg-card">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg mb-1 flex items-center gap-2 group-hover:text-primary transition-colors">
              <SiteIcon className="h-5 w-5 text-primary" />
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


const ZoneItemForManagement: React.FC<{ zone: Zone; sitePath: string[]; siteId: string }> = ({ zone, sitePath, siteId }) => {
    const router = useRouter();
    const zoneStatus = getZoneOverallStatus(zone); 
    const MachineIcon = Server; // Default machine icon

    const handleMachineAlertNavigation = (machineId: string) => {
        router.push(`/client/machine-alerts/${machineId}`);
    };

    return (
        <AccordionItem value={zone.id} className="border-b bg-muted/30 rounded-md mb-2">
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
                <div className="flex justify-end gap-2 my-2">
                    <Button variant="outline" size="sm" onClick={() => alert(`Editing zone: ${zone.name} (Not implemented)`)}><Edit3 className="mr-1 h-3 w-3" /> Edit Zone</Button>
                    <Button variant="outline" size="sm" onClick={() => alert(`Adding machine to: ${zone.name} (Not implemented)`)}><PlusCircle className="mr-1 h-3 w-3" /> Add Machine</Button>
                    <Button variant="destructive" size="sm" onClick={() => alert(`Deleting zone: ${zone.name} (Not implemented)`)}><Trash2 className="mr-1 h-3 w-3" /> Delete Zone</Button>
                </div>
                {zone.machines.length > 0 ? (
                    <div className="space-y-1">
                        {zone.machines.map(machine => {
                            const CurrentMachineIcon = machine.icon || MachineIcon;
                            return (
                                <div key={machine.id} className="flex justify-between items-center p-2.5 border rounded-md bg-background shadow-sm hover:shadow-md transition-shadow">
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
                                                )}>
                                                {getStatusText(machine.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {machine.status !== 'green' && machine.activeControlInAlert && (
                                            <Button size="sm" variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-100" onClick={() => handleMachineAlertNavigation(machine.id)}>
                                                <AlertTriangle className="mr-1 h-4 w-4" /> Details
                                            </Button>
                                        )}
                                        <Button size="sm" variant="ghost" onClick={() => alert(`Managing machine: ${machine.name} (Not implemented)`)}><Settings2 className="mr-1 h-4 w-4" /> Manage</Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : <p className="text-sm text-muted-foreground p-2 text-center">No machines in this zone.</p>}
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
        <div className="p-6 text-center text-lg font-semibold">Loading asset details...</div>
      </AppLayout>
    );
  }

  if (!currentAssetInfo) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-destructive">Asset Not Found</h1>
          <p className="text-muted-foreground">The asset you are trying to manage does not exist or the path is incorrect.</p>
          <Button onClick={() => router.push('/assets')} className="mt-6">
            Back to Asset Management
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <nav className="flex items-center space-x-1.5 text-sm text-muted-foreground mb-4 bg-muted p-3 rounded-md shadow-sm">
          <Link href="/assets" className="hover:text-primary font-medium">Asset Management</Link>
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
                <Button variant="outline" size="lg" onClick={() => alert(`Editing details for ${currentAsset.name} (Not implemented)`)}>
                    <Edit3 className="mr-2 h-5 w-5" /> Edit Site Details
                </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            
            {/* Zones Section */}
            <section>
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h2 className="text-2xl font-semibold flex items-center gap-2"><Layers className="h-6 w-6 text-primary/70"/>Zones</h2>
                <Button variant="outline" onClick={() => alert(`Adding zone to ${currentAsset.name} (Not implemented)`)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Zone
                </Button>
              </div>
              {currentAsset.zones && currentAsset.zones.length > 0 ? (
                <Accordion type="multiple" className="w-full space-y-2">
                  {currentAsset.zones.map(zone => (
                    <ZoneItemForManagement key={zone.id} zone={zone} sitePath={assetPath} siteId={currentAsset.id} />
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-6 bg-muted/40 rounded-md">
                    <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-2"/>
                    <p className="text-muted-foreground">No zones defined for this site yet.</p>
                </div>
              )}
            </section>
            
            {/* Sub-Sites Section */}
            {currentAsset.subSites && currentAsset.subSites.length > 0 && (
              <section>
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <h2 className="text-2xl font-semibold flex items-center gap-2"><HomeIcon className="h-6 w-6 text-primary/70" />Sub-Sites / Buildings</h2>
                    {/* Add Sub-Site button is typically on the parent or a dedicated creation flow */}
                </div>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                  {currentAsset.subSites.map(subSite => (
                    <SubSiteCardDisplay key={subSite.id} site={subSite} currentAssetPath={assetPath} />
                  ))}
                </div>
              </section>
            )}

            {/* General Controls for the Site placeholder */}
            <section className="pt-6 border-t">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold flex items-center gap-2"><Settings2 className="h-6 w-6 text-primary/70" />Site-Level Controls</h2>
                    <Button variant="outline" onClick={() => alert(`Configuring controls for ${currentAsset.name} (Not implemented)`)}>
                        <Settings2 className="mr-2 h-4 w-4" /> Configure Controls
                    </Button>
                </div>
                 <p className="text-sm text-muted-foreground mt-2">Manage overall controls and parameters applicable to the entire site.</p>
            </section>

          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

    