import type { Cog, FileText, FlaskConical, UserPlus } from "lucide-react"; // Added UserPlus

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
      title: "Sites",
      href: "/sites",
    },
    {
      title: "Machines",
      href: "/machines",
    },
    {
      title: "Notifications",
      href: "/notifications",
    },
  ],
  adminNav: [
     {
      title: "Sensor Config",
      href: "/admin/sensors",
      // icon: Cog, // Icon assignment is handled in AppLayout/AppSidebar for now
    },
    {
      title: "Formula Config",
      href: "/admin/formulas",
      // icon: FileText,
    },
    {
      title: "Formula Validator",
      href: "/admin/formulas/validate",
      // icon: FlaskConical,
    },
    {
      title: "Create Client Account",
      href: "/admin/clients/create",
      // icon: UserPlus, // Icon for create client
    },
  ]
};
