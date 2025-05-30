
"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cog, AlertCircle, ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";

// Predefined System Variables for mapping
const SYSTEM_VARIABLES_OPTIONS = [
  { id: "temp", label: "Température (temp)" },
  { id: "hum", label: "Humidité (hum)" },
  { id: "press", label: "Pression (press)" },
  { id: "co2", label: "Niveau CO2 (co2)" },
  { id: "voc", label: "Niveau VOC (voc)" },
  { id: "pm25", label: "PM2.5 (pm25)" },
  { id: "pm10", label: "PM10 (pm10)" },
  { id: "light", label: "Niveau de lumière (light)" },
  { id: "motion", label: "Mouvement (motion)" },
  { id: "battery_percent", label: "Niveau Batterie % (battery_percent)" },
  { id: "battery_voltage", label: "Voltage Batterie (battery_voltage)" },
  { id: "rssi", label: "Force du Signal RSSI (rssi)" },
  { id: "snr", label: "Rapport Signal/Bruit (snr)" },
  { id: "gps_lat", label: "GPS Latitude (gps_lat)" },
  { id: "gps_lon", label: "GPS Longitude (gps_lon)" },
  { id: "gps_alt", label: "GPS Altitude (gps_alt)" },
  { id: "water_level", label: "Niveau d'eau (water_level)" },
  { id: "flow_rate", label: "Débit (flow_rate)" },
  { id: "vibration", label: "Vibration (vibration)" },
  { id: "sound_level", label: "Niveau Sonore (sound_level)" },
  { id: "count", label: "Compteur Générique (count)" },
  { id: "switch_state", label: "État Interrupteur (on/off) (switch_state)" },
  { id: "analog_value", label: "Valeur Analogique (analog_value)" },
  { id: "digital_value", label: "Valeur Numérique (digital_value)" },
  { id: "text_value", label: "Valeur Texte (text_value)" },
  { id: "timestamp", label: "Horodatage (timestamp)" },
  { id: "error_code", label: "Code d'Erreur (error_code)" },
  { id: "status_text", label: "Texte de Statut (status_text)" },
  { id: "other", label: "Autre/Non Catégorisé (other)" },
];

const GENERAL_SENSOR_CATEGORIES = [
    { id: "temperature", label: "Température" },
    { id: "humidity", label: "Humidité" },
    { id: "pressure", label: "Pression" },
    { id: "air_quality", label: "Qualité de l'air (CO2, VOC, PM)" },
    { id: "light", label: "Luminosité" },
    { id: "motion", label: "Mouvement" },
    { id: "power", label: "Alimentation/Batterie" },
    { id: "location", label: "Localisation/GPS" },
    { id: "level_flow", label: "Niveau/Débit" },
    { id: "vibration_sound", label: "Vibration/Son" },
    { id: "multi_purpose", label: "Capteur Polyvalent" },
    { id: "generic_other", label: "Générique/Autre" },
];


