import { auth } from "@/lib/auth";
import { streamText } from "ai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { googleAI } from "@/modules/ai/ai-providers";
import { firecrawl } from "@/utils/firecrawl";

const URL_REGEX =
  /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;

// Prompt
const QUICK_EDIT_PROMPT = `
You are an AI code editing engine inside a modern code editor.

Your job is to modify the **selected code snippet** according to the user's instruction.

<context>
file_name: {fileName}

selection_start_line: {selectionStartLine}

selection_end_line: {selectionEndLine}

selected_code:
{selectedCode}

previous_lines:
{previousLines}

next_lines:
{nextLines}

full_code:
{code}
</context>

<user_instruction>
{instruction}
</user_instruction>

<task>
Edit the selected code so it satisfies the user's instruction.
</task>

<rules>
Follow these rules strictly:

1. EDIT ONLY THE SELECTION
   - Modify ONLY the code inside <selected_code>.
   - Do NOT include previous_lines or next_lines in your output.

2. PRESERVE STRUCTURE
   - Keep indentation and formatting consistent with the existing code.
   - Do not change unrelated logic.

3. MINIMAL EDITS
   - Make the smallest possible change needed to satisfy the instruction.
   - Avoid rewriting the entire block unless necessary.

4. VALID CODE
   - Ensure the edited code remains syntactically valid.
   - Maintain correct brackets, quotes, and formatting.

5. NO EXTRA TEXT
   - Do NOT include explanations.
   - Do NOT include markdown blocks (\`\`\`).
   - Return ONLY the edited code.

6. IF NO CHANGE NEEDED
   - Return the original selected_code exactly as provided.
</rules>

<output_format>
Return ONLY the edited code snippet. No markdown formatting.
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
      selectionStartLine,
      selectionEndLine,
      selectedCode,
      previousLines,
      nextLines,
      code,
      instruction,
    } = await request.json();

    if (
      typeof instruction !== "string" ||
      typeof selectedCode !== "string" ||
      typeof code !== "string"
    ) {
      return NextResponse.json(
        { error: "instruction, selectedCode, and code are required" },
        { status: 400 },
      );
    }

    // Process URLs in the instruction
    const urls = instruction.match(URL_REGEX) ?? [];
    let externalContext = "";

    if (urls.length > 0) {
      const scrapedResults = await Promise.all(
        urls.map(async (url: string) => {
          try {
            const result = await firecrawl.scrape(url, {
              formats: ["markdown"],
              maxAge: 360000,
            });
            return result.markdown
              ? `--- Content from ${url} ---\n${result.markdown}\n`
              : null;
          } catch (err) {
            console.error(`Failed to scrape ${url}:`, err);
            return null;
          }
        }),
      );
      const combinedScraped = scrapedResults.filter(Boolean).join("\n");
      if (combinedScraped) {
        externalContext = `\n<external_references>\nThe user provided the following URLs as context:\n${combinedScraped}\n</external_references>\n`;
      }
    }

    const finalInstruction = externalContext
      ? `${instruction}\n${externalContext}`
      : instruction;

    const prompt = QUICK_EDIT_PROMPT.replace("{fileName}", fileName)
      .replace("{selectionStartLine}", selectionStartLine.toString())
      .replace("{selectionEndLine}", selectionEndLine.toString())
      .replace("{selectedCode}", selectedCode)
      .replace("{previousLines}", previousLines || "")
      .replace("{nextLines}", nextLines || "")
      .replace("{code}", code)
      .replace("{instruction}", finalInstruction);

    const result = streamText({
      model: googleAI("gemini-2.5-flash"),
      prompt,
      temperature: 0.1,
      maxOutputTokens: 4096,
    });

    return new Response(result.textStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Quick edit error:", error);
    return NextResponse.json(
      { error: "Failed to generate quick edit" },
      { status: 500 },
    );
  }
}
