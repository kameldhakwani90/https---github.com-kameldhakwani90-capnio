import type { LucideIcon } from 'lucide-react';

export type Status = 'green' | 'orange' | 'red' | 'white';
export type NodeType = 'site' | 'zone' | 'machine' | 'sensor' | 'raspberrypi' | 'group';

export interface NavItem {
  id: string;
  label: string;
  href?: string; // For making the item a link, optional
  icon?: LucideIcon;
  children?: NavItem[];
  status?: Status;
  type: NodeType;
  // Potentially other data specific to the node
  data?: Record<string, any>;
  onClick?: () => void; // Callback for when item is clicked
}
