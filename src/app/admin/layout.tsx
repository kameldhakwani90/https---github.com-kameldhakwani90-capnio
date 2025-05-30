// This layout can be used if admin section needs specific wrappers or contexts
// For now, pages will use the main AppLayout directly.
// If specific admin sidebar or header elements were needed, this would be the place.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
