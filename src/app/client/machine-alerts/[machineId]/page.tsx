
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, FileText, Info, LineChart as LineChartIcon, ListChecks, Server, Thermometer, Settings2, Wind } from "lucide-react";
import { DUMMY_CLIENT_SITES_DATA, type Site, type Machine, type Zone, type ActiveControlInAlert, type HistoricalDataPoint, type ChecklistItem, type Status } from "@/app/client/sites/[...sitePath]/page"; // Re-using types and data
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from "recharts";

// Helper function to find a machine by its ID across all sites and zones
const findMachineById = (machineId: string): Machine | undefined => {
  for (const site of DUMMY_CLIENT_SITES_DATA) {
    const findInSite = (currentSite: Site): Machine | undefined => {
      for (const zone of currentSite.zones) {
        const foundMachine = zone.machines.find(m => m.id === machineId);
        if (foundMachine) return foundMachine;
      }
      if (currentSite.subSites) {
        for (const subSite of currentSite.subSites) {
          const foundInSub = findInSite(subSite);
          if (foundInSub) return foundInSub;
        }
      }
      return undefined;
    };
    const machine = findInSite(site);
    if (machine) return machine;
  }
  return undefined;
};

const getStatusIcon = (status: Status, className?: string): React.ReactNode => {
  const defaultClassName = "h-5 w-5";
  const combinedClassName = className ? `${defaultClassName} ${className}` : defaultClassName;
  switch (status) {
    case 'red': return <AlertTriangle className={cn(combinedClassName, "text-red-500")} />;
    case 'orange': return <Info className={cn(combinedClassName, "text-orange-500")} />;
    case 'green': return <CheckCircle2 className={cn(combinedClassName, "text-green-500")} />;
    default: return <Info className={cn(combinedClassName, "text-gray-400")} />;
  }
};

const getStatusText = (status: Status): string => {
  switch (status) {
    case 'red': return 'Problème Critique';
    case 'orange': return 'Avertissement';
    case 'green': return 'Opérationnel';
    default: return 'Indéterminé';
  }
};

const chartConfigBase = {
  value: {
    label: "Value", // Default, will be overridden
    color: "hsl(var(--chart-1))",
  },
};

