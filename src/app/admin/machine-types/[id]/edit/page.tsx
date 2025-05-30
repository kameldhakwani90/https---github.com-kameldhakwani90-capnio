"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Cpu, Save, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

interface MachineType {
  id: string;
  name: string;
  description?: string;
}

// Dummy data - in a real app, this would be fetched or come from a global state/store
const dummyMachineTypes: MachineType[] = [
  { id: "mt-001", name: "Frigo", description: "Réfrigérateurs et congélateurs industriels" },
  { id: "mt-002", name: "Pompe Hydraulique", description: "Pompes pour systèmes hydrauliques" },
  { id: "mt-003", name: "Armoire Électrique", description: "Panneaux et armoires de contrôle électrique" },
  { id: "mt-004", name: "Compresseur", description: "Compresseurs d'air industriels" },
];


export default function AdminEditMachineTypePage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const machineTypeId = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!machineTypeId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    const typeToEdit = dummyMachineTypes.find(mt => mt.id === machineTypeId);

    if (typeToEdit) {
      setName(typeToEdit.name);
      setDescription(typeToEdit.description || "");
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  }, [machineTypeId]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom du type de machine est requis.",
        variant: "destructive",
      });
      return;
    }

    const updatedMachineTypeData = {
      id: machineTypeId,
      name,
      description,
    };
    console.log("Type de machine mis à jour (simulation):", updatedMachineTypeData);
    // In a real app, you would update this in your list/backend
    toast({
      title: "Type de Machine Mis à Jour",
      description: `Le type de machine "${name}" a été sauvegardé (simulation).`,
    });
    router.push('/admin/machine-types');
  };

  if (isLoading) {
    return <AppLayout><div className="p-6 text-center">Chargement des données du type de machine...</div></AppLayout>;
  }

  if (notFound) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Type de machine non trouvé</h1>
          <p className="text-muted-foreground mb-6">Désolé, le type de machine que vous essayez de modifier n'existe pas.</p>
          <Button asChild variant="outline">
            <Link href="/admin/machine-types">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Cpu className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Modifier le Type de Machine</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/machine-types">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>
        </header>
        <Card className="shadow-xl max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Détails du Type de Machine</CardTitle>
            <CardDescription>
              Mettez à jour les informations de ce type de machine.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="machineTypeName">Nom du type de machine *</Label>
                <Input 
                  id="machineTypeName" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Frigo, Compresseur, Moteur Électrique" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="machineTypeDescription">Description (optionnel)</Label>
                <Textarea 
                  id="machineTypeDescription" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brève description de ce type de machine." 
                  rows={3}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg">
                  <Save className="mr-2 h-5 w-5" />
                  Sauvegarder les Modifications
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}