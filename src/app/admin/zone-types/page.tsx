
"use client";

import React from 'react';
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, PlusCircle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { DUMMY_ZONE_TYPES, type ZoneType } from "@/lib/client-data.tsx";

export default function AdminZoneTypesListPage() {
  const { toast } = useToast();
  const [zoneTypes, setZoneTypes] = React.useState<ZoneType[]>(DUMMY_ZONE_TYPES);

  const handleDelete = (id: string, name: string) => {
    // Simulate deletion
    setZoneTypes(prev => prev.filter(zt => zt.id !== id));
    toast({
      title: "Type de Zone Supprimé (simulation)",
      description: `Le type de zone "${name}" a été retiré de la liste.`,
      variant: "destructive",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Layers className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Gestion des Types de Zones</h1>
          </div>
          <Button asChild>
            <Link href="/admin/zone-types/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Nouveau Type de Zone
            </Link>
          </Button>
        </header>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Types de Zones Définis</CardTitle>
            <CardDescription>
              Gérez les modèles de zones avec leurs bonnes pratiques et contrôles suggérés.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {zoneTypes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom du Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zoneTypes.map((zoneType) => (
                    <TableRow key={zoneType.id}>
                      <TableCell className="font-medium">{zoneType.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-md">{zoneType.description}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" aria-label="Modifier le type de zone" asChild>
                          <Link href={`/admin/zone-types/${zoneType.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive" 
                          aria-label="Supprimer le type de zone"
                          onClick={() => handleDelete(zoneType.id, zoneType.name)}
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
                <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">Aucun type de zone défini.</p>
                <Button asChild className="mt-6">
                  <Link href="/admin/zone-types/create">Créer Votre Premier Type de Zone</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
