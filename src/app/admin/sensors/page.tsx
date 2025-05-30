
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
import { Cog, AlertCircle } from "lucide-react";

const ALL_MEASUREMENT_TYPES = [
  { id: "temperature", label: "Temperature" },
  { id: "humidity", label: "Humidity" },
  { id: "pressure", label: "Pressure" },
  { id: "vibration", label: "Vibration" },
  { id: "voltage", label: "Voltage" },
  { id: "current", label: "Current" },
  { id: "flow_rate", label: "Flow Rate" },
  { id: "level", label: "Level" },
  { id: "custom", label: "Custom" },
];

interface ParsedSchemaProperty {
  name: string;
  type?: string; // JSON schema types: string, number, integer, boolean, array, object
}

export default function AdminSensorDeclarationPage() {
  const [sensorName, setSensorName] = useState("");
  const [selectedMeasurementTypes, setSelectedMeasurementTypes] = useState<string[]>([]);
  const [sensorUnit, setSensorUnit] = useState("");
  const [sensorDescription, setSensorDescription] = useState("");
  const [jsonSchemaText, setJsonSchemaText] = useState("");
  const [parsedSchemaProperties, setParsedSchemaProperties] = useState<ParsedSchemaProperty[]>([]);
  const [propertyMappings, setPropertyMappings] = useState<Record<string, string>>({});
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleMeasurementTypeChange = (typeId: string) => {
    setSelectedMeasurementTypes((prevTypes) =>
      prevTypes.includes(typeId)
        ? prevTypes.filter((t) => t !== typeId)
        : [...prevTypes, typeId]
    );
  };

  useEffect(() => {
    if (jsonSchemaText.trim() === "") {
      setParsedSchemaProperties([]);
      setPropertyMappings({});
      setJsonError(null);
      return;
    }
    try {
      const schema = JSON.parse(jsonSchemaText);
      if (schema && typeof schema === "object" && schema.properties && typeof schema.properties === "object") {
        const properties: ParsedSchemaProperty[] = Object.entries(schema.properties).map(([key, value]: [string, any]) => ({
          name: key,
          type: value?.type || "any",
        }));
        setParsedSchemaProperties(properties);
        // Reset mappings if schema changes significantly
        const newMappings: Record<string, string> = {};
        properties.forEach(p => {
            if (propertyMappings[p.name] && selectedMeasurementTypes.includes(propertyMappings[p.name])) {
                newMappings[p.name] = propertyMappings[p.name];
            }
        });
        setPropertyMappings(newMappings);
        setJsonError(null);
      } else {
        setParsedSchemaProperties([]);
        setPropertyMappings({});
        setJsonError("Invalid JSON Schema structure: 'properties' object is missing or invalid.");
      }
    } catch (error) {
      setParsedSchemaProperties([]);
      setPropertyMappings({});
      if (error instanceof Error) {
        setJsonError(`Error parsing JSON: ${error.message}`);
      } else {
        setJsonError("An unknown error occurred while parsing JSON.");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsonSchemaText]); // Removed selectedMeasurementTypes from deps to avoid resetting mappings on type selection change

  const handlePropertyMappingChange = (propertyName: string, measurementTypeId: string) => {
    setPropertyMappings((prevMappings) => ({
      ...prevMappings,
      [propertyName]: measurementTypeId,
    }));
  };

  const handleSaveSensorType = () => {
    const sensorTypeData = {
      name: sensorName,
      measurementTypes: selectedMeasurementTypes.map(id => ALL_MEASUREMENT_TYPES.find(t => t.id === id)?.label || id),
      unit: sensorUnit,
      description: sensorDescription,
      configSchema: jsonSchemaText ? JSON.parse(jsonSchemaText) : null,
      configPropertyMappings: propertyMappings,
    };
    console.log("Sensor Type Data to Save:", sensorTypeData);
    alert("Sensor type declaration simulated. Check console for data.");
    // Potentially reset form here
  };


  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b">
          <div className="flex items-center gap-2">
            <Cog className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Sensor Declaration</h1>
          </div>
          {/* <Button>Add New Sensor Type</Button> */}
        </header>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Declare New Sensor Type</CardTitle>
            <CardDescription>Define a new generic sensor type that can be detected and configured in the system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sensorName">Sensor Name</Label>
                <Input 
                  id="sensorName" 
                  placeholder="e.g., Ambient Temperature Sensor HT-01" 
                  value={sensorName}
                  onChange={(e) => setSensorName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sensorUnit">Unit of Measurement</Label>
                <Input 
                  id="sensorUnit" 
                  placeholder="e.g., °C, %, Pa, g, V, A" 
                  value={sensorUnit}
                  onChange={(e) => setSensorUnit(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Measurement Types</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 border rounded-md">
                {ALL_MEASUREMENT_TYPES.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.id}`}
                      checked={selectedMeasurementTypes.includes(type.id)}
                      onCheckedChange={() => handleMeasurementTypeChange(type.id)}
                    />
                    <Label htmlFor={`type-${type.id}`} className="font-normal">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sensorDescription">Description</Label>
              <Textarea 
                id="sensorDescription" 
                placeholder="Brief description of the sensor type and its purpose." 
                value={sensorDescription}
                onChange={(e) => setSensorDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sensorConfigParams">Configuration Parameters (JSON Schema)</Label>
              <Textarea 
                id="sensorConfigParams" 
                placeholder='e.g., { "type": "object", "properties": { "threshold_min": { "type": "number", "description": "Minimum alert threshold" }, "threshold_max": { "type": "number" } } }' 
                rows={5} 
                value={jsonSchemaText}
                onChange={(e) => setJsonSchemaText(e.target.value)}
                className={jsonError ? "border-destructive" : ""}
              />
              <p className="text-xs text-muted-foreground">
                Define the schema for parameters required during sensor instance configuration. Use standard JSON Schema format.
              </p>
              {jsonError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {jsonError}
                </p>
              )}
            </div>

            {parsedSchemaProperties.length > 0 && selectedMeasurementTypes.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Map Configuration Properties to Measurement Types</h3>
                <CardDescription>
                  Associate each configuration parameter from your schema with one of the selected measurement types for this sensor.
                </CardDescription>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Schema Property</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead>Map to Measurement Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedSchemaProperties.map((prop) => (
                      <TableRow key={prop.name}>
                        <TableCell className="font-mono text-sm">{prop.name}</TableCell>
                        <TableCell className="text-xs uppercase text-muted-foreground">{prop.type}</TableCell>
                        <TableCell>
                          <Select
                            value={propertyMappings[prop.name] || ""}
                            onValueChange={(value) => handlePropertyMappingChange(prop.name, value)}
                            disabled={selectedMeasurementTypes.length === 0}
                          >
                            <SelectTrigger className="w-full md:w-[200px]">
                              <SelectValue placeholder="Select measurement type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="" disabled>-- Select --</SelectItem>
                              {selectedMeasurementTypes.map((typeId) => {
                                const typeLabel = ALL_MEASUREMENT_TYPES.find(t => t.id === typeId)?.label || typeId;
                                return (
                                  <SelectItem key={typeId} value={typeId}>
                                    {typeLabel}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {parsedSchemaProperties.length > 0 && selectedMeasurementTypes.length === 0 && (
                 <p className="text-sm text-orange-600 flex items-center gap-1 p-4 bg-orange-50 border border-orange-200 rounded-md">
                  <AlertCircle className="h-4 w-4" /> Please select at least one Measurement Type above to map schema properties.
                </p>
            )}


            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveSensorType} size="lg">
                <Cog className="mr-2 h-5 w-5" />
                Save Sensor Type
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
