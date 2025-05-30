
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Building, Phone, Mail } from "lucide-react";

export default function AdminCreateClientPage() {
  // In a real app, this would use react-hook-form or similar for form handling
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const clientData = Object.fromEntries(formData.entries());
    console.log("Create client data (simulated):", clientData);
    // TODO: Call API to create client
    alert("Client account creation simulated. Check console for data.");
    event.currentTarget.reset();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Create New Client Account</h1>
          </div>
        </header>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Client Information</CardTitle>
            <CardDescription>Enter the details for the new client company.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center">
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                    Company Name
                  </Label>
                  <Input id="companyName" name="companyName" placeholder="e.g., Acme Corp" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName" className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4 text-muted-foreground" />
                    Contact Person Name
                  </Label>
                  <Input id="contactName" name="contactName" placeholder="e.g., Jane Doe" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input id="email" name="email" type="email" placeholder="e.g., contact@acme.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    Phone Number
                  </Label>
                  <Input id="phone" name="phone" type="tel" placeholder="e.g., +1-555-123-4567" />
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Client Account
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
