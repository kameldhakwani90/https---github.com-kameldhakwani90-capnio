
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, PlusCircle, Edit, Trash2, FlaskConical, Settings2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// Dummy data for "Contrôles métier"
const dummyControls = [
  { 
    id: "control-001", 
    nomDuControle: "Contrôle Température Frigo", 
    typesDeMachinesConcernees: ["Frigo", "Congélateur"], 
    typesDeCapteursNecessaires: ["Température"],
    apercuFormuleVerification: "temp >= seuil_min && temp <= seuil_max"
  },
  { 
    id: "control-002", 
    nomDuControle: "Contrôle Consommation Électrique Moteur", 
    typesDeMachinesConcernees: ["Moteur Principal", "Pompe Hydraulique"], 
    typesDeCapteursNecessaires: ["Tension", "Courant"],
    apercuFormuleVerification: "conso <= seuil_max"
  },
  { 
    id: "control-003", 
    nomDuControle: "Alerte Pression Basse Huile Compresseur", 
    typesDeMachinesConcernees: ["Compresseur X2000"], 
    typesDeCapteursNecessaires: ["Pression Huile", "Niveau Huile"],
    apercuFormuleVerification: "pression_huile < 0.5"
  },
];

export default function AdminControlsListPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Settings2 className="h-8 w-8 text-primary" /> {/* Icône changée */}
            <h1 className="text-3xl font-bold">Configuration des Contrôles Métier</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/formulas/validate"> {/* Lien conservé pour l'instant */}
                <FlaskConical className="mr-2 h-4 w-4" /> Valider une Formule
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/controls/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Créer un Nouveau Contrôle
              </Link>
            </Button>
          </div>
        </header>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Contrôles Métier Définis</CardTitle>
            <CardDescription>Gérez les règles de surveillance et d'alerte pour les machines des clients.</CardDescription>
          </CardHeader>
          <CardContent>
            {dummyControls.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom du Contrôle</TableHead>
                    <TableHead>Machines Concernées</TableHead>
                    <TableHead>Types de Capteurs Nécessaires</TableHead>
                    <TableHead>Aperçu Formule de Vérification</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyControls.map((control) => (
                    <TableRow key={control.id}>
                      <TableCell className="font-medium">{control.nomDuControle}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {control.typesDeMachinesConcernees.map(machine => (
                            <Badge key={machine} variant="secondary" className="text-xs">{machine}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {control.typesDeCapteursNecessaires.map(sensorType => (
                            <Badge key={sensorType} variant="outline" className="text-xs">{sensorType}</Badge>
                          ))}
                        </div>
                      </TableCell>
                       <TableCell className="text-sm text-muted-foreground font-mono">{control.apercuFormuleVerification}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" aria-label="Modifier le contrôle" asChild>
                          <Link href={`/admin/controls/${control.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Supprimer le contrôle">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10">
                <Settings2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">Aucun contrôle métier défini.</p>
                <Button asChild className="mt-6">
                  <Link href="/admin/controls/create">Créer Votre Premier Contrôle</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
