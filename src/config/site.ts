import type { Cog, FileText, FlaskConical, UserPlus, Users } from "lucide-react"; // Added Users

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Capnio.pro",
  description:
    "Intuitive Industrial Sensor Monitoring and Management Platform.",
  mainNav: [ // This is now primarily for the client view or as a fallback
    {
      title: "Dashboard",
      href: "/", // Default dashboard, context will determine if it's / or /client/dashboard
    },
    {
      title: "Monitoring",
      href: "/monitoring",
    },
     {
      title: "Asset Management", // For client view
      href: "/assets",
    },
    {
      title: "Notifications",
      href: "/notifications",
    },
  ],
  adminNav: [
    {
      title: "List Clients", // New
      href: "/admin/clients",
      // icon: Users, // Icon assignment is handled in AppLayout/AppSidebar
    },
    {
      title: "Create Client Account",
      href: "/admin/clients/create",
      // icon: UserPlus,
    },
    {
      title: "Sensor Declaration", // Renamed
      href: "/admin/sensors",
      // icon: Cog,
    },
    {
      title: "Formula Configuration", // Renamed
      href: "/admin/formulas",
      // icon: FileText,
    },
    {
      title: "Formula Validator",
      href: "/admin/formulas/validate",
      // icon: FlaskConical,
    },
  ]
};
