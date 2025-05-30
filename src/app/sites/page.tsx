import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";

const dummySites = [
  { id: "site-hq", name: "Headquarters", location: "New York, USA", zones: 2, machines: 5, status: "green", image: "https://placehold.co/300x200.png?text=Headquarters" },
  { id: "site-wh-a", name: "Warehouse Alpha", location: "Chicago, USA", zones: 1, machines: 3, status: "orange", image: "https://placehold.co/300x200.png?text=Warehouse+Alpha" },
  { id: "site-plant-b", name: "Manufacturing Plant Beta", location: "Remote Location", zones: 0, machines: 0, status: "red", image: "https://placehold.co/300x200.png?text=Plant+Beta" },
];

export default function SitesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Sites Management</h1>
          </div>
          <Button asChild>
            <Link href="/sites/register">
              <PlusCircle className="mr-2 h-4 w-4" /> Register New Site
            </Link>
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Registered Sites</CardTitle>
            <CardDescription>View and manage all registered physical sites.</CardDescription>
          </CardHeader>
          <CardContent>
            {dummySites.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-center">Zones</TableHead>
                    <TableHead className="text-center">Machines</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummySites.map((site) => (
                    <TableRow key={site.id}>
                      <TableCell className="font-medium">{site.name}</TableCell>
                      <TableCell>{site.location}</TableCell>
                      <TableCell className="text-center">{site.zones}</TableCell>
                      <TableCell className="text-center">{site.machines}</TableCell>
                      <TableCell className="text-center">
                         <span className={`px-2 py-1 text-xs rounded-full ${
                            site.status === 'green' ? 'bg-green-100 text-green-800' :
                            site.status === 'orange' ? 'bg-orange-100 text-orange-800' :
                            site.status === 'red' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" aria-label="Edit site">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Delete site">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10">
                <Image src="https://placehold.co/300x200.png" alt="No sites registered" width={300} height={200} className="mx-auto mb-4 rounded-md" data-ai-hint="empty state location" />
                <p className="text-muted-foreground">No sites registered yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/sites/register">Register Your First Site</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
