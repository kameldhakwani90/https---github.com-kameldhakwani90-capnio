import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cpu, PlusCircle, Edit, Trash2, LinkIcon } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const dummyMachines = [
  { id: "machine-cnc-a01", name: "CNC Mill A01", type: "CNC Mill", site: "Headquarters", zone: "Manufacturing Floor", status: "orange", sensors: 2, image: "https://placehold.co/300x200.png?text=CNC+Mill" },
  { id: "machine-rb-b02", name: "Robot Arm B02", type: "Robotic Arm", site: "Headquarters", zone: "Manufacturing Floor", status: "green", sensors: 1, image: "https://placehold.co/300x200.png?text=Robot+Arm" },
  { id: "machine-srv-001", name: "Main Server Rack", type: "Server", site: "Headquarters", zone: "Server Room", status: "red", sensors: 3, image: "https://placehold.co/300x200.png?text=Server+Rack" },
];

export default function MachinesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Machines Management</h1>
          </div>
          <Button asChild>
            <Link href="/machines/register">
              <PlusCircle className="mr-2 h-4 w-4" /> Register New Machine
            </Link>
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Registered Machines</CardTitle>
            <CardDescription>View, manage, and associate sensors with registered machines.</CardDescription>
          </CardHeader>
          <CardContent>
            {dummyMachines.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Machine Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead className="text-center">Sensors</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyMachines.map((machine) => (
                    <TableRow key={machine.id}>
                      <TableCell className="font-medium">{machine.name}</TableCell>
                      <TableCell>{machine.type}</TableCell>
                      <TableCell>{machine.site}</TableCell>
                      <TableCell>{machine.zone}</TableCell>
                      <TableCell className="text-center">{machine.sensors}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={
                            machine.status === 'green' ? 'default' :
                            machine.status === 'orange' ? 'secondary' : // Using secondary for orange for now
                            machine.status === 'red' ? 'destructive' : 'outline'
                          }
                          className={
                            machine.status === 'green' ? 'bg-green-500 hover:bg-green-600 text-white' :
                            machine.status === 'orange' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''
                          }
                          >
                          {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                         <Button variant="outline" size="sm" asChild>
                           <Link href={`/machines/${machine.id}/sensors`}>
                            <LinkIcon className="mr-1 h-3 w-3" /> Sensors
                           </Link>
                         </Button>
                        <Button variant="ghost" size="icon" aria-label="Edit machine">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Delete machine">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10">
                 <Image src="https://placehold.co/300x200.png" alt="No machines registered" width={300} height={200} className="mx-auto mb-4 rounded-md" data-ai-hint="empty state machinery" />
                <p className="text-muted-foreground">No machines registered yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/machines/register">Register Your First Machine</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
