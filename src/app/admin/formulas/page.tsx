
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, PlusCircle, Edit, Trash2, FlaskConical } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// Dummy data for formula list
const dummyFormulas = [
  { 
    id: "formula-001", 
    name: "Alerte Haute Température Moteur", 
    applicableMachines: ["Moteur Principal", "Pompe Hydraulique"], 
    requiredSensors: ["temp_moteur", "rpm"],
    conditionPreview: "temp_moteur > 85°C"
  },
  { 
    id: "formula-002", 
    name: "Alerte Pression Basse Huile", 
    applicableMachines: ["Compresseur X2000"], 
    requiredSensors: ["pression_huile", "niveau_huile"],
    conditionPreview: "pression_huile < 0.5 bar"
  },
  { 
    id: "formula-003", 
    name: "Vibration Excessive Détectée", 
    applicableMachines: ["Broyeur Industriel", "Centrifugeuse"], 
    requiredSensors: ["vibration_x", "vibration_y", "vibration_z"],
    conditionPreview: "avg(vibration_x, vibration_y, vibration_z) > 2.5g"
  },
];

export default function AdminFormulasListPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Gestion des Formules</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/formulas/validate">
                <FlaskConical className="mr-2 h-4 w-4" /> Valider une Formule
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/formulas/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Créer une Nouvelle Formule
              </Link>
            </Button>
          </div>
        </header>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Formules Définies</CardTitle>
            <CardDescription>Gérez les formules de détection d'anomalies et d'alertes.</CardDescription>
          </CardHeader>
          <CardContent>
            {dummyFormulas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom de la Formule</TableHead>
                    <TableHead>Machines Applicables</TableHead>
                    <TableHead>Capteurs Requis (Variables Système)</TableHead>
                    <TableHead>Condition (Aperçu)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyFormulas.map((formula) => (
                    <TableRow key={formula.id}>
                      <TableCell className="font-medium">{formula.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {formula.applicableMachines.map(machine => (
                            <Badge key={machine} variant="secondary" className="text-xs">{machine}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {formula.requiredSensors.map(sensor => (
                            <Badge key={sensor} variant="outline" className="text-xs font-mono">{sensor}</Badge>
                          ))}
                        </div>
                      </TableCell>
                       <TableCell className="text-sm text-muted-foreground font-mono">{formula.conditionPreview}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" aria-label="Modifier la formule" asChild>
                          <Link href={`/admin/formulas/${formula.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Supprimer la formule">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">Aucune formule définie.</p>
                <Button asChild className="mt-6">
                  <Link href="/admin/formulas/create">Créer Votre Première Formule</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
