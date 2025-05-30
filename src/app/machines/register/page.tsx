import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu, Cog } from "lucide-react";

export default function RegisterMachinePage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <header className="flex items-center gap-2">
          <Cpu className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Register New Machine</h1>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Machine Details</CardTitle>
            <CardDescription>Enter information for the new machine and assign it to a site/zone.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="machineName">Machine Name / ID</Label>
              <Input id="machineName" placeholder="e.g., CNC Lathe CL-05" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="machineType">Machine Type</Label>
                <Input id="machineType" placeholder="e.g., CNC Lathe, Compressor, Stamping Press" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machineModel">Model (Optional)</Label>
                <Input id="machineModel" placeholder="e.g., Haas VF-2" />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site">Assign to Site</Label>
                <Select>
                  <SelectTrigger id="site">
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site-hq">Headquarters</SelectItem>
                    <SelectItem value="site-wh-a">Warehouse Alpha</SelectItem>
                    {/* Populate with actual sites */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone">Assign to Zone (Optional)</Label>
                <Select>
                  <SelectTrigger id="zone">
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zone-mfg">Manufacturing Floor (Headquarters)</SelectItem>
                    <SelectItem value="zone-srv">Server Room (Headquarters)</SelectItem>
                     {/* Populate with actual zones based on selected site */}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="machineSerial">Serial Number (Optional)</Label>
              <Input id="machineSerial" placeholder="e.g., SN-12345XYZ" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="machineNotes">Notes (Optional)</Label>
              <Textarea id="machineNotes" placeholder="Any specific notes about this machine, maintenance schedule, etc." />
            </div>
            <div className="flex justify-end">
              <Button>
                <Cog className="mr-2 h-4 w-4" />
                Register Machine
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
