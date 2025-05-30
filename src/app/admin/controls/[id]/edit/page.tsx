
"use client"; // MUST be the first line

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings2, Save, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Drastically simplified for debugging parsing error
const REQUIRED_SENSOR_TYPES_OPTIONS = [
  { id: "temperature", label: "Température" },
  { id: "humidity", label: "Humidité" },
  // Add more back if this version parses correctly
];

export default function AdminEditControlPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const controlId = params.id as string;

  const [nomDuControle, setNomDuControle] = useState<string>("");
  const [typesDeMachinesConcernees, setTypesDeMachinesConcernees] = useState<string>("");
  const [selectedSensorTypes, setSelectedSensorTypes] = useState<string[]>([]);
  const [variablesUtilisees, setVariablesUtilisees] = useState<string>("");
  const [formuleDeCalcul, setFormuleDeCalcul] = useState<string>("");
  const [formuleDeVerification, setFormuleDeVerification] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (!controlId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    // Simulate fetching data - dummyControls is removed for parsing debug
    // This means controlToEdit will always be null for now
    const controlToEdit: any = null; 

    if (controlToEdit) {
      setNomDuControle(controlToEdit.nomDuControle || "");
      setTypesDeMachinesConcernees(
        Array.isArray(controlToEdit.typesDeMachinesConcernees)
          ? controlToEdit.typesDeMachinesConcernees.join(", ")
          : ""
      );

      const newSelectedSensorTypesFromData: string[] = [];
      if (controlToEdit.typesDeCapteursNecessaires && Array.isArray(controlToEdit.typesDeCapteursNecessaires)) {
        for (const label of controlToEdit.typesDeCapteursNecessaires) {
          const foundOption = REQUIRED_SENSOR_TYPES_OPTIONS.find(opt => opt.label === label);
          if (foundOption && foundOption.id) {
            newSelectedSensorTypesFromData.push(foundOption.id);
          }
        }
      }
      setSelectedSensorTypes(newSelectedSensorTypesFromData);

      setVariablesUtilisees(
        Array.isArray(controlToEdit.variablesUtilisees)
          ? controlToEdit.variablesUtilisees.join(", ")
          : ""
      );
      setFormuleDeCalcul(controlToEdit.formuleDeCalcul || "");
      setFormuleDeVerification(controlToEdit.formuleDeVerification || "");
      setDescription(controlToEdit.description || "");
      setNotFound(false);
    } else {
      // If controlToEdit is null (because dummyControls is removed or no match)
      setNotFound(true); 
    }
    setIsLoading(false);
  }, [controlId]);

  const handleSensorTypeChange = (sensorTypeId: string, checked: boolean) => {
    setSelectedSensorTypes(prev =>
      checked ? [...prev, sensorTypeId] : prev.filter(id => id !== sensorTypeId)
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const selectedSensorTypeLabels = selectedSensorTypes.map(id => {
      const option = REQUIRED_SENSOR_TYPES_OPTIONS.find(opt => opt.id === id);
      return option ? option.label : id;
    });

    const machineTypesArray = typesDeMachinesConcernees
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== "");

    const variablesArray = variablesUtilisees
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== "");

    const updatedControlData = {
      id: controlId,
      nomDuControle: nomDuControle,
      typesDeMachinesConcernees: machineTypesArray,
      typesDeCapteursNecessaires: selectedSensorTypeLabels,
      variablesUtilisees: variablesArray,
      formuleDeCalcul: formuleDeCalcul.trim() === "" ? "" : formuleDeCalcul.trim(), // Use empty string instead of null
      formuleDeVerification: formuleDeVerification.trim(),
      description: description.trim(),
    };

    console.log("Contrôle métier mis à jour (simulation):", updatedControlData);
    toast({
      title: "Contrôle Métier Mis à Jour",
      description: `Le contrôle "${updatedControlData.nomDuControle}" a été mis à jour (simulation).`,
    });
    router.push("/admin/controls");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 text-center">Chargement du contrôle métier...</div>
      </AppLayout>
    );
  }

  if (notFound) {
    return (
      <AppLayout>
        <div className="p-6 text-center text-destructive">Contrôle métier non trouvé. Veuillez vérifier l'ID ou retourner à la liste pour sélectionner un contrôle valide.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Settings2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Modifier le Contrôle Métier</h1>
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
            <CardTitle className="text-2xl">Détails du Contrôle Métier</CardTitle>
            <CardDescription>
              Modifiez la configuration de cette règle de surveillance.
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
                <Label htmlFor="typesDeMachinesConcernees">Types de machines concernées (séparés par virgule)</Label>
                <Input
                  id="typesDeMachinesConcernees"
                  value={typesDeMachinesConcernees}
                  onChange={(e) => setTypesDeMachinesConcernees(e.target.value)}
                  placeholder="Ex: Frigo, Congélateur, Armoire électrique"
                />
              </div>

              <div className="space-y-2">
                <Label>Types de capteurs nécessaires *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 border rounded-md">
                  {REQUIRED_SENSOR_TYPES_OPTIONS.map((type) => (
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
                 <p className="text-xs text-muted-foreground">Ex: <code>temp</code>, <code>pression_huile</code>, <code>machine.params.seuil_max</code>.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formuleDeCalcul">Formule de calcul (optionnel)</Label>
                <Textarea
                  id="formuleDeCalcul"
                  value={formuleDeCalcul}
                  onChange={(e) => setFormuleDeCalcul(e.target.value)}
                  placeholder="Ex: conso = courant * tension"
                  rows={2}
                />
                 <p className="text-xs text-muted-foreground">
                  Ex: <code>sensor['conso'].value = sensor['courant'].value * sensor['tension'].value</code>.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formuleDeVerification">Formule de vérification *</Label>
                <Textarea
                  id="formuleDeVerification"
                  value={formuleDeVerification}
                  onChange={(e) => setFormuleDeVerification(e.target.value)}
                  placeholder="Ex: temp >= seuil_min && temp <= seuil_max OU conso <= seuil_max"
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Ex: <code>sensor['temp'].value >= machine.params['seuil_min'] && sensor['temp'].value <= machine.params['seuil_max']</code>.
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
                <Button type="submit" size="lg" disabled={selectedSensorTypes.length === 0}>
                  <Save className="mr-2 h-5 w-5" />
                  Mettre à Jour le Contrôle
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
