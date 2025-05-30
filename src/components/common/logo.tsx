import { MountainSnow } from 'lucide-react';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-primary ${className || ''}`} aria-label="Capnio.pro Home">
      <MountainSnow className="h-6 w-6" />
      <span className="font-semibold text-lg">Capnio.pro</span>
    </Link>
  );
}
