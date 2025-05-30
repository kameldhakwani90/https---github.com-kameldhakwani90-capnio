
"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Save, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function AdminCreateFormulaPage() {
  const { toast } = useToast();
  const [formulaName, setFormulaName] = useState("");
  const [applicableMachines, setApplicableMachines] = useState("");
  const [requiredSensors, setRequiredSensors] = useState("");
  const [formulaExpression, setFormulaExpression] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formulaData = {
      formulaName,
      applicableMachines: applicableMachines.split(',').map(s => s.trim()).filter(s => s),
      requiredSensors: requiredSensors.split(',').map(s => s.trim()).filter(s => s),
      formulaExpression,
      alertMessage,
    };
    console.log("Nouvelle formule créée (simulation):", formulaData);
    toast({
      title: "Formule Créée",
      description: `La formule "${formulaName}" a été sauvegardée (simulation).`,
    });
    // Reset form
    setFormulaName("");
    setApplicableMachines("");
    setRequiredSensors("");
    setFormulaExpression("");
    setAlertMessage("");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Créer une Nouvelle Formule</h1>
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
            <CardTitle className="text-2xl">Définition de la Formule</CardTitle>
            <CardDescription>
              Configurez les conditions et les messages pour les alertes automatiques.
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
                  Exemple: <code>sensor['temp'].value > machine.params['max_temp']</code> (si vous utilisez des paramètres machine).
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
                  Utilisez des placeholders comme <code>{'{sensor_variable.value}'}</code>, <code>{'{machine.name}'}</code>, <code>{'{machine.id}'}</code>.
                </p>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg">
                  <Save className="mr-2 h-5 w-5" />
                  Sauvegarder la Formule
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
