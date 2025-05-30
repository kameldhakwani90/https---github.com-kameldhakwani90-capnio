
"use client";

import React from 'react';
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cpu, PlusCircle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';

interface MachineType {
  id: string;
  name: string;
  description?: string;
}

// Dummy data for machine types - replace with actual data fetching
const dummyMachineTypes: MachineType[] = [
  { id: "mt-001", name: "Frigo", description: "Réfrigérateurs et congélateurs industriels" },
  { id: "mt-002", name: "Pompe Hydraulique", description: "Pompes pour systèmes hydrauliques" },
  { id: "mt-003", name: "Armoire Électrique", description: "Panneaux et armoires de contrôle électrique" },
  { id: "mt-004", name: "Compresseur", description: "Compresseurs d'air industriels" },
];

export default function AdminMachineTypesListPage() {
  const { toast } = useToast();
  const [machineTypes, setMachineTypes] = React.useState<MachineType[]>(dummyMachineTypes);

  const handleDelete = (id: string, name: string) => {
    // Simulate deletion
    // In a real app, you'd call an API here
    setMachineTypes(prev => prev.filter(mt => mt.id !== id));
    toast({
      title: "Type de machine supprimé (simulation)",
      description: `Le type de machine "${name}" a été retiré de la liste.`,
      variant: "destructive",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Cpu className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Gestion des Types de Machines</h1>
          </div>
          <Button asChild>
            <Link href="/admin/machine-types/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Nouveau Type
            </Link>
          </Button>
        </header>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Types de Machines Définis</CardTitle>
            <CardDescription>Gérez les différentes catégories de machines que vos clients peuvent utiliser.</CardDescription>
          </CardHeader>
          <CardContent>
            {machineTypes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom du Type de Machine</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machineTypes.map((machineType) => (
                    <TableRow key={machineType.id}>
                      <TableCell className="font-medium">{machineType.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{machineType.description || "N/A"}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" aria-label="Modifier le type de machine" asChild>
                          <Link href={`/admin/machine-types/${machineType.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive" 
                          aria-label="Supprimer le type de machine"
                          onClick={() => handleDelete(machineType.id, machineType.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10">
                <Cpu className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">Aucun type de machine défini.</p>
                <Button asChild className="mt-6">
                  <Link href="/admin/machine-types/create">Créer Votre Premier Type de Machine</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
