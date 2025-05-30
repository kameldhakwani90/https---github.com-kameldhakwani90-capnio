
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
    { id: "temperature", label: "Temperature" },
    { id: "humidity", label: "Humidity" },
    { id: "pressure", label: "Pressure" },
    { id: "air_quality", label: "Air Quality (CO2, VOC, PM)" },
    { id: "light", label: "Light" },
    { id: "motion", label: "Motion" },
    { id: "power", label: "Power/Battery" },
    { id: "location", label: "Location/GPS" },
    { id: "level_flow", label: "Level/Flow" },
    { id: "vibration_sound", label: "Vibration/Sound" },
    { id: "multi_purpose", label: "Multi-Purpose Sensor" },
    { id: "generic_other", label: "Generic/Other" },
];


export default function AdminSensorDefinitionPage() {
  const [sensorTypeName, setSensorTypeName] = useState("");
  const [sensorGeneralCategory, setSensorGeneralCategory] = useState("");
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
        setJsonError("Example JSON must be a valid JSON object (not an array or primitive).");
      }
    } catch (error) {
      setParsedJsonKeys([]);
      setKeyMappings({});
      if (error instanceof Error) {
        setJsonError(`Invalid JSON: ${error.message}`);
      } else {
        setJsonError("An unknown error occurred while parsing JSON.");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exampleJsonText]); 

  const handleMappingChange = (jsonKey: string, systemVariableId: string) => {
    setKeyMappings((prevMappings) => {
      const newMappings = { ...prevMappings };
      if (systemVariableId === "__NONE__") {
        newMappings[jsonKey] = ""; // Set to empty string to show placeholder
      } else {
        newMappings[jsonKey] = systemVariableId;
      }
      return newMappings;
    });
  };

  const handleSaveSensorType = () => {
    if (!sensorTypeName.trim()) {
        alert("Sensor Type Name is required.");
        return;
    }
    if (!sensorGeneralCategory) {
        alert("General Category is required.");
        return;
    }
    
    let parsedExamplePayload = null;
    if (exampleJsonText.trim() && !jsonError) {
        try {
            parsedExamplePayload = JSON.parse(exampleJsonText);
        } catch (e) {
            alert("Example JSON is invalid and cannot be saved.");
            return;
        }
    }

    const finalMappings: Record<string, string> = {};
    for (const key in keyMappings) {
        if (keyMappings[key] && keyMappings[key] !== "__NONE__") { 
            finalMappings[key] = keyMappings[key];
        }
    }

    const sensorTypeData = {
      name: sensorTypeName,
      category: sensorGeneralCategory,
      description: sensorDescription,
      examplePayload: parsedExamplePayload,
      mapping: finalMappings, 
    };
    console.log("Sensor Type Definition to Save:", JSON.stringify(sensorTypeData, null, 2));
    alert("Sensor Type definition simulated. Check console for data.");
  };


  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Cog className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Define Sensor Type and Data Mapping</h1>
          </div>
        </header>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">New Sensor Type Definition</CardTitle>
            <CardDescription>
              Define a new type of sensor by providing its details and mapping its raw JSON data output to standardized system variables.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sensorTypeName">Sensor Type Name *</Label>
                <Input 
                  id="sensorTypeName" 
                  placeholder="e.g., Ambient THL Sensor v2.1" 
                  value={sensorTypeName}
                  onChange={(e) => setSensorTypeName(e.target.value)}
                  required
                />
                 <p className="text-xs text-muted-foreground">A unique name for this type of sensor.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sensorGeneralCategory">General Category *</Label>
                <Select value={sensorGeneralCategory} onValueChange={setSensorGeneralCategory} required>
                  <SelectTrigger id="sensorGeneralCategory">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Removed: <SelectItem value="" disabled>-- Select Category --</SelectItem> */}
                    {GENERAL_SENSOR_CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Broad classification for this sensor type.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sensorDescription">Description</Label>
              <Textarea 
                id="sensorDescription" 
                placeholder="Brief description of the sensor type, its purpose, common use cases, etc." 
                value={sensorDescription}
                onChange={(e) => setSensorDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exampleJsonText">Example JSON Payload from Sensor</Label>
              <Textarea 
                id="exampleJsonText" 
                placeholder='Paste an example of the raw JSON data this sensor type sends, e.g., { "t": 23.5, "h": 55.2, "l": 750, "bat_v": 3.1 }'
                rows={5} 
                value={exampleJsonText}
                onChange={(e) => setExampleJsonText(e.target.value)}
                className={jsonError ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <p className="text-xs text-muted-foreground">
                The system will parse this JSON to identify data keys for mapping. Must be a valid JSON object.
              </p>
              {jsonError && (
                <p className="text-sm text-destructive flex items-center gap-1 p-2 bg-destructive/10 rounded-md">
                  <AlertCircle className="h-4 w-4" /> {jsonError}
                </p>
              )}
            </div>

            {parsedJsonKeys.length > 0 && !jsonError && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Map JSON Keys to System Variables</h3>
                <CardDescription>
                  For each key found in your example JSON, select the Capnio.pro system variable it corresponds to. 
                  Unmapped keys will be ignored.
                </CardDescription>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">Incoming JSON Key</TableHead>
                        <TableHead className="w-[10%] text-center hidden md:table-cell">Maps to</TableHead>
                        <TableHead className="w-[50%]">Capnio.pro System Variable</TableHead>
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
                              value={keyMappings[key] || ""} // Ensure placeholder shows if value is ""
                              onValueChange={(value) => handleMappingChange(key, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select system variable..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__NONE__">-- Do not map --</SelectItem>
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
                Save Sensor Type Definition
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
