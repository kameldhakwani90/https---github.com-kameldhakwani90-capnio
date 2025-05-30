
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, PlusCircle } from "lucide-react"; // Or other relevant icons like Share2, HardDrive, Home
import Link from "next/link";
import Image from "next/image";

// Placeholder data - in a real app, this would come from a backend/state
const userAssets = {
  sites: [
    { 
      id: "site-hq", 
      name: "Headquarters", 
      status: "green", 
      location: "New York",
      zones: [
        { 
          id: "zone-mfg", 
          name: "Manufacturing Floor", 
          status: "orange",
          machines: [
            { id: "machine-cnc", name: "CNC Mill A01", status: "orange", type: "CNC Mill" },
            { id: "machine-robot", name: "Robot Arm B02", status: "green", type: "Robotic Arm" },
          ]
        },
        {
          id: "zone-server",
          name: "Server Room",
          status: "red",
          machines: [
            { id: "machine-server-rack", name: "Main Server Rack", status: "red", type: "Server" }
          ]
        }
      ]
    },
    { id: "site-wh-a", name: "Warehouse Alpha", status: "green", location: "Chicago", zones: [] },
  ]
};

const getStatusColorClass = (status: string) => {
  switch (status) {
    case "green": return "bg-green-500";
    case "orange": return "bg-orange-500";
    case "red": return "bg-red-500";
    default: return "bg-gray-400";
  }
};


export default function AssetManagementPage() {
  // This page will display the client's sites, zones, machines in a tree or list.
  // For now, it's a placeholder structure.

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Network className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Asset Management</h1>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Site
          </Button>
        </header>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Your Assets Overview</CardTitle>
            <CardDescription>Manage your sites, zones, machines, and sensors.</CardDescription>
          </CardHeader>
          <CardContent>
            {userAssets.sites.length === 0 ? (
              <div className="text-center py-10">
                <Image 
                  src="https://placehold.co/400x300.png" 
                  alt="No assets configured" 
                  width={400} 
                  height={300} 
                  className="mx-auto mb-4 rounded-md shadow-md"
                  data-ai-hint="empty state network" 
                />
                <p className="text-xl text-muted-foreground">No assets configured yet.</p>
                <Button className="mt-6" size="lg">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Configure Your First Site
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userAssets.sites.map(site => (
                  <div key={site.id} className="p-4 border rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold flex items-center">
                         <span className={`w-3 h-3 rounded-full mr-2 ${getStatusColorClass(site.status)}`}></span>
                        {site.name}
                      </h3>
                      <span className="text-sm text-muted-foreground">{site.location}</span>
                    </div>
                    {/* Placeholder for zones and machines - this will become a more complex tree view */}
                     {site.zones && site.zones.length > 0 && (
                       <div className="ml-6 mt-2 space-y-2">
                        {site.zones.map(zone => (
                          <div key={zone.id} className="p-3 border-l-2 border-border rounded-r-md">
                             <div className="flex items-center">
                               <span className={`w-2.5 h-2.5 rounded-full mr-2 ${getStatusColorClass(zone.status)}`}></span>
                               <h4 className="font-medium">{zone.name}</h4>
                             </div>
                             {zone.machines && zone.machines.length > 0 && (
                               <div className="ml-6 mt-1 space-y-1">
                                {zone.machines.map(machine => (
                                  <div key={machine.id} className="text-sm flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${getStatusColorClass(machine.status)}`}></span>
                                    {machine.name} <span className="text-xs text-muted-foreground ml-1">({machine.type})</span>
                                  </div>
                                ))}
                               </div>
                             )}
                          </div>
                        ))}
                       </div>
                     )}
                     <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm">Manage Zones</Button>
                        <Button variant="outline" size="sm">View Machines</Button>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="p-6 text-left justify-start h-auto">
              <div>
                <h4 className="font-semibold text-lg">Register New Machine</h4>
                <p className="text-sm text-muted-foreground">Add a new piece of equipment to your monitoring system.</p>
              </div>
            </Button>
            <Button variant="outline" className="p-6 text-left justify-start h-auto">
               <div>
                <h4 className="font-semibold text-lg">Configure Sensors</h4>
                <p className="text-sm text-muted-foreground">Set up or modify sensor parameters and associations.</p>
              </div>
            </Button>
             <Button variant="outline" className="p-6 text-left justify-start h-auto">
               <div>
                <h4 className="font-semibold text-lg">View Alert Rules</h4>
                <p className="text-sm text-muted-foreground">Check and define formulas for notifications.</p>
              </div>
            </Button>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
