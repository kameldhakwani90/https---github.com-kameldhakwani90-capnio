import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const breachedMachines = [
  { id: "machine-cnc-a01", name: "CNC Mill A01", site: "Headquarters", zone: "Manufacturing Floor", status: "orange", issue: "Temperature at 85°C (Threshold: 80°C)", lastChecked: "2 mins ago", image: "https://placehold.co/150x100.png?text=CNC+Mill", dataAiHint: "industrial equipment" },
  { id: "machine-srv-001", name: "Main Server Rack", site: "Headquarters", zone: "Server Room", status: "red", issue: "Cooling Fan Failure Detected. Temp at 95°C", lastChecked: "Just now", image: "https://placehold.co/150x100.png?text=Server+Rack", dataAiHint: "server hardware" },
  { id: "machine-pump-c03", name: "Water Pump C03", site: "Warehouse Alpha", zone: "Loading Bay", status: "orange", issue: "Pressure dropped to 1.8 bar (Threshold: 2.0 bar)", lastChecked: "15 mins ago", image: "https://placehold.co/150x100.png?text=Water+Pump", dataAiHint: "water pump" },
];

const normalMachines = [
 { id: "machine-rb-b02", name: "Robot Arm B02", site: "Headquarters", zone: "Manufacturing Floor", status: "green", issue: "Nominal", lastChecked: "1 min ago", image: "https://placehold.co/150x100.png?text=Robot+Arm", dataAiHint: "robotic arm" },
];


const getStatusIcon = (status: string) => {
  if (status === 'red') return <AlertTriangle className="h-5 w-5 text-red-500" />;
  if (status === 'orange') return <Info className="h-5 w-5 text-orange-500" />;
  return <CheckCircle2 className="h-5 w-5 text-green-500" />;
}

export default function MonitoringPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Real-time Monitoring Dashboard</h1>
          </div>
           <Button variant="outline">Refresh Data</Button>
        </header>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Machines with Breached Thresholds</h2>
          {breachedMachines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {breachedMachines.map((machine) => (
                <Card key={machine.id} className={`shadow-lg ${machine.status === 'red' ? 'border-red-500' : 'border-orange-500'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{machine.name}</CardTitle>
                      {getStatusIcon(machine.status)}
                    </div>
                    <CardDescription>{machine.site} - {machine.zone}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Image src={machine.image} alt={machine.name} width={150} height={100} className="w-full h-32 object-cover rounded-md mb-3" data-ai-hint={machine.dataAiHint} />
                    <p className="text-sm font-medium text-destructive mb-1">{machine.issue}</p>
                    <p className="text-xs text-muted-foreground">Last checked: {machine.lastChecked}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-10 text-center">
              <CardContent>
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-xl font-semibold">All Clear!</p>
                <p className="text-muted-foreground">No machines are currently reporting breached thresholds.</p>
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Machines Operating Normally</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {normalMachines.map((machine) => (
                <Card key={machine.id} className="shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{machine.name}</CardTitle>
                      {getStatusIcon(machine.status)}
                    </div>
                    <CardDescription>{machine.site} - {machine.zone}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Image src={machine.image} alt={machine.name} width={150} height={100} className="w-full h-32 object-cover rounded-md mb-3" data-ai-hint={machine.dataAiHint} />
                    <p className="text-sm text-muted-foreground">{machine.issue}</p>
                    <p className="text-xs text-muted-foreground">Last checked: {machine.lastChecked}</p>
                  </CardContent>
                   <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
        </section>

      </div>
    </AppLayout>
  );
}
