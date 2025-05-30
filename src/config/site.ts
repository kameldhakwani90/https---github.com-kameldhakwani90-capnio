
import type { Cog, FileText, FlaskConical, Users } from "lucide-react";

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
      title: "Asset Management", 
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
    },
    {
      title: "Sensor Declaration",
      href: "/admin/sensors",
    },
    {
      title: "Configuration des Contrôles", // Renommé
      href: "/admin/controls",             // Nouvelle URL
    },
    {
      title: "Formula Validator", // Conservé pour l'instant, peut nécessiter une révision
      href: "/admin/formulas/validate",
    },
  ]
};
