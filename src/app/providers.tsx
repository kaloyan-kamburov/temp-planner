"use client";

import { SaasProvider } from "@saas-ui/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SaasProvider>{children}</SaasProvider>;
}
