
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cog, PlusCircle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// Dummy data for sensor type list - replace with actual data fetching in a real app
const dummySensorTypes = [
  { id: "st-001", name: "Sonde Ambiante THL v2.1", categories: ["Température", "Humidité"], description: "Mesure température et humidité ambiantes." },
  { id: "st-002", name: "Capteur de Pression P-500", categories: ["Pression"], description: "Capteur de pression industriel haute précision." },
  { id: "st-003", name: "Détecteur CO2 Z-Air", categories: ["Qualité de l'air (CO2, VOC, PM)"], description: "Moniteur de dioxyde de carbone." },
];

export default function AdminSensorTypesListPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Cog className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Gestion des Types de Capteurs</h1>
          </div>
          <Button asChild>
            <Link href="/admin/sensors/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Définir un Nouveau Type
            </Link>
          </Button>
        </header>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Types de Capteurs Définis</CardTitle>
            <CardDescription>Gérez les types de capteurs et leurs mappages de données.</CardDescription>
          </CardHeader>
          <CardContent>
            {dummySensorTypes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom du Type</TableHead>
                    <TableHead>Catégories Générales</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummySensorTypes.map((sensorType) => (
                    <TableRow key={sensorType.id}>
                      <TableCell className="font-medium">{sensorType.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {sensorType.categories.map(category => (
                            <Badge key={category} variant="secondary" className="text-xs">{category}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{sensorType.description}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" aria-label="Modifier le type de capteur">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Supprimer le type de capteur">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10">
                <Cog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">Aucun type de capteur défini.</p>
                <Button asChild className="mt-6">
                  <Link href="/admin/sensors/create">Définir Votre Premier Type de Capteur</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
