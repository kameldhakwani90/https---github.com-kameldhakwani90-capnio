
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DUMMY_CLIENT_SITES_DATA, type Site } from "@/lib/client-data"; // Updated import
import { ChevronLeft, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AddZoneToSitePage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;

  const [zoneName, setZoneName] = useState("");
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
    console.log("Adding zone to site:", siteId, { name: zoneName });
    alert(`Zone "${zoneName}" added to site "${site?.name}" (simulated).`);
    router.back(); 
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
          <Button onClick={() => router.back()} variant="outline">
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
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to {site.name}
          </Button>
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Add New Zone to {site.name}</CardTitle>
            <CardDescription>Define a new zone within this site.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="zoneName">Zone Name</Label>
                <Input 
                  id="zoneName" 
                  value={zoneName} 
                  onChange={(e) => setZoneName(e.target.value)} 
                  placeholder="e.g., Production Area A, Server Room"
                  required 
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Zone
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
