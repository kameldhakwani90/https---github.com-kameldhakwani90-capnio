
"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Save, ChevronLeft } from "lucide-react"; // Changed icon from Settings2
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const REQUIRED_SENSOR_TYPES_OPTIONS = [
  { id: "temperature", label: "Température" },
  { id: "humidity", label: "Humidité" },
  { id: "pressure", label: "Pression" },
  { id: "voltage", label: "Tension" },
  { id: "current", label: "Courant" },
  { id: "power", label: "Puissance" },
  { id: "vibration", label: "Vibration" },
  { id: "co2", label: "CO2" },
  { id: "flow_rate", label: "Débit" },
  { id: "level", label: "Niveau" },
  { id: "status", label: "État (On/Off)" },
  { id: "other", label: "Autre" },
];

// Dummy machine types, in a real app, fetch this from your backend
const AVAILABLE_MACHINE_TYPES = [
  { id: "mt-001", name: "Frigo" },
  { id: "mt-002", name: "Pompe Hydraulique" },
  { id: "mt-003", name: "Armoire Électrique" },
  { id: "mt-004", name: "Compresseur" },
  { id: "mt-005", name: "Moteur Principal" },
  { id: "mt-006", name: "Congélateur" },
];

export default function AdminCreateControlPage() {
  const { toast } = useToast();
  const [nomDuControle, setNomDuControle] = useState("");
  const [selectedMachineTypes, setSelectedMachineTypes] = useState<string[]>([]);
  const [selectedSensorTypes, setSelectedSensorTypes] = useState<string[]>([]);
  const [variablesUtilisees, setVariablesUtilisees] = useState("");
  const [formuleDeCalcul, setFormuleDeCalcul] = useState("");
  const [formuleDeVerification, setFormuleDeVerification] = useState("");
  const [description, setDescription] = useState("");

  const handleSensorTypeChange = (sensorTypeId: string, checked: boolean) => {
    setSelectedSensorTypes(prev =>
      checked ? [...prev, sensorTypeId] : prev.filter(id => id !== sensorTypeId)
    );
  };

  const handleMachineTypeChange = (machineTypeName: string, checked: boolean) => {
    setSelectedMachineTypes(prev =>
      checked ? [...prev, machineTypeName] : prev.filter(name => name !== machineTypeName)
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedSensorTypes.length === 0) {
       toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner au moins un type de capteur nécessaire.",
        variant: "destructive",
      });
      return;
    }
     if (!nomDuControle.trim()) {
       toast({
        title: "Erreur de validation",
        description: "Le nom du contrôle est requis.",
        variant: "destructive",
      });
      return;
    }
    if (!variablesUtilisees.trim()) {
       toast({
        title: "Erreur de validation",
        description: "Les variables système utilisées sont requises.",
        variant: "destructive",
      });
      return;
    }
    if (!formuleDeVerification.trim()) {
       toast({
        title: "Erreur de validation",
        description: "La formule de vérification est requise.",
        variant: "destructive",
      });
      return;
    }


    const selectedSensorTypeLabels = selectedSensorTypes.map(id => {
      const option = REQUIRED_SENSOR_TYPES_OPTIONS.find(opt => opt.id === id);
      return option ? option.label : id;
    });

    const controlData = {
      id: `control-${Date.now().toString()}`, // Simulate ID generation
      nomDuControle,
      typesDeMachinesConcernees: selectedMachineTypes, // Now an array of names
      typesDeCapteursNecessaires: selectedSensorTypeLabels,
      variablesUtilisees: variablesUtilisees.split(',').map(s => s.trim()).filter(s => s),
      formuleDeCalcul: formuleDeCalcul.trim() === "" ? "" : formuleDeCalcul,
      formuleDeVerification,
      description,
    };
    console.log("Nouveau contrôle métier créé (simulation):", controlData);
    toast({
      title: "Contrôle Métier Créé",
      description: `Le contrôle "${nomDuControle}" a été sauvegardé (simulation).`,
    });
    // Reset form
    setNomDuControle("");
    setSelectedMachineTypes([]);
    setSelectedSensorTypes([]);
    setVariablesUtilisees("");
    setFormuleDeCalcul("");
    setFormuleDeVerification("");
    setDescription("");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Créer un Nouveau Contrôle Métier</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/controls">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour à la liste des contrôles
            </Link>
          </Button>
        </header>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Définition du Contrôle Métier</CardTitle>
            <CardDescription>
              Configurez les règles de surveillance et d'alerte pour les machines des clients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nomDuControle">Nom du contrôle *</Label>
                <Input 
                  id="nomDuControle" 
                  value={nomDuControle}
                  onChange={(e) => setNomDuControle(e.target.value)}
                  placeholder="Ex: Contrôle température frigo" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Types de machines concernées</Label>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 border rounded-md">
                  {AVAILABLE_MACHINE_TYPES.map(type => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`machine-type-${type.id}`}
                        checked={selectedMachineTypes.includes(type.name)}
                        onCheckedChange={(checked) => handleMachineTypeChange(type.name, !!checked)}
                      />
                      <Label htmlFor={`machine-type-${type.id}`} className="font-normal text-sm">
                        {type.name}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Laissez vide si applicable à toutes machines avec les capteurs requis.</p>
              </div>

              <div className="space-y-2">
                <Label>Types de capteurs nécessaires *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 border rounded-md">
                  {REQUIRED_SENSOR_TYPES_OPTIONS.map(type => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sensor-type-${type.id}`}
                        checked={selectedSensorTypes.includes(type.id)}
                        onCheckedChange={(checked) => handleSensorTypeChange(type.id, !!checked)}
                      />
                      <Label htmlFor={`sensor-type-${type.id}`} className="font-normal text-sm">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedSensorTypes.length === 0 && <p className="text-xs text-destructive">Veuillez sélectionner au moins un type de capteur.</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="variablesUtilisees">Variables système utilisées (séparées par virgule) *</Label>
                <Input 
                  id="variablesUtilisees" 
                  value={variablesUtilisees}
                  onChange={(e) => setVariablesUtilisees(e.target.value)}
                  placeholder="Ex: temp, tension, courant, conso" 
                  required
                />
                <p className="text-xs text-muted-foreground">Ces variables doivent correspondre à celles utilisées dans vos formules (ex: <code>temp</code>, <code>pression_huile</code>).</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formuleDeCalcul">Formule de calcul (optionnel)</Label>
                <Textarea 
                  id="formuleDeCalcul" 
                  value={formuleDeCalcul}
                  onChange={(e) => setFormuleDeCalcul(e.target.value)}
                  placeholder="Ex: conso = sensor['courant'].value * sensor['tension'].value" 
                  rows={2} 
                />
                <p className="text-xs text-muted-foreground">
                  Utilisée pour dériver une nouvelle variable à partir d'autres.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formuleDeVerification">Formule de vérification *</Label>
                <Textarea 
                  id="formuleDeVerification" 
                  value={formuleDeVerification}
                  onChange={(e) => setFormuleDeVerification(e.target.value)}
                  placeholder="Ex: sensor['temp'].value >= machine.params['seuil_min'] && sensor['temp'].value <= machine.params['seuil_max']" 
                  rows={4} 
                  required
                />
                <p className="text-xs text-muted-foreground">
                  L'expression doit évaluer à <code>true</code> (OK) ou <code>false</code> (Alerte).
                  Utilisez <code>sensor['variable']</code> et <code>machine.params['seuil']</code>.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (lisible par le client final)</Label>
                <Textarea 
                  id="description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Expliquez ce que ce contrôle vérifie et son importance." 
                  rows={3}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={selectedSensorTypes.length === 0 || !nomDuControle.trim() || !variablesUtilisees.trim() || !formuleDeVerification.trim()}
                >
                  <Save className="mr-2 h-5 w-5" />
                  Sauvegarder le Contrôle
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
