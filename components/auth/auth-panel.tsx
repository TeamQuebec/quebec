"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/state/app-context";
import { SYNTHETIC_USERS } from "@/lib/mockData/users";
import { BUSINESSES } from "@/lib/mockData/businesses";

/**
 * The password field's value : bcrypt-shaped, and the digest of nothing.
 *
 * It is here to be looked at, not checked. A real credential store holds a hash
 * and never the password, so that is what the field shows — which also means the
 * screen can be a convincing sign-in without a password existing anywhere in it.
 */
const DEMO_PASSWORD_HASH = "$2b$12$Kj8sQm2vT9pLxR4nWcYb7uE1hD3zA6fG0iN5oSqXtVrPmUkJlH";

/** Legal-form suffixes that a business's own name should not become part of its handle. */
const DROPPED = new Set(["ng", "ltd", "plc", "inc", "hmo", "co"]);

/**
 * A synthetic address for a demo record. Nothing looks up mail at this domain :
 * the handle is derived from the name only so the same record always produces
 * the same address, and the domain is `quebec-demo.ng` rather than anything
 * plausible so the address reads as fake at a glance.
 */
function emailFor(name: string) {
  const handle = name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !DROPPED.has(w))
    .join(".");
  return `${handle}@quebec-demo.ng`;
}

/**
 * Sign-in.
 *
 * The record you pick here is the account the portal opens as : its reference,
 * its dashboards, its access log, its receipts. Switching to another one loads
 * that account's data, not just a new label on the same page.
 *
 * The form is dressed as a real sign-in — an email field, a filled password, a
 * Sign in button — because that is the shape of the thing being demonstrated,
 * and a demo that flinches from its own subject demonstrates less. What keeps it
 * honest is not the absence of the costume but the two places it says what it
 * is: the credential is visibly a hash rather than a secret, and hovering the
 * password field tells you outright that no data is real. The field is readOnly
 * rather than disabled so it stays focusable — the note opens on keyboard focus
 * too, and a disabled input would hide both the value and the explanation from
 * anyone not using a mouse.
 */
export function AuthPanel({ kind, mode }: { kind: "user" | "business"; mode: "signin" | "signup" }) {
  const router = useRouter();
  const { signIn } = useApp();

  const records: { id: string; name: string; detail: string; email: string }[] =
    kind === "user"
      ? SYNTHETIC_USERS.map((u) => ({
          id: u.id,
          name: u.name,
          detail: u.uniqueId,
          email: emailFor(u.name),
        }))
      : BUSINESSES.map((b) => ({
          id: b.id,
          name: b.name,
          detail: b.sector,
          email: emailFor(b.name),
        }));

  const [id, setId] = useState(records[0].id);
  const [pending, setPending] = useState(false);

  const record = records.find((r) => r.id === id) ?? records[0];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      await signIn(kind, id);
      router.push(kind === "user" ? "/user/dashboard" : "/business/dashboard");
    } finally {
      setPending(false);
    }
  }

  const portal = kind === "user" ? "User portal" : "Business portal";
  const otherMode = mode === "signin" ? "signup" : "signin";
  const signup = mode === "signup";

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-md">
        <Logo />
        <Card className="mt-10">
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{portal}</p>
            <CardTitle className="text-2xl">{signup ? "Create your account" : "Sign in"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              You&apos;ll open {kind === "user" ? "this holder's" : "this business's"} own dashboard.
              Sign out and pick another at any time.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="demo-email">Email</Label>
                <Select value={id} onValueChange={setId}>
                  <SelectTrigger id="demo-email" aria-label={`Demo ${kind} account`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {records.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* The address alone does not say whose dashboard is about to
                    open, so the account is named underneath it. */}
                <p className="text-xs text-muted-foreground">
                  {record.name} · <span className="font-mono">{record.detail}</span>
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="demo-password">Password</Label>
                <div className="group relative">
                  <Input
                    id="demo-password"
                    type="password"
                    readOnly
                    value={DEMO_PASSWORD_HASH}
                    aria-readonly="true"
                    aria-describedby="demo-password-note"
                    // Native tooltip as well as the styled one below: this is the
                    // one message on the screen that must not be missable.
                    title="No real data : this is a mock-up sign-in."
                    className="cursor-not-allowed bg-brand-50/50 pr-10"
                  />
                  <Lock
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {/* Dashed and unfilled, like every other absence claim in the
                      product. Kept in the DOM rather than mounted on hover so
                      `aria-describedby` has something to point at. */}
                  <div
                    id="demo-password-note"
                    role="tooltip"
                    className="pointer-events-none absolute bottom-[calc(100%_+_0.5rem)] left-0 right-0 z-20 flex items-start gap-2 rounded-lg border border-dashed border-brand-300 bg-white px-3 py-2 opacity-0 shadow-[0_8px_24px_rgba(23,23,23,0.10)] transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
                  >
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden="true" />
                    <p className="text-xs leading-relaxed text-brand-700">
                      <span className="font-semibold text-brand-950">No real data.</span> This is a
                      mock-up sign-in : the password is a prefilled hash and cannot be edited.
                    </p>
                  </div>
                </div>
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  bcrypt · {DEMO_PASSWORD_HASH.slice(0, 26)}…
                </p>
              </div>

              <Button className="w-full" type="submit" disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {pending ? "Opening…" : signup ? "Start session" : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm">
              <Link href={`/auth/${kind}/${otherMode}`} className="font-medium text-brand-900 underline underline-offset-2 hover:text-brand-950">
                {signup ? "Back to sign in" : "Or start a new session"}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
