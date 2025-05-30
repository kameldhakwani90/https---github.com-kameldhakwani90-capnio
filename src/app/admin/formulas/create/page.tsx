
"use client";

// This file is deprecated and replaced by /src/app/admin/controls/create/page.tsx
// It can be deleted. For safety, I am leaving it empty.
// Or, it could redirect to the new controls page.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeprecatedCreateFormulaPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/controls/create');
  }, [router]);
  return null;
}
