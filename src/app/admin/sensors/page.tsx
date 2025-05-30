
"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cog, AlertCircle, ArrowRight } from "lucide-react";

// Predefined System Variables for mapping
const SYSTEM_VARIABLES_OPTIONS = [
  { id: "temp", label: "Temperature (temp)" },
  { id: "hum", label: "Humidity (hum)" },
  { id: "press", label: "Pressure (press)" },
  { id: "co2", label: "CO2 Level (co2)" },
  { id: "voc", label: "VOC Level (voc)" },
  { id: "pm25", label: "PM2.5 (pm25)" },
  { id: "pm10", label: "PM10 (pm10)" },
  { id: "light", label: "Light Level (light)" },
  { id: "motion", label: "Motion (motion)" },
  { id: "battery_percent", label: "Battery Level % (battery_percent)" },
  { id: "battery_voltage", label: "Battery Voltage (battery_voltage)" },
  { id: "rssi", label: "Signal Strength RSSI (rssi)" },
  { id: "snr", label: "Signal-to-Noise Ratio (snr)" },
  { id: "gps_lat", label: "GPS Latitude (gps_lat)" },
  { id: "gps_lon", label: "GPS Longitude (gps_lon)" },
  { id: "gps_alt", label: "GPS Altitude (gps_alt)" },
  { id: "water_level", label: "Water Level (water_level)" },
  { id: "flow_rate", label: "Flow Rate (flow_rate)" },
  { id: "vibration", label: "Vibration (vibration)" },
  { id: "sound_level", label: "Sound Level (sound_level)" },
  { id: "count", label: "Generic Count (count)" },
  { id: "switch_state", label: "Switch State (on/off) (switch_state)" },
  { id: "analog_value", label: "Analog Value (analog_value)" },
  { id: "digital_value", label: "Digital Value (digital_value)" },
  { id: "text_value", label: "Text Value (text_value)" },
  { id: "timestamp", label: "Timestamp (timestamp)" },
  { id: "error_code", label: "Error Code (error_code)" },
  { id: "status_text", label: "Status Text (status_text)" },
  { id: "other", label: "Other/Uncategorized (other)" },
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


export default function AdminSensorDefinitionPage() {
  const [sensorTypeName, setSensorTypeName] = useState("");
  const [sensorType, setSensorType] = useState(""); // Changed from sensorGeneralCategory
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
    if (!sensorType) { // Changed from sensorGeneralCategory
        alert("Le type de capteur est requis.");
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

    const sensorTypeData = {
      name: sensorTypeName,
      type: sensorType, // Changed from category
      description: sensorDescription,
      examplePayload: parsedExamplePayload,
      mapping: finalMappings, 
    };
    console.log("Définition du type de capteur à sauvegarder:", JSON.stringify(sensorTypeData, null, 2));
    alert("Définition du type de capteur simulée. Vérifiez la console pour les données.");
  };


  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Cog className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Définir le Type de Capteur et le Mappage des Données</h1>
          </div>
        </header>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Nouvelle Définition de Type de Capteur</CardTitle>
            <CardDescription>
              Définissez un nouveau type de capteur en fournissant ses détails et en mappant sa sortie de données JSON brutes à des variables système standardisées.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sensorTypeName">Nom du type de capteur *</Label>
                <Input 
                  id="sensorTypeName" 
                  placeholder="Ex: Sonde Ambiante THL v2.1" 
                  value={sensorTypeName}
                  onChange={(e) => setSensorTypeName(e.target.value)}
                  required
                />
                 <p className="text-xs text-muted-foreground">Un nom unique pour ce type de capteur.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sensorType">Type de capteur *</Label>
                <Select value={sensorType} onValueChange={setSensorType} required>
                  <SelectTrigger id="sensorType">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENERAL_SENSOR_CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Classification générale pour ce type de capteur.</p>
              </div>
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
              <Label htmlFor="exampleJsonText">Exemple de JSON reçu</Label>
              <Textarea 
                id="exampleJsonText" 
                placeholder='Collez un exemple des données JSON brutes que ce type de capteur envoie, ex: { "t": 23.5, "h": 55.2, "l": 750, "bat_v": 3.1 }'
                rows={5} 
                value={exampleJsonText}
                onChange={(e) => setExampleJsonText(e.target.value)}
                className={jsonError ? "border-destructive focus-visible:ring-destructive" : ""}
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
                  Pour chaque clé trouvée dans votre exemple JSON, sélectionnez la variable système Capnio.pro correspondante.
                  Les clés non mappées seront ignorées.
                </CardDescription>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">Clé JSON détectée</TableHead>
                        <TableHead className="w-[10%] text-center hidden md:table-cell">Maps to</TableHead>
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
                              value={keyMappings[key] || ""}
                              onValueChange={(value) => handleMappingChange(key, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionnez une variable système..." />
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

