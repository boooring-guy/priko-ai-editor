import { serve } from "inngest/next";
import { inngestClient } from "@/inngest/client";
import { demoGenerate } from "@/inngest/functions/demo-generate";
import { helloWorld } from "@/inngest/functions/hello-world";

export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions: [helloWorld, demoGenerate],
});
