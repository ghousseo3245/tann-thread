import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "./_components/admin-shell";

export const metadata: Metadata = {
  title: "Admin | Tann & Thread",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
