import type { Metadata } from "next";
import { EnrollForm } from "@/components/flows/enroll-form";

export const metadata: Metadata = {
  title: "Enroll",
};

export default function EnrollPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <EnrollForm />
    </div>
  );
}
