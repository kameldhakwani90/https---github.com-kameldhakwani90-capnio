import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FlaskConical, PlayCircle } from "lucide-react";

export default function AdminFormulaValidationPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center gap-2">
          <FlaskConical className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Formula Validation Engine</h1>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Test Formula with Example Data</CardTitle>
            <CardDescription>Enter a formula expression and sample data payloads to test its output.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="formulaExpressionTest">Formula Expression to Test</Label>
              <Textarea id="formulaExpressionTest" placeholder="e.g., sensor['temp_1'].value > 30 && sensor['pressure_1'].value < 100" rows={3} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sensorDataPayload">Sensor Data Payload (JSON)</Label>
                <Textarea 
                  id="sensorDataPayload" 
                  placeholder='{
  "temp_1": { "value": 35, "unit": "°C" },
  "pressure_1": { "value": 90, "unit": "Pa" }
}' 
                  rows={8} 
                />
                 <p className="text-xs text-muted-foreground">Provide sample data as if coming from sensors.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="machineParamsPayload">Machine Parameters Payload (JSON)</Label>
                <Textarea 
                  id="machineParamsPayload" 
                  placeholder='{
  "max_temp_threshold": 30,
  "min_pressure_threshold": 80
}' 
                  rows={8} 
                />
                 <p className="text-xs text-muted-foreground">Provide sample machine-specific parameters.</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button size="lg">
                <PlayCircle className="mr-2 h-5 w-5" />
                Validate Formula
              </Button>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="validationResult">Validation Result</Label>
              <Textarea id="validationResult" placeholder="Validation output will appear here..." readOnly rows={4} className="bg-muted/50" />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