export default function MachineAlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const machineId = params.machineId as string;

  const [machine, setMachine] = React.useState<Machine | null | undefined>(undefined);
  const [activeControl, setActiveControl] = React.useState<ActiveControlInAlert | null | undefined>(undefined);

  React.useEffect(() => {
    if (machineId) {
      const foundMachine = findMachineById(machineId);
      setMachine(foundMachine || null);
      setActiveControl(foundMachine?.activeControlInAlert || null);
    }
  }, [machineId]);

  if (machine === undefined || activeControl === undefined) {
    return (
      <AppLayout>
        <div className="p-6 text-center">Chargement des détails de l'alerte...</div>
      </AppLayout>
    );
  }

  if (!machine || !activeControl) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-destructive">Détails d'alerte non trouvés</h1>
          <p className="text-muted-foreground">Impossible de charger les informations pour cette machine ou alerte.</p>
          <Button onClick={() => router.back()} className="mt-6">
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
        </div>
      </AppLayout>
    );
  }

  const MachineIcon = machine.icon || Server;
  const chartData = activeControl.historicalData || [];
  const dynamicChartConfig = {
    value: {
      label: activeControl.relevantSensorVariable || "Valeur",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Retour à la vue précédente
            </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="text-2xl mb-1 flex items-center gap-2">
                        {getStatusIcon(machine.status, "h-7 w-7")}
                        {activeControl.controlName}
                    </CardTitle>
                    <CardDescription>
                        Machine: {machine.name} ({machine.type})
                    </CardDescription>
                </div>
                 <MachineIcon className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">
                    <FileText className="mr-2 h-4 w-4" /> Informations
                </TabsTrigger>
                <TabsTrigger value="history">
                    <LineChartIcon className="mr-2 h-4 w-4" />Détails & Historique
                </TabsTrigger>
                <TabsTrigger value="checklist">
                    <ListChecks className="mr-2 h-4 w-4" />Bonnes Pratiques
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4 p-4 border rounded-md bg-muted/30">
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-base mb-1">Description du Contrôle</h4>
                    <p className="text-muted-foreground">{activeControl.controlDescription}</p>
                  </div>
                  <div className="p-3 bg-background border border-destructive/30 rounded-md shadow-sm">
                    <h4 className="font-semibold text-base mb-1 text-destructive flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5"/> Détails de l'Alerte Actuelle
                    </h4>
                    <p className="text-foreground">{activeControl.alertDetails}</p>
                  </div>
                  {activeControl.formulaUsed && (
                    <div>
                      <h4 className="font-semibold text-base mb-1">Formule Déclenchée</h4>
                      <p className="font-mono text-xs text-muted-foreground p-2 bg-background/70 rounded-md border">{activeControl.formulaUsed}</p>
                    </div>
                  )}
                  {activeControl.currentValues && (
                    <div>
                        <h4 className="font-semibold text-base mb-1">Valeurs Actuelles des Capteurs</h4>
                        <ul className="list-disc list-inside pl-1 text-muted-foreground">
                        {Object.entries(activeControl.currentValues).map(([key, valObj]) => (
                            <li key={key}><span className="font-medium text-foreground">{key}:</span> {valObj.value}{valObj.unit ? ` ${valObj.unit}` : ''}</li>
                        ))}
                        </ul>
                    </div>
                  )}
                   {activeControl.thresholds && (
                    <div>
                        <h4 className="font-semibold text-base mb-1">Seuils du Contrôle</h4>
                        <ul className="list-disc list-inside pl-1 text-muted-foreground">
                        {Object.entries(activeControl.thresholds).map(([key, value]) => (
                            <li key={key}><span className="font-medium text-foreground">{key}:</span> {value}</li>
                        ))}
                        </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-4 p-4 border rounded-md bg-muted/30">
                {chartData.length > 0 ? (
                  <div>
                    <h4 className="font-semibold text-base mb-2 flex items-center">
                      <LineChartIcon className="mr-2 h-5 w-5 text-primary" />
                      Historique des Données ({activeControl.relevantSensorVariable || 'Valeur'})
                    </h4>
                    <ChartContainer config={dynamicChartConfig} className="h-[250px] w-full aspect-auto">
                      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tickLine={false} 
                          axisLine={false} 
                          tickMargin={8}
                          tickFormatter={(value) => typeof value === 'string' ? value.slice(0, 5) : value}
                        />
                        <YAxis 
                          tickLine={false} 
                          axisLine={false} 
                          tickMargin={8}
                          width={30}
                        />
                        <RechartsTooltip
                          cursor={true}
                          content={<ChartTooltipContent indicator="line" />}
                        />
                        <Legend />
                        <Line 
                          dataKey="value" 
                          name={dynamicChartConfig.value.label}
                          type="monotone" 
                          stroke="var(--color-value)" 
                          strokeWidth={2} 
                          dot={true}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucun historique de données disponible pour ce contrôle.</p>
                )}
              </TabsContent>

              <TabsContent value="checklist" className="mt-4 p-4 border rounded-md bg-muted/30">
                <h4 className="font-semibold text-base mb-3">Vérifications et Bonnes Pratiques</h4>
                {activeControl.checklist && activeControl.checklist.length > 0 ? (
                  <div className="space-y-3">
                    {activeControl.checklist.map((item, index) => (
                      <div key={item.id} className="flex items-center space-x-2 p-2 bg-background/70 rounded-md border">
                        <Checkbox id={`chk-${item.id}`} />
                        <Label htmlFor={`chk-${item.id}`} className="text-sm font-normal leading-snug">
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucune checklist de bonnes pratiques définie pour ce contrôle.</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

// Re-export necessary types if they were moved out of sitePath/page.tsx
// For now, they are imported from there.
// Consider creating a shared types file (e.g., src/types/client-assets.ts)
// if DUMMY_CLIENT_SITES_DATA is also moved to a shared service.
