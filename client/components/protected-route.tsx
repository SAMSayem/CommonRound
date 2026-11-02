"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { PageSkeleton } from "@/components/ui";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && !data?.user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [data?.user, isPending, pathname, router]);

  if (isPending || !data?.user) return <PageSkeleton />;
  return children;
}
