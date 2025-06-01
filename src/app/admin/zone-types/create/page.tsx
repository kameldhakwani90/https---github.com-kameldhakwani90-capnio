
"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Layers, Save, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// TODO: Add selection for suggested controls, icon selection, etc.

export default function AdminCreateZoneTypePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bestPractices, setBestPractices] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom du type de zone est requis.",
        variant: "destructive",
      });
      return;
    }

    const zoneTypeData = {
      id: `zt-${Date.now().toString()}`, // Simulate ID generation
      name,
      description,
      bestPractices,
      // suggestedControls: [], // Placeholder
    };
    console.log("Nouveau type de zone créé (simulation):", zoneTypeData);
    // In a real app, you would add this to your list or send to a backend
    toast({
      title: "Type de Zone Créé",
      description: `Le type de zone "${name}" a été sauvegardé (simulation).`,
    });
    router.push('/admin/zone-types');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Layers className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Créer un Nouveau Type de Zone</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/zone-types">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour à la liste des types
            </Link>
          </Button>
        </header>
        <Card className="shadow-xl max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Définition du Type de Zone</CardTitle>
            <CardDescription>
              Configurez un modèle pour les zones, incluant des bonnes pratiques et des contrôles suggérés.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="zoneTypeName">Nom du Type de Zone *</Label>
                <Input 
                  id="zoneTypeName" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Entrepôt Réfrigéré - Fruits, Cuisine Restaurant" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zoneTypeDescription">Description</Label>
                <Textarea 
                  id="zoneTypeDescription" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brève description de ce type de zone et de son usage." 
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zoneTypeBestPractices">Bonnes Pratiques / Recommandations</Label>
                <Textarea 
                  id="zoneTypeBestPractices" 
                  value={bestPractices}
                  onChange={(e) => setBestPractices(e.target.value)}
                  placeholder="Listez les bonnes pratiques ou conseils spécifiques à ce type de zone (ex: gestion humidité pour dattes)." 
                  rows={5}
                />
              </div>

              {/* TODO: Add UI for selecting suggested controls and icon */}

              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg">
                  <Save className="mr-2 h-5 w-5" />
                  Sauvegarder le Type de Zone
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
