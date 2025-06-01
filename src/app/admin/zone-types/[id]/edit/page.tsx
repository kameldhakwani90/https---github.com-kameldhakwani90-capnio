
"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Layers, Save, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { DUMMY_ZONE_TYPES, type ZoneType } from "@/lib/client-data.tsx";

export default function AdminEditZoneTypePage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const zoneTypeId = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bestPracticesTitle, setBestPracticesTitle] = useState("");
  const [bestPracticesContent, setBestPracticesContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!zoneTypeId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    const typeToEdit = DUMMY_ZONE_TYPES.find(zt => zt.id === zoneTypeId);

    if (typeToEdit) {
      setName(typeToEdit.name);
      setDescription(typeToEdit.description || "");
      setBestPracticesTitle(typeToEdit.bestPracticesTitle || "");
      setBestPracticesContent(typeToEdit.bestPracticesContent || "");
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  }, [zoneTypeId]);

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

    const updatedZoneTypeData = {
      id: zoneTypeId,
      name,
      description,
      bestPracticesTitle: bestPracticesTitle.trim() === "" ? undefined : bestPracticesTitle,
      bestPracticesContent: bestPracticesContent.trim() === "" ? undefined : bestPracticesContent,
    };
    console.log("Type de zone mis à jour (simulation):", updatedZoneTypeData);
    toast({
      title: "Type de Zone Mis à Jour",
      description: `Le type de zone "${name}" a été sauvegardé (simulation).`,
    });
    router.push('/admin/zone-types');
  };

  if (isLoading) {
    return <AppLayout><div className="p-6 text-center">Chargement des données du type de zone...</div></AppLayout>;
  }

  if (notFound) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Type de zone non trouvé</h1>
          <p className="text-muted-foreground mb-6">Désolé, le type de zone que vous essayez de modifier n'existe pas.</p>
          <Button asChild variant="outline">
            <Link href="/admin/zone-types">
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
            <Layers className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Modifier le Type de Zone</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/zone-types">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>
        </header>
        <Card className="shadow-xl max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Détails du Type de Zone</CardTitle>
            <CardDescription>
              Mettez à jour les informations de ce type de zone.
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
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zoneTypeDescription">Description</Label>
                <Textarea 
                  id="zoneTypeDescription" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zoneTypeBestPracticesTitle">Titre pour les Bonnes Pratiques (Optionnel)</Label>
                <Input 
                  id="zoneTypeBestPracticesTitle" 
                  value={bestPracticesTitle}
                  onChange={(e) => setBestPracticesTitle(e.target.value)}
                  placeholder="Ex: Gestion Optimale de la Chambre Froide" 
                />
              </div>

               <div className="space-y-2">
                <Label htmlFor="zoneTypeBestPracticesContent">Bonnes Pratiques / Recommandations (Contenu)</Label>
                <Textarea 
                  id="zoneTypeBestPracticesContent" 
                  value={bestPracticesContent}
                  onChange={(e) => setBestPracticesContent(e.target.value)}
                  rows={5}
                />
              </div>

              {/* TODO: Add UI for selecting suggested controls and icon */}

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

