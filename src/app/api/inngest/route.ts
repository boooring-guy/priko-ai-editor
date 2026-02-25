import { serve } from "inngest/next";
import { helloWorld } from "@/inngest/functions/hello-world";
import { inngestClient } from "@/inngest/client";
import { demoGenerate } from "@/inngest/functions/demo-generate";

export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions: [helloWorld, demoGenerate],
});
