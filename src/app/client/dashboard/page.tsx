
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smile } from "lucide-react";
import Image from "next/image";

export default function ClientDashboardPage() {
  // This is a placeholder. In a real app, this page would fetch and display client-specific data.
  // The sidebar might also be different for a client user.
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-12">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Smile className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-4xl font-bold">Welcome, Valued Client!</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              This is your dedicated dashboard. More features coming soon!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Here you will be able to monitor your connected sites and machines, view alerts, and manage your sensor data.
            </p>
            <div className="rounded-lg overflow-hidden shadow-md">
              <Image 
                src="https://placehold.co/600x300.png" 
                alt="Client dashboard placeholder" 
                width={600} 
                height={300}
                className="mx-auto"
                data-ai-hint="modern dashboard graph" 
              />
            </div>
            <p className="text-xs text-muted-foreground pt-4">
              For now, if you have any questions, please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
