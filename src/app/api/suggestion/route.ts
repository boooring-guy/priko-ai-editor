import { envs } from "@/envs";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { auth } from "@/lib/auth";
import { generateText, Output } from "ai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { vertexAi } from "../../../modules/ai/ai-providers";

const google = createGoogleGenerativeAI({
  apiKey: envs.GOOGLE_API_KEY,
});

const suggestionSchema = z.object({
  suggestion: z
    .string()
    .describe(
      "The code to insert at cursor, or empty string if no completion needed",
    ),
});

const SUGGESTION_PROMPT = `
You are an AI code completion engine inside a modern code editor.

Your job is to generate the **smallest possible continuation** of code at the cursor position.

<context>
file_name: {fileName}

line_number: {lineNumber}

before_cursor:
{textBeforeCursor}

after_cursor:
{textAfterCursor}

previous_lines:
{previousLines}

current_line:
{currentLine}

next_lines:
{nextLines}

full_code:
{code}
</context>

<additional_context_files>
{additionalContextFiles}
</additional_context_files>

<task>
Produce the minimal code that should appear immediately after the cursor.
</task>

<rules>
Follow these rules strictly:

1. EXACT CONTINUATION
   Your output is inserted IMMEDIATELY at the cursor. Do not repeat any characters that are already in \`before_cursor\` or \`after_cursor\`.

2. INDENTATION HANDLING
   - If you are continuing the current line, DO NOT start with spaces unless a space is logically needed after the last character of \`before_cursor\`.
   - If suggesting a new line (using \\n), provide the correct indentation for that new line based on the project style (usually 2 spaces).
   - If the cursor is already at the correct indentation for a new block, start your suggestion with the actual code, not more spaces.

3. DUPLICATION CHECK
   - If \`after_cursor\` or \`next_lines\` already contains the code you were going to suggest, return an empty <string className=""></string>
   - Example: if \`before_cursor\` is "cons" and \`after_cursor\` is "t", only suggest "t" if you want to complete "const", but wait—if "t" is already after cursor, you should suggest "t" only if you mean to type something *after* that "t". Actually, better: if your completion is "t" and "t" is already there, return nothing.

4. COMPLETION STRATEGY
   - Complete the current word/expression.
   - Complete the current statement.
   - Close open brackets/quotes only if they are not already closed in \`after_cursor\`.

5. MINIMALISM
   - Suggest only what is obviously next.
   - No comments, no explanations.
   - Return an empty string if unsure or if the context is already complete.
</rules>

<output_format>
Return ONLY the text to be inserted.
</output_format>
`;

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      fileName,
      code,
      currentLine,
      previousLines,
      textBeforeCursor,
      textAfterCursor,
      nextLines,
      lineNumber,
      contextFiles = [],
    } = await request.json();

    if (typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // Format additional context files
    const additionalContextStr = (
      contextFiles as { fileName: string; content: string }[]
    )
      .map((file) => `--- ${file.fileName} ---\n${file.content}\n`)
      .join("\n");

    const prompt = SUGGESTION_PROMPT.replace("{fileName}", fileName)
      .replace("{code}", code)
      .replace("{currentLine}", currentLine)
      .replace("{previousLines}", previousLines || "")
      .replace("{textBeforeCursor}", textBeforeCursor)
      .replace("{textAfterCursor}", textAfterCursor)
      .replace("{nextLines}", nextLines || "")
      .replace("{lineNumber}", lineNumber.toString())
      .replace(
        "{additionalContextFiles}",
        additionalContextStr || "No additional open files",
      );

    const { output } = await generateText({
      model: google("gemini-flash-lite-latest"),
      // model: vertexAi("openai/gpt-oss-120b-maas"),
      output: Output.object({ schema: suggestionSchema }),
      prompt,
    });

    return NextResponse.json({ suggestion: output.suggestion });
  } catch (error) {
    console.error("Suggestion error: ", error);
    return NextResponse.json(
      { error: "Failed to generate suggestion" },
      { status: 500 },
    );
  }
}
