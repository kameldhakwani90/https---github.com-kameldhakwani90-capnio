
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DUMMY_CLIENT_SITES_DATA, type Site } from "@/lib/client-data"; // Updated import
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function EditSiteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;

  const [siteName, setSiteName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!siteId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    let siteToEdit: Site | undefined;
    
    function findSite(sites: Site[], id: string): Site | undefined {
        for (const site of sites) {
            if (site.id === id) return site;
            if (site.subSites) {
                const foundInSub = findSite(site.subSites, id);
                if (foundInSub) return foundInSub;
            }
        }
        return undefined;
    }
    siteToEdit = findSite(DUMMY_CLIENT_SITES_DATA, siteId);

    if (siteToEdit) {
      setSiteName(siteToEdit.name);
      setSiteLocation(siteToEdit.location);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  }, [siteId]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Updated site details:", { id: siteId, name: siteName, location: siteLocation });
    alert("Site details updated (simulated).");
    router.back(); 
  };
  
  if (isLoading) {
    return <AppLayout><div className="p-6 text-center">Loading site details...</div></AppLayout>;
  }

  if (notFound) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive">Site Not Found</h1>
          <p className="text-muted-foreground mb-4">The site you are trying to edit does not exist.</p>
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
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Asset Management
          </Button>
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Site Details</CardTitle>
            <CardDescription>Modify the information for site: {siteName || siteId}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input 
                  id="siteName" 
                  value={siteName} 
                  onChange={(e) => setSiteName(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteLocation">Location</Label>
                <Textarea 
                  id="siteLocation" 
                  value={siteLocation} 
                  onChange={(e) => setSiteLocation(e.target.value)} 
                  placeholder="e.g., 123 Main St, Anytown, USA"
                  required
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
