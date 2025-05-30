
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function AdminFormulaCreationPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b">
           <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Formula Creation</h1>
          </div>
          <div className="space-x-2">
            <Button variant="outline" asChild>
              <Link href="/admin/formulas/validate">Validate Formula</Link>
            </Button>
            <Button>Create New Formula</Button>
          </div>
        </header>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Create New Formula</CardTitle>
            <CardDescription>Define dynamic formulas applicable to a range of machines and sensors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="formulaName">Formula Name</Label>
              <Input id="formulaName" placeholder="e.g., High Temperature Alert" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicableMachines">Applicable Machine Types (comma-separated)</Label>
              <Input id="applicableMachines" placeholder="e.g., CNC Mill, Compressor, HVAC Unit" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="requiredSensors">Required Sensor Types (comma-separated)</Label>
              <Input id="requiredSensors" placeholder="e.g., Temperature, Pressure" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="formulaExpression">Formula Expression</Label>
              <Textarea id="formulaExpression" placeholder="e.g., sensor['temperature'].value > machine.params['max_temp']" rows={3} />
              <p className="text-xs text-muted-foreground">
                Use `sensor['sensor_id'].value` for sensor readings and `machine.params['param_name']` for machine-specific parameters.
                The expression should evaluate to true (alert) or false (normal).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alertMessage">Alert Message Template</Label>
              <Input id="alertMessage" placeholder="e.g., Critical: Temperature {sensor['temperature'].value}°C exceeds threshold of {machine.params['max_temp']}°C on {machine.name}." />
               <p className="text-xs text-muted-foreground">
                Use placeholders like `{'{sensor_id.value}'}` or `{'{machine.name}'}`.
              </p>
            </div>
            <div className="flex justify-end">
              <Button>Save Formula</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
