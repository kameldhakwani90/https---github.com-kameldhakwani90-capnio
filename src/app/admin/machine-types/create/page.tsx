
"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Cpu, Save, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function AdminCreateMachineTypePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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

    const machineTypeData = {
      id: `mt-${Date.now().toString()}`, // Simulate ID generation
      name,
      description,
    };
    console.log("Nouveau type de machine créé (simulation):", machineTypeData);
    // In a real app, you would add this to your list or send to a backend
    // For now, we'll just toast and redirect.
    toast({
      title: "Type de Machine Créé",
      description: `Le type de machine "${name}" a été sauvegardé (simulation).`,
    });
    router.push('/admin/machine-types');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Cpu className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Ajouter un Nouveau Type de Machine</h1>
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
              Définissez une nouvelle catégorie de machine pour votre système.
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
                  Sauvegarder le Type de Machine
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
