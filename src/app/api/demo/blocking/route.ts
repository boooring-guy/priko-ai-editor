// POST /api/demo/blocking

import { generateText } from "ai";
import { aliyunAI, vertexAi } from "@/modules/ai/ai-providers";

export async function POST() {
  const response = await generateText({
    // model: aliyunAI("qwen-plus"),
    model: vertexAi("openai/gpt-oss-120b-maas"),
    prompt: "Give me an idea for a new app for students?",
  });

  return new Response(JSON.stringify(response), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
