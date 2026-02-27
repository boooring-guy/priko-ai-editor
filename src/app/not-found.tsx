import Link from "next/link";
import { TicTacToe } from "@/components/tic-tac-toe";

export default function NotFound() {
  return (
    <div className="relative flex items-center justify-center min-h-screen px-8">
      {/* Giant background 404 */}
      <span
        className="pointer-events-none select-none absolute inset-0 flex items-center justify-center font-black font-mono text-foreground/2 leading-none"
        style={{ fontSize: "clamp(200px, 40vw, 520px)" }}
        aria-hidden="true"
      >
        404
      </span>
      <div className="flex flex-col md:flex-row items-center gap-16 max-w-3xl w-full">
        {/* Left — error info */}
        <div className="flex flex-col gap-6 text-left flex-1">
          <div className="space-y-3">
            <p className="text-heading font-mono text-muted-foreground tracking-widest uppercase">
              Error 404
            </p>
            <h1 className="text-title text-foreground">Page not found</h1>
            <p className="text-body-sm text-muted-foreground leading-relaxed">
              You&apos;ve somehow ended up here. There&apos;s nothing to see —
              but there&apos;s a game on the right.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Back to Home
            </Link>
            <Link
              href="/projects"
              className="px-4 py-2 rounded-md text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              View Projects
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px self-stretch bg-border/40" />

        {/* Right — game */}
        <div className="flex-shrink-0">
          <TicTacToe />
        </div>
      </div>
    </div>
  );
}
