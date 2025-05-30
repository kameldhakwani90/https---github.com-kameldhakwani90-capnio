
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, PlusCircle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

// Dummy data for client list - replace with actual data fetching
const dummyClients = [
  { id: "client-001", companyName: "Acme Innovations", contactName: "John Doe", email: "john.doe@acme.com", phone: "+1-555-0101", status: "Active" },
  { id: "client-002", companyName: "Beta Solutions", contactName: "Jane Smith", email: "jane.smith@beta.com", phone: "+1-555-0202", status: "Active" },
  { id: "client-003", companyName: "Gamma Services", contactName: "Robert Brown", email: "robert.brown@gamma.com", phone: "+1-555-0303", status: "Inactive" },
];

export default function AdminClientsListPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Client Accounts</h1>
          </div>
          <Button asChild>
            <Link href="/admin/clients/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
            </Link>
          </Button>
        </header>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Registered Clients</CardTitle>
            <CardDescription>Manage all client company accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            {dummyClients.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.companyName}</TableCell>
                      <TableCell>{client.contactName}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                            client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {client.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" aria-label="Edit client">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Delete client">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">No clients found.</p>
                <Button asChild className="mt-6">
                  <Link href="/admin/clients/create">Add Your First Client</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
