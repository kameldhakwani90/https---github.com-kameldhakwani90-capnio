
"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, DollarSign, TrendingUp, Package, CheckCircle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format, isPast, differenceInDays, parseISO } from 'date-fns';

// Dummy client data structure
interface Client {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  subscriptionEndDate?: string; // YYYY-MM-DD
  maxSensors?: number;
  status: 'Active' | 'Inactive' | 'Expired';
  registeredOn: string; // YYYY-MM-DD
  sensorsUsed: number;
}

// Extended dummy clients with more details for dashboard
const dummyClients: Client[] = [
  { id: "client-001", companyName: "Acme Innovations", contactName: "John Doe", email: "john.doe@acme.com", phone: "+1-555-0101", status: "Active", subscriptionEndDate: "2024-12-31", maxSensors: 100, registeredOn: "2023-01-15", sensorsUsed: 75 },
  { id: "client-002", companyName: "Beta Solutions", contactName: "Jane Smith", email: "jane.smith@beta.com", phone: "+1-555-0202", status: "Active", subscriptionEndDate: "2025-06-15", maxSensors: 50, registeredOn: "2023-03-20", sensorsUsed: 40 },
  { id: "client-003", companyName: "Gamma Services", contactName: "Robert Brown", email: "robert.brown@gamma.com", phone: "+1-555-0303", status: "Expired", subscriptionEndDate: "2024-01-31", maxSensors: 200, registeredOn: "2022-11-01", sensorsUsed: 180 },
  { id: "client-004", companyName: "Delta Corp", contactName: "Alice Green", email: "alice.green@delta.com", status: "Active", subscriptionEndDate: "2024-08-10", maxSensors: 75, registeredOn: "2023-05-10", sensorsUsed: 80 }, // Exceeded sensors
  { id: "client-005", companyName: "Epsilon Ltd", contactName: "Bob White", email: "bob.white@epsilon.com", status: "Inactive", subscriptionEndDate: "2023-10-01", maxSensors: 30, registeredOn: "2023-02-01", sensorsUsed: 15 },
];

interface AdminSettings {
  basePrice: number;
  pricePerSensor: number;
  currencySymbol: string;
}

const defaultAdminSettings: AdminSettings = {
  basePrice: 50,
  pricePerSensor: 5,
  currencySymbol: '$',
};

export default function AdminDashboardPage() {
  const [clients, setClients] = useState<Client[]>(dummyClients); // In real app, fetch this data
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(defaultAdminSettings);

  useEffect(() => {
    // Load admin settings from localStorage
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setAdminSettings({
            basePrice: parseFloat(parsedSettings.basePrice) || defaultAdminSettings.basePrice,
            pricePerSensor: parseFloat(parsedSettings.pricePerSensor) || defaultAdminSettings.pricePerSensor,
            currencySymbol: parsedSettings.currencySymbol || defaultAdminSettings.currencySymbol,
        });
      } catch (error) {
        console.error("Failed to parse saved settings for dashboard:", error);
        setAdminSettings(defaultAdminSettings);
      }
    }
    // In a real app, you would fetch clients from an API
    // For now, we update their status based on subscriptionEndDate
    const updatedClients = dummyClients.map(client => {
      if (client.subscriptionEndDate && isPast(parseISO(client.subscriptionEndDate))) {
        return { ...client, status: 'Expired' };
      }
      return client;
    });
    setClients(updatedClients);

  }, []);

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'Active' && c.subscriptionEndDate && !isPast(parseISO(c.subscriptionEndDate))).length;
  
  const clientsWithIssues = clients.filter(c => 
    (c.subscriptionEndDate && isPast(parseISO(c.subscriptionEndDate))) || 
    (c.maxSensors !== undefined && c.sensorsUsed > c.maxSensors)
  ).length;

  const expiringSoonClients = clients.filter(c => {
    if (!c.subscriptionEndDate || c.status !== 'Active') return false;
    const endDate = parseISO(c.subscriptionEndDate);
    return !isPast(endDate) && differenceInDays(endDate, new Date()) <= 30;
  }).length;

  const calculateMonthlyRevenue = () => {
    return clients.reduce((total, client) => {
      if (client.status === 'Active' && client.subscriptionEndDate && !isPast(parseISO(client.subscriptionEndDate))) {
        const clientRevenue = adminSettings.basePrice + (client.sensorsUsed * adminSettings.pricePerSensor);
        return total + clientRevenue;
      }
      return total;
    }, 0);
  };

  const monthlyRevenue = calculateMonthlyRevenue();
  const dailyRevenue = monthlyRevenue / 30; // Approximate

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="pb-4">
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Administrator! Here's an overview of your platform.</p>
        </header>

        {/* KPI Cards Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalClients}</div>
              <p className="text-xs text-muted-foreground">{activeClients} currently active</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{adminSettings.currencySymbol}{monthlyRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Estimated daily: {adminSettings.currencySymbol}{dailyRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients with Issues</CardTitle>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{clientsWithIssues}</div>
              <p className="text-xs text-muted-foreground">Expired or over sensor limit</p>
            </CardContent>
          </Card>
           <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Package className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{expiringSoonClients}</div>
              <p className="text-xs text-muted-foreground">Subscriptions ending in 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Stats Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-lg col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Client Overview</CardTitle>
              <CardDescription>Summary of client statuses and sensor usage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {clients.slice(0, 5).map(client => ( // Display first 5 clients as example
                <div key={client.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50">
                  <div>
                    <p className="font-semibold">{client.companyName}</p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                  <div className="text-right">
                     <Badge 
                        variant={client.status === 'Active' ? 'default' : client.status === 'Expired' ? 'destructive' : 'secondary'}
                        className={client.status === 'Active' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                      >
                        {client.status}
                      </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sensors: {client.sensorsUsed} / {client.maxSensors ?? 'N/A'}
                      {client.maxSensors !== undefined && client.sensorsUsed > client.maxSensors && (
                        <XCircle className="inline-block ml-1 h-3 w-3 text-destructive" />
                      )}
                       {client.maxSensors !== undefined && client.sensorsUsed <= client.maxSensors && (
                        <CheckCircle className="inline-block ml-1 h-3 w-3 text-green-500" />
                      )}
                    </p>
                     {client.subscriptionEndDate && (
                       <p className="text-xs text-muted-foreground">
                         Sub. End: {format(parseISO(client.subscriptionEndDate), "MMM dd, yyyy")}
                         {isPast(parseISO(client.subscriptionEndDate)) && <span className="text-destructive"> (Expired)</span>}
                       </p>
                     )}
                  </div>
                </div>
              ))}
               {clients.length > 5 && <p className="text-sm text-center text-muted-foreground pt-2">And {clients.length - 5} more clients...</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
