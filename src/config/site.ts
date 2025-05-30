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
    },
    {
      title: "Formula Config",
      href: "/admin/formulas",
    },
    {
      title: "Formula Validator",
      href: "/admin/formulas/validate",
    },
  ]
};
