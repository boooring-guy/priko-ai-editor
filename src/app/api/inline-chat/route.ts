import { googleAI } from "@/modules/ai/ai-providers";
import { auth } from "@/lib/auth";
import { streamText } from "ai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// ── System prompt for inline code generation ────────────────────────────
const INLINE_CHAT_SYSTEM_PROMPT = `
You are an expert AI code assistant embedded inside a code editor.
The user will give you a natural-language instruction and the surrounding code context.
Your job is to generate **only the code** that fulfils the instruction.

<rules>
1. OUTPUT ONLY CODE — no markdown fences, no explanations, no commentary.
2. Match the indentation style and conventions of the surrounding code.
3. If the user selected a range of code, your output REPLACES that selection entirely.
   Otherwise your output is INSERTED at the cursor line.
4. Produce minimal, production-quality code. No TODOs or placeholders.
5. Respect the language and framework visible in the context.
</rules>
`;

// ── Build the user prompt from request context ──────────────────────────
function buildUserPrompt({
  prompt,
  fileName,
  code,
  selection,
  cursorLine,
  contextFiles,
}: {
  prompt: string;
  fileName: string;
  code: string;
  selection: string | null;
  cursorLine: number;
  contextFiles?: { fileName: string; content: string }[];
}) {
  let userPrompt = `File: ${fileName}\nCursor line: ${cursorLine}\n\n`;

  if (selection) {
    userPrompt += `<selected_code>\n${selection}\n</selected_code>\n\n`;
    userPrompt += `The user wants you to REPLACE the selected code.\n\n`;
  } else {
    userPrompt += `The user wants you to INSERT code at the cursor line.\n\n`;
  }

  userPrompt += `<full_file>\n${code}\n</full_file>\n\n`;

  if (contextFiles && contextFiles.length > 0) {
    userPrompt += `<additional_context_files>\n`;
    for (const file of contextFiles) {
      userPrompt += `--- ${file.fileName} ---\n${file.content}\n\n`;
    }
    userPrompt += `</additional_context_files>\n\n`;
  }

  userPrompt += `<instruction>\n${prompt}\n</instruction>`;

  return userPrompt;
}

// ── POST handler — generates code and returns as JSON ───────────────────
export async function POST(request: Request) {
  try {
    // 1. Auth check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const { prompt, fileName, code, selection, cursorLine, contextFiles } =
      await request.json();

    if (typeof prompt !== "string" || typeof code !== "string") {
      return NextResponse.json(
        { error: "prompt and code are required" },
        { status: 400 },
      );
    }

    // 3. Generate code using the AI model in streaming mode
    const result = streamText({
      model: googleAI("gemini-2.5-flash"), // using newest flash
      system: INLINE_CHAT_SYSTEM_PROMPT,
      prompt: buildUserPrompt({
        prompt,
        fileName,
        code,
        selection,
        cursorLine,
        contextFiles,
      }),
      temperature: 0.2,
      maxOutputTokens: 4096,
    });

    // 4. Return standard plain text stream response
    return new Response(result.textStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Inline chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate code" },
      { status: 500 },
    );
  }
}
