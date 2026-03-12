import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createVertex } from "@ai-sdk/google-vertex";

import { envs } from "../../envs";

export const googleAI = createGoogleGenerativeAI({
  apiKey: envs.GOOGLE_API_KEY,
});

export const openAI = createOpenAI({
  apiKey: envs.OPEN_AI_API_KEY,
});

export const anthropicAI = createAnthropic({
  apiKey: envs.ANTHROPIC_API_KEY || "dummy-key-for-initialization",
});

export const aliyunAI = createOpenAICompatible({
  name: "aliyun",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: envs.ALIYUN_API_KEY,
});

export const vertexAi = createVertex({
  project: envs.GOOGLE_VERTEX_PROJECT_ID,
  location: envs.GOOGLE_VERTEX_LOCATION,
  apiKey: envs.GOOGLE_VERTEX_API_KEY,
});
