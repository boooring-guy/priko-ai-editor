import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { envs } from "../../envs";

export const googleAI = createGoogleGenerativeAI({
  apiKey: envs.GOOGLE_API_KEY,
});

export const openAI = createOpenAI({
  apiKey: envs.OPEN_AI_API_KEY,
});

export const aliyunAI = createOpenAICompatible({
  name: "aliyun",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: envs.ALIYUN_API_KEY,
});
