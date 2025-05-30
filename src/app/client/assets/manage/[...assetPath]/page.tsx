
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home as HomeIcon, PackageOpen } from "lucide-react";
import { DUMMY_CLIENT_SITES_DATA, type Site } from "@/app/client/sites/[...sitePath]/page"; // Re-using types and data

// Helper function to find a site by its path (can be moved to a shared util)
interface FoundAssetInfo {
  asset: Site; // For now, only sites are top-level manageable entities. Could be Site | Zone | Machine later.
  path: { id: string; name: string }[]; // For breadcrumbs
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
      currentSearchSpace = found.subSites || []; // Prepare for next level if it exists
    } else {
      // If we are looking for a zone or machine, the logic would be different here.
      // For now, this only finds sites/sub-sites by ID matching.
      return undefined; // Path segment not found
    }
  }
  return currentAsset ? { asset: currentAsset, path: breadcrumbPath } : undefined;
};

export default function ManageAssetPage() {
  const params = useParams();
  const router = useRouter();
  const { assetPath } = params as { assetPath: string[] }; // e.g., ['site-id'] or ['site-id', 'sub-site-id']

  const [currentAssetInfo, setCurrentAssetInfo] = React.useState<FoundAssetInfo | null | undefined>(undefined);

  React.useEffect(() => {
    if (assetPath && Array.isArray(assetPath) && assetPath.length > 0) {
      const found = findAssetByPath(assetPath, DUMMY_CLIENT_SITES_DATA);
      setCurrentAssetInfo(found || null);
    } else {
      setCurrentAssetInfo(null); // Invalid path
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

  const generateBreadcrumbUrl = (index: number) => {
    const pathSegments = breadcrumbPath.slice(0, index + 1).map(p => p.id);
    return `/client/assets/manage/${pathSegments.join('/')}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-1.5 text-sm text-muted-foreground mb-4 bg-muted p-2 rounded-md">
          <Link href="/assets" className="hover:text-primary">Asset Management</Link>
          {breadcrumbPath.map((segment, index) => (
            <React.Fragment key={segment.id}>
              <ChevronRight className="h-4 w-4" />
              {index === breadcrumbPath.length - 1 ? (
                <span className="font-medium text-foreground">{segment.name}</span>
              ) : (
                <Link href={generateBreadcrumbUrl(index)} className="hover:text-primary">
                  {segment.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Manage: {currentAsset.name}</CardTitle>
            <CardDescription>Location: {currentAsset.location}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This is where you will manage the details of '{currentAsset.name}'.
              You'll be able to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Edit site/zone/machine details.</li>
              <li>Add new zones to this site (if it's a site).</li>
              <li>Add new machines to a zone.</li>
              <li>Assign sensors to machines.</li>
              <li>Assign and configure controls for this asset.</li>
              <li>View detailed status and link to "Fiche Contrôle" if in alert.</li>
            </ul>
            <div className="mt-6 p-4 border-dashed border-2 border-border rounded-md text-center">
                <p className="text-lg font-semibold text-primary">Management Interface Under Construction</p>
                <p className="text-sm text-muted-foreground">Further asset management functionalities will be implemented here.</p>
            </div>

             {/* Placeholder for listing sub-assets like zones or machines */}
            {currentAsset.zones && currentAsset.zones.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Direct Zones:</h3>
                <div className="space-y-2">
                  {currentAsset.zones.map(zone => (
                    <Card key={zone.id} className="p-3 bg-muted/50">
                      <Link href={`/client/assets/manage/${assetPath.join('/')}/${zone.id}`} className="font-medium hover:text-primary">{zone.name}</Link>
                       {/* Add manage button or further details here */}
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {currentAsset.subSites && currentAsset.subSites.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Sub-Sites:</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {currentAsset.subSites.map(subSite => (
                             <Link key={subSite.id} href={`/client/assets/manage/${assetPath.join('/')}/${subSite.id}`} className="block group">
                                <Card className="hover:shadow-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-md group-hover:text-primary">{subSite.name}</CardTitle>
                                        <CardDescription>{subSite.location}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}


          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
