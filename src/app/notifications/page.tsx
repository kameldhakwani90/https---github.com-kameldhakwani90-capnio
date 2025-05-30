import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BellDot, AlertTriangle, Info, WifiOff, CheckCircle, Trash2, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const dummyNotifications = [
  { id: "n1", type: "breached_formula", severity: "critical", message: "CNC Mill A01: Temperature exceeds 90°C.", machine: "CNC Mill A01", timestamp: "2024-07-28 10:05:15", read: false },
  { id: "n2", type: "sensor_disconnected", severity: "warning", message: "Vibration Sensor on Pump P02 is offline.", machine: "Pump P02", timestamp: "2024-07-28 09:30:00", read: false },
  { id: "n3", type: "pi_offline", severity: "critical", message: "Raspberry Pi Gateway 'RPi-Factory-01' is offline.", device: "RPi-Factory-01", timestamp: "2024-07-27 18:00:00", read: true },
  { id: "n4", type: "breached_formula", severity: "info", message: "Robot Arm B02: Cycle time increased by 10%.", machine: "Robot Arm B02", timestamp: "2024-07-27 15:22:00", read: true },
];

const getSeverityIcon = (severity: string) => {
  if (severity === 'critical') return <AlertTriangle className="h-5 w-5 text-red-500" />;
  if (severity === 'warning') return <Info className="h-5 w-5 text-orange-500" />;
  if (severity === 'info') return <Info className="h-5 w-5 text-blue-500" />;
  return <CheckCircle className="h-5 w-5 text-green-500" />;
};

const getNotificationIcon = (type: string) => {
  if (type === 'breached_formula') return <AlertTriangle className="h-4 w-4 mr-2" />;
  if (type === 'sensor_disconnected') return <WifiOff className="h-4 w-4 mr-2 text-orange-500" />;
  if (type === 'pi_offline') return <WifiOff className="h-4 w-4 mr-2 text-red-500" />;
  return <BellDot className="h-4 w-4 mr-2" />;
};

export default function NotificationsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellDot className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Notifications & Alerts</h1>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Severity</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>Critical</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Warning</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Info</DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem>Breached Formula</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Sensor Disconnected</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Pi Offline</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">Mark all as read</Button>
          </div>
        </header>

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
            <TabsTrigger value="all">All ({dummyNotifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({dummyNotifications.filter(n => !n.read).length})</TabsTrigger>
            <TabsTrigger value="critical">Critical ({dummyNotifications.filter(n => n.severity === 'critical').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <NotificationList notifications={dummyNotifications} />
          </TabsContent>
          <TabsContent value="unread">
            <NotificationList notifications={dummyNotifications.filter(n => !n.read)} />
          </TabsContent>
          <TabsContent value="critical">
            <NotificationList notifications={dummyNotifications.filter(n => n.severity === 'critical')} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function NotificationList({ notifications }: { notifications: typeof dummyNotifications }) {
  if (notifications.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="py-10 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-lg text-muted-foreground">No notifications here.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="mt-4 space-y-4">
      {notifications.map((notification) => (
        <Card key={notification.id} className={`shadow-sm ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}>
          <CardContent className="p-4 flex items-start gap-4">
            <div className="flex-shrink-0 pt-1">
              {getSeverityIcon(notification.severity)}
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <p className={`font-semibold ${!notification.read ? 'text-primary' : ''}`}>
                  {getNotificationIcon(notification.type)}
                  {notification.message}
                </p>
                {!notification.read && <Badge variant="destructive" className="text-xs">New</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {notification.machine && `Machine: ${notification.machine} | `}
                {notification.device && `Device: ${notification.device} | `}
                Timestamp: {notification.timestamp}
              </p>
            </div>
            <div className="flex-shrink-0 space-x-1">
              {notification.read ? (
                 <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
              ) : (
                 <Button variant="outline" size="sm" className="h-8">Mark as read</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

