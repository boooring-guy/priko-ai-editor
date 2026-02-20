import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <Button className="text-white">Click me</Button>

      <h1 className="text-3xl font-bold ">This is simple Test paragraph</h1>
      <h1 className="text-3xl font-bold font-mono">
        Polaris is a browser-based IDE inspired by Cursor AI, featuring:
        Real-time collaborative code editing AI-powered code suggestions and
        quick edit (Cmd+K) Conversation-based AI assistant In-browser code
        execution with WebContainer GitHub import/export integration Multi-file
        project management
      </h1>
    </div>
  );
}
