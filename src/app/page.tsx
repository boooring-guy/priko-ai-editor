"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { Header } from "@/components/layout/header";
import { useCurrentUser } from "@/modules/auth/api/use-current-user";
import { ProjectsView } from "@/modules/projects/components/projects-view";

const SUBTITLES = [
  "Let's build something amazing today.",
  "Your projects are waiting for you.",
  "Ready to ship some magic?",
  "What will you create today?",
  "Time to make things happen.",
];

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", emoji: "☀️" };
  if (hour < 17) return { text: "Good afternoon", emoji: "🌤️" };
  if (hour < 21) return { text: "Good evening", emoji: "🌙" };
  return { text: "Happy late night", emoji: "✨" };
}

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useCurrentUser();

  const greeting = React.useMemo(() => getGreeting(), []);
  const subtitle = React.useMemo(
    () => SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)],
    [],
  );

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

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="p-8 flex-1">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* ── Welcome hero ── */}
          <div className="relative py-2">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/6 blur-3xl" />

            <div className="relative space-y-1.5">
              {/* Greeting badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-caption font-medium text-primary mb-1">
                <span>{greeting.emoji}</span>
                <span>{greeting.text}</span>
              </div>

              <h1 className="text-title-lg font-bold tracking-tight">
                Hey, <span className="">{firstName}</span>
                <span className="ml-1.5 inline-block origin-[70%_70%] animate-[wave_2.5s_ease-in-out_infinite]">
                  👋
                </span>
              </h1>

              <p className="text-body text-muted-foreground">{subtitle}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <ProjectsView />
          </div>
        </div>
      </main>
    </div>
  );
}