export default function AdminCreateSensorTypePage() {
  const [sensorTypeName, setSensorTypeName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [exampleJsonText, setExampleJsonText] = useState("");
  const [parsedJsonKeys, setParsedJsonKeys] = useState<string[]>([]);
  const [keyMappings, setKeyMappings] = useState<Record<string, string>>({});
  const [sensorDescription, setSensorDescription] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (exampleJsonText.trim() === "") {
      setParsedJsonKeys([]);
      setKeyMappings({}); 
      setJsonError(null);
      return;
    }
    try {
      const parsed = JSON.parse(exampleJsonText);
      if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
        const keys = Object.keys(parsed);
        setParsedJsonKeys(keys);
        
        const newMappings: Record<string, string> = {};
        keys.forEach(key => {
            if(keyMappings[key] && SYSTEM_VARIABLES_OPTIONS.some(opt => opt.id === keyMappings[key])) {
                newMappings[key] = keyMappings[key];
            } else {
                newMappings[key] = ""; 
            }
        });
        setKeyMappings(newMappings);
        setJsonError(null);
      } else {
        setParsedJsonKeys([]);
        setKeyMappings({});
        setJsonError("L'exemple JSON doit être un objet JSON valide (pas un tableau ou une primitive).");
      }
    } catch (error) {
      setParsedJsonKeys([]);
      setKeyMappings({});
      if (error instanceof Error) {
        setJsonError(`JSON Invalide: ${error.message}`);
      } else {
        setJsonError("Une erreur inconnue est survenue lors de l'analyse du JSON.");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exampleJsonText]); 

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories(prev => 
      checked ? [...prev, categoryId] : prev.filter(id => id !== categoryId)
    );
  };

  const handleMappingChange = (jsonKey: string, systemVariableId: string) => {
    setKeyMappings((prevMappings) => {
      const newMappings = { ...prevMappings };
      if (systemVariableId === "__NONE__") {
        newMappings[jsonKey] = ""; 
      } else {
        newMappings[jsonKey] = systemVariableId;
      }
      return newMappings;
    });
  };

  const handleSaveSensorType = () => {
    if (!sensorTypeName.trim()) {
        alert("Le nom du type de capteur est requis.");
        return;
    }
    if (selectedCategories.length === 0) {
        alert("Au moins un type de capteur général doit être sélectionné.");
        return;
    }
    
    let parsedExamplePayload = null;
    if (exampleJsonText.trim() && !jsonError) {
        try {
            parsedExamplePayload = JSON.parse(exampleJsonText);
        } catch (e) {
            alert("L'exemple JSON est invalide et ne peut être sauvegardé.");
            return;
        }
    }

    const finalMappings: Record<string, string> = {};
    for (const key in keyMappings) {
        if (keyMappings[key] && keyMappings[key] !== "__NONE__" && keyMappings[key] !== "") { 
            finalMappings[key] = keyMappings[key];
        }
    }
    
    // Get labels for selected categories
    const categoryLabels = selectedCategories.map(catId => {
        const category = GENERAL_SENSOR_CATEGORIES.find(c => c.id === catId);
        return category ? category.label : catId;
    });

    const sensorTypeData = {
      name: sensorTypeName,
      categories: categoryLabels, // Store labels for easier display
      description: sensorDescription,
      examplePayload: parsedExamplePayload,
      mapping: finalMappings, 
    };
    console.log("Définition du type de capteur à sauvegarder:", JSON.stringify(sensorTypeData, null, 2));
    alert("Définition du type de capteur simulée. Vérifiez la console pour les données.");
    // Here you would typically send this data to your backend/Firebase
  };


  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Cog className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Définir un Nouveau Type de Capteur</h1>
          </div>
           <Button variant="outline" asChild>
            <Link href="/admin/sensors">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>
        </header>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Informations et Mappage des Données</CardTitle>
            <CardDescription>
              Définissez un nouveau type de capteur et comment ses données JSON brutes sont interprétées par le système.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sensorTypeName">Nom du type de capteur *</Label>
              <Input 
                id="sensorTypeName" 
                placeholder="Ex: Sonde Ambiante THL v2.1" 
                value={sensorTypeName}
                onChange={(e) => setSensorTypeName(e.target.value)}
                required
              />
               <p className="text-xs text-muted-foreground">Un nom unique et descriptif pour ce type de capteur.</p>
            </div>

            <div className="space-y-2">
                <Label>Types de capteur (catégories générales) *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 border rounded-md">
                    {GENERAL_SENSOR_CATEGORIES.map(cat => (
                        <div key={cat.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`category-${cat.id}`}
                                checked={selectedCategories.includes(cat.id)}
                                onCheckedChange={(checked) => handleCategoryChange(cat.id, !!checked)}
                            />
                            <Label htmlFor={`category-${cat.id}`} className="font-normal text-sm">
                                {cat.label}
                            </Label>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">Sélectionnez une ou plusieurs catégories générales pour ce type de capteur.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sensorDescription">Description</Label>
              <Textarea 
                id="sensorDescription" 
                placeholder="Brève description du type de capteur, son objectif, cas d'usage courants, etc." 
                value={sensorDescription}
                onChange={(e) => setSensorDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exampleJsonText">Exemple de JSON reçu *</Label>
              <Textarea 
                id="exampleJsonText" 
                placeholder='Collez un exemple des données JSON brutes que ce type de capteur envoie, ex: { "t": 23.5, "h": 55.2, "l": 750, "bat_v": 3.1 }'
                rows={5} 
                value={exampleJsonText}
                onChange={(e) => setExampleJsonText(e.target.value)}
                className={jsonError ? "border-destructive focus-visible:ring-destructive" : ""}
                required
              />
              <p className="text-xs text-muted-foreground">
                Le système analysera ce JSON pour identifier les clés de données à mapper. Doit être un objet JSON valide.
              </p>
              {jsonError && (
                <p className="text-sm text-destructive flex items-center gap-1 p-2 bg-destructive/10 rounded-md">
                  <AlertCircle className="h-4 w-4" /> {jsonError}
                </p>
              )}
            </div>

            {parsedJsonKeys.length > 0 && !jsonError && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Mapper les clés JSON aux variables système</h3>
                <CardDescription>
                  Pour chaque clé JSON détectée dans l'exemple, associez-la à la variable système Capnio.pro correspondante.
                  Les clés non mappées ou mappées à "-- Ne pas mapper --" seront stockées telles quelles ou ignorées selon la logique du système.
                </CardDescription>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">Clé JSON détectée</TableHead>
                        <TableHead className="w-[10%] text-center hidden md:table-cell">S'associe à</TableHead>
                        <TableHead className="w-[50%]">Associer à variable système</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedJsonKeys.map((key) => (
                        <TableRow key={key}>
                          <TableCell className="font-mono text-sm break-all pr-2">
                            {key}
                            <span className="text-muted-foreground md:hidden"> →</span>
                          </TableCell>
                          <TableCell className="text-center hidden md:table-cell">
                            <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="pl-2">
                            <Select
                              value={keyMappings[key] || "__NONE__"} // Default to __NONE__ if not mapped
                              onValueChange={(value) => handleMappingChange(key, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionnez une variable..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__NONE__">-- Ne pas mapper --</SelectItem>
                                {SYSTEM_VARIABLES_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.id} value={opt.id}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6">
              <Button onClick={handleSaveSensorType} size="lg">
                <Cog className="mr-2 h-5 w-5" />
                Créer le type de capteur
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

