import { generateText } from "ai";
import { vertexAi } from "./src/modules/ai/ai-providers";

async function main() {
  try {
    const response = await generateText({
      model: vertexAi("openai/gpt-oss-120b-maas"),
      prompt: "Give me an idea for a new app for students?",
    });
    console.log(response);
  } catch (e) {
    console.error(e);
  }
}

main();
