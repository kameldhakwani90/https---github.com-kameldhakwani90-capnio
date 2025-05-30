
"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Save, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Dummy data for formula list - for simulation purposes
const dummyFormulas = [
  { 
    id: "formula-001", 
    formulaName: "Alerte Haute Température Moteur", 
    applicableMachines: ["Moteur Principal", "Pompe Hydraulique"], 
    requiredSensors: ["temp_moteur", "rpm"],
    formulaExpression: "sensor['temp_moteur'].value > 85",
    alertMessage: "ALERTE: Température moteur {sensor['temp_moteur'].value}°C anormale sur {machine.name}."
  },
  { 
    id: "formula-002", 
    formulaName: "Alerte Pression Basse Huile", 
    applicableMachines: ["Compresseur X2000"], 
    requiredSensors: ["pression_huile", "niveau_huile"],
    formulaExpression: "sensor['pression_huile'].value < 0.5",
    alertMessage: "ATTENTION: Pression d'huile basse ({sensor['pression_huile'].value} bar) sur {machine.name}."
  },
];

export default function AdminEditFormulaPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const formulaId = params.id as string;

  const [formulaName, setFormulaName] = useState("");
  const [applicableMachines, setApplicableMachines] = useState("");
  const [requiredSensors, setRequiredSensors] = useState("");
  const [formulaExpression, setFormulaExpression] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!formulaId) return;

    const formulaToEdit = dummyFormulas.find(f => f.id === formulaId);

    if (formulaToEdit) {
      setFormulaName(formulaToEdit.formulaName);
      setApplicableMachines(formulaToEdit.applicableMachines.join(", "));
      setRequiredSensors(formulaToEdit.requiredSensors.join(", "));
      setFormulaExpression(formulaToEdit.formulaExpression);
      setAlertMessage(formulaToEdit.alertMessage);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  }, [formulaId]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedFormulaData = {
      id: formulaId,
      formulaName,
      applicableMachines: applicableMachines.split(',').map(s => s.trim()).filter(s => s),
      requiredSensors: requiredSensors.split(',').map(s => s.trim()).filter(s => s),
      formulaExpression,
      alertMessage,
    };
    console.log("Formule mise à jour (simulation):", updatedFormulaData);
    toast({
      title: "Formule Mise à Jour",
      description: `La formule "${formulaName}" a été mise à jour (simulation).`,
    });
    router.push("/admin/formulas");
  };

  if (isLoading) {
    return <AppLayout><div className="p-6 text-center">Chargement de la formule...</div></AppLayout>;
  }

  if (notFound) {
    return <AppLayout><div className="p-6 text-center text-red-500">Formule non trouvée.</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Modifier la Formule</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/formulas">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour à la liste des formules
            </Link>
          </Button>
        </header>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Détails de la Formule</CardTitle>
            <CardDescription>
              Modifiez les conditions et les messages pour cette alerte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="formulaName">Nom de la Formule *</Label>
                <Input 
                  id="formulaName" 
                  value={formulaName}
                  onChange={(e) => setFormulaName(e.target.value)}
                  placeholder="Ex: Alerte Surchauffe Moteur Principal" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicableMachines">Types de Machines Applicables (séparés par des virgules)</Label>
                <Input 
                  id="applicableMachines" 
                  value={applicableMachines}
                  onChange={(e) => setApplicableMachines(e.target.value)}
                  placeholder="Ex: Moteur XYZ, Pompe Modèle B, Broyeur Alpha" 
                />
                <p className="text-xs text-muted-foreground">Laissez vide si applicable à toutes les machines ayant les capteurs requis.</p>
              </div>
               <div className="space-y-2">
                <Label htmlFor="requiredSensors">Capteurs Requis (variables système, séparées par des virgules) *</Label>
                <Input 
                  id="requiredSensors" 
                  value={requiredSensors}
                  onChange={(e) => setRequiredSensors(e.target.value)}
                  placeholder="Ex: temp_moteur, pression_huile, vibration_xy" 
                  required
                />
                 <p className="text-xs text-muted-foreground">Ces variables doivent correspondre à celles définies dans le mappage des types de capteurs.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="formulaExpression">Expression de la Formule *</Label>
                <Textarea 
                  id="formulaExpression" 
                  value={formulaExpression}
                  onChange={(e) => setFormulaExpression(e.target.value)}
                  placeholder="Ex: sensor['temp_moteur'].value > 85 && sensor['pression_huile'].value < 0.8" 
                  rows={4} 
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Utilisez <code>sensor['variable_systeme'].value</code> pour les lectures.
                  L'expression doit évaluer à <code>true</code> (pour déclencher l'alerte) ou <code>false</code>.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alertMessage">Modèle de Message d'Alerte *</Label>
                <Textarea 
                  id="alertMessage" 
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  placeholder="Ex: ALERTE: Température moteur {sensor['temp_moteur'].value}°C anormale sur {machine.name}." 
                  rows={3}
                  required
                />
                 <p className="text-xs text-muted-foreground">
                  Utilisez des placeholders comme <code>{'{sensor_variable.value}'}</code>, <code>{'{machine.name}'}</code>.
                </p>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg">
                  <Save className="mr-2 h-5 w-5" />
                  Mettre à Jour la Formule
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
