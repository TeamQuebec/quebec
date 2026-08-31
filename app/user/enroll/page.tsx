import type { Metadata } from "next";
import { AppShell } from "@/components/dashboard/app-shell";
import { EnrollForm } from "@/components/flows/enroll-form";

export const metadata: Metadata = {
  title: "Enroll",
};

export default function EnrollPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-xl py-4 sm:py-6">
        <EnrollForm />
      </div>
    </AppShell>
  );
}
