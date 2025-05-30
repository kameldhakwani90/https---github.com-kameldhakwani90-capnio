import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Cog } from "lucide-react";

export default function AdminSensorDeclarationPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cog className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Sensor Declaration</h1>
          </div>
          <Button>Add New Sensor Type</Button>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Declare New Sensor Type</CardTitle>
            <CardDescription>Define a new generic sensor type that can be detected and configured in the system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sensorName">Sensor Name</Label>
                <Input id="sensorName" placeholder="e.g., Ambient Temperature Sensor" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sensorType">Measurement Type</Label>
                <Select>
                  <SelectTrigger id="sensorType">
                    <SelectValue placeholder="Select measurement type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temperature">Temperature</SelectItem>
                    <SelectItem value="humidity">Humidity</SelectItem>
                    <SelectItem value="pressure">Pressure</SelectItem>
                    <SelectItem value="vibration">Vibration</SelectItem>
                    <SelectItem value="voltage">Voltage</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sensorUnit">Unit of Measurement</Label>
              <Input id="sensorUnit" placeholder="e.g., °C, %, Pa, g, V, A" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sensorDescription">Description</Label>
              <Textarea id="sensorDescription" placeholder="Brief description of the sensor type and its purpose." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sensorConfigParams">Configuration Parameters (JSON Schema)</Label>
              <Textarea id="sensorConfigParams" placeholder='e.g., { "type": "object", "properties": { "threshold_min": { "type": "number" }, "threshold_max": { "type": "number" } } }' rows={5} />
              <p className="text-xs text-muted-foreground">Define the schema for parameters required during sensor instance configuration.</p>
            </div>
            <div className="flex justify-end">
              <Button>Save Sensor Type</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
