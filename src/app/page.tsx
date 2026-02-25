"use client";

import { version } from "../../package.json";
import { CloudCog, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/modules/auth/api/use-current-user";
import { UserButton } from "@/modules/auth/components/user-button";
import { CreateProjectModal } from "@/modules/projects/components/create-project-modal";
import { inngestClient } from "../inngest/client";
import { INNGEST } from "../inngest/keys";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useCurrentUser();
  const [isBlocking, setIsBlocking] = React.useState(false);
  const [response, setResponse] = React.useState<any>(null);
  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  async function handleDemoBlocking() {
    setIsBlocking(true);
    const response = await fetch("/api/demo/blocking", {
      method: "POST",
    });

    const data = await response.json();
    setResponse(data);
    setIsBlocking(false);
  }

  async function handleBackground() {
    setIsBlocking(true);
    const response = await inngestClient.send({
      name: INNGEST.TEST.DEMO_GENERATE.EVENT,
      data: {
        prompt:
          "Explain async javascript with TypeScript and provide a code example First example has to be simple and as we progress the example should get more complex max examples 7",
      },
    });

    console.log(response);
    setIsBlocking(false);
  }

  if (isPending || isBlocking) {
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
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight">Priko Workspace</h1>
          <span className="text-xs text-muted-foreground">v{version}</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <UserButton />
        </div>
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

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">
                Projects
              </h2>
              <CreateProjectModal />
            </div>

            <Button
              onClick={async () => await handleDemoBlocking()}
              disabled={isPending}
            >
              Demo Blocking
            </Button>

            <Button
              onClick={async () => await handleBackground()}
              disabled={isPending}
            >
              Demo Non-Blocking
            </Button>

            <div className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm">
              <h2 className="text-xl font-semibold font-mono leading-relaxed">
                Polaris is a browser-based IDE inspired by Cursor AI, featuring:
              </h2>
              <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground font-mono">
                {isBlocking && <Loader2 className="h-6 w-6 animate-spin" />}
                {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
