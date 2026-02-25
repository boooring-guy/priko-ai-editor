// POST /api/demo/blocking

import { generateText } from "ai";
import { aliyunAI } from "@/modules/ai/ai-providers";

export async function POST() {
  const response = await generateText({
    model: aliyunAI("qwen-plus"),
    prompt: "Give me an idea for a new app for students?",
  });

  return new Response(JSON.stringify(response), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
