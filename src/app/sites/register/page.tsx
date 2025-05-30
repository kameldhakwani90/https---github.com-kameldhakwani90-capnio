import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Home, MapPin } from "lucide-react";

export default function RegisterSitePage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <header className="flex items-center gap-2">
          <Home className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Register New Site</h1>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Site Details</CardTitle>
            <CardDescription>Enter the information for the new physical site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" placeholder="e.g., Main Production Facility" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteLocation">Location Address</Label>
              <Input id="siteLocation" placeholder="e.g., 123 Industrial Ave, Anytown, USA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteCoordinates">GPS Coordinates (Optional)</Label>
              <div className="flex gap-2">
                <Input id="siteLatitude" placeholder="Latitude" />
                <Input id="siteLongitude" placeholder="Longitude" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Description</Label>
              <Textarea id="siteDescription" placeholder="Brief description of the site, its purpose, or any relevant notes." />
            </div>
             <div className="space-y-2">
              <Label htmlFor="siteImage">Site Image URL (Optional)</Label>
              <Input id="siteImage" type="url" placeholder="https://example.com/site-image.png" />
            </div>
            <div className="flex justify-end">
              <Button>
                <MapPin className="mr-2 h-4 w-4" />
                Register Site
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
