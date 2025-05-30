"use client";

import type { NavItem } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from 'next/image';

interface InfoPanelProps {
  item: NavItem | null;
}

export function InfoPanel({ item }: InfoPanelProps) {
  if (!item) {
    return (
      <Card className="w-full h-full flex flex-col items-center justify-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Capnio.pro</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select an item from the navigation tree to see its details.</p>
           <Image 
            src="https://placehold.co/600x400.png" 
            alt="Capnio.pro dashboard placeholder" 
            width={600} 
            height={400}
            className="rounded-md mt-4"
            data-ai-hint="industrial machinery"
          />
        </CardContent>
      </Card>
    );
  }

  const Icon = item.icon;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        {Icon && <Icon className="h-10 w-10 text-primary" />}
        <div>
          <CardTitle className="text-2xl">{item.label}</CardTitle>
          <CardDescription>Type: {item.type} {item.status && <span className="ml-2 inline-flex items-center gap-1"><StatusBadge status={item.status} /> {item.status}</span>}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-280px)] pr-4"> {/* Adjust height as needed */}
          <div className="space-y-4">
            {item.data && Object.entries(item.data).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="font-medium capitalize text-muted-foreground">{key.replace(/([A-Z])/g, ' $1')}:</span>
                <span className="text-foreground">{String(value)}</span>
              </div>
            ))}

            {item.type === 'sensor' && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2 text-lg">Sensor Reading History</h4>
                {/* Placeholder for graph */}
                <div className="h-64 w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground shadow-inner">
                  <Image 
                    src={`https://placehold.co/400x200.png`}
                    alt="Sensor data placeholder graph"
                    width={400}
                    height={200}
                    data-ai-hint="data graph"
                  />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex space-x-2">
          <Button variant="outline">View History</Button>
          <Button>Configure</Button>
          {item.status === 'red' && <Button variant="destructive">Acknowledge Alert</Button>}
        </div>
      </CardFooter>
    </Card>
  );
}
