
"use client";

import React, { useState } from 'react';
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Settings as SettingsIcon, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [basePrice, setBasePrice] = useState("50"); // Default example value
  const [pricePerSensor, setPricePerSensor] = useState("5"); // Default example value
  const [currencySymbol, setCurrencySymbol] = useState("$"); // Default example value

  const handleSaveSettings = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const settingsData = {
      basePrice: parseFloat(basePrice),
      pricePerSensor: parseFloat(pricePerSensor),
      currencySymbol,
    };
    // In a real app, you would save this to a backend or localStorage.
    console.log("Admin settings saved (simulated):", settingsData);
    // For demonstration, we can store it in localStorage
    localStorage.setItem('adminSettings', JSON.stringify(settingsData));

    toast({
      title: "Settings Saved",
      description: "Subscription pricing has been updated.",
    });
  };

  React.useEffect(() => {
    // Load settings from localStorage if they exist
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.basePrice !== undefined) setBasePrice(String(parsedSettings.basePrice));
        if (parsedSettings.pricePerSensor !== undefined) setPricePerSensor(String(parsedSettings.pricePerSensor));
        if (parsedSettings.currencySymbol) setCurrencySymbol(parsedSettings.currencySymbol);
      } catch (error) {
        console.error("Failed to parse saved settings:", error);
      }
    }
  }, []);


  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Settings</h1>
          </div>
        </header>

        <Card className="shadow-xl max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Subscription Pricing</CardTitle>
            <CardDescription>
              Configure the pricing model for client subscriptions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="basePrice" className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                  Base Monthly Subscription Price
                </Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  placeholder="e.g., 50"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerSensor" className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                  Additional Monthly Price Per Sensor
                </Label>
                <Input
                  id="pricePerSensor"
                  name="pricePerSensor"
                  type="number"
                  placeholder="e.g., 5"
                  value={pricePerSensor}
                  onChange={(e) => setPricePerSensor(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currencySymbol" className="flex items-center">
                  Currency Symbol
                </Label>
                <Input
                  id="currencySymbol"
                  name="currencySymbol"
                  type="text"
                  placeholder="e.g., $"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  maxLength={5}
                  required
                />
                 <p className="text-xs text-muted-foreground">
                  Examples: $, €, £, ¥
                </p>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Save className="mr-2 h-5 w-5" />
                  Save Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
