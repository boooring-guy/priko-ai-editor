import { generateText } from "ai";
import { inngestClient } from "@/inngest/client";
import { INNGEST } from "@/inngest/keys";
import { googleAI } from "@/modules/ai/ai-providers";
import { firecrawl } from "@/utils/firecrawl";

const URL_REGEX =
  /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;

export const demoGenerate = inngestClient.createFunction(
  {
    id: INNGEST.TEST.DEMO_GENERATE.FUNCTION,
  },
  {
    event: INNGEST.TEST.DEMO_GENERATE.EVENT,
  },
  async ({ event, step }) => {
    const { prompt } = event.data as { prompt: string };

    const urls = (await step.run("extract-urls", async () => {
      return prompt.match(URL_REGEX) ?? [];
    })) as string[];

    const scarppedResults = await step.run("scrape-urls", async () => {
      const results = await Promise.all(
        urls.map(async (url) => {
          const result = await firecrawl.scrape(url, {
            formats: ["markdown"],
            maxAge: 360000,
          });
          return result.markdown ?? null;
        }),
      );
      return results.filter(Boolean).join("\n\n");
    });

    const finalPrompt = scarppedResults
      ? `${prompt}\n\n${scarppedResults}`
      : prompt;

    const generatedText = await step.run("generate-text", async () => {
      const response = await generateText({
        model: googleAI("gemini-3-flash-preview"),
        prompt: finalPrompt,
      });
      return response;
    });

    return generatedText;
  },
);
