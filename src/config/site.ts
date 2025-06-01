
import { type LucideIcon, Cog, FileText, FlaskConical, Users, Cpu, Layers } from "lucide-react";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Capnio.pro",
  description:
    "Intuitive Industrial Sensor Monitoring and Management Platform.",
  mainNav: [ 
    {
      title: "Dashboard",
      href: "/", 
    },
    {
      title: "Monitoring",
      href: "/monitoring",
    },
     {
      title: "Gestion des Actifs", 
      href: "/assets",
    },
    {
      title: "Notifications",
      href: "/notifications",
    },
  ],
  adminNav: [
    {
      title: "List Clients",
      href: "/admin/clients",
      icon: Users,
    },
    {
      title: "Sensor Declaration",
      href: "/admin/sensors",
      icon: Cog, 
    },
    {
      title: "Configuration des Contrôles",
      href: "/admin/controls",
      icon: FileText, // Changed from Settings to FileText to match getAdminIcon
    },
    {
      title: "Gestion des Types de Machines", 
      href: "/admin/machine-types",
      icon: Cpu,
    },
    {
      title: "Gestion des Types de Zones",
      href: "/admin/zone-types",
      icon: Layers, 
    },
    {
      title: "Formula Validator", 
      href: "/admin/formulas/validate",
      icon: FlaskConical,
    },
  ]
};
