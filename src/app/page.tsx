"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/modules/auth/api/use-current-user";
import { UserButton } from "@/modules/auth/components/user-button";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useCurrentUser();

  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center border-b p-4 px-8 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight">Priko Workspace</h1>
        <UserButton />
      </header>

      <main className="p-8 flex-1">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome, {session.user.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground mt-2">
              This is your simple test paragraph. Below is some application
              info.
            </p>
          </div>

          <div className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm">
            <h2 className="text-xl font-semibold font-mono leading-relaxed">
              Polaris is a browser-based IDE inspired by Cursor AI, featuring:
            </h2>
            <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground font-mono">
              <li>Real-time collaborative code editing</li>
              <li>AI-powered code suggestions</li>
              <li>Quick edit (Cmd+K)</li>
            </ul>
          </div>

          <Button>Click me to perform an action</Button>
        </div>
      </main>
    </div>
  );
}
