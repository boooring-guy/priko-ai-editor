import { generateSlug } from "random-word-slugs";

/**
 * Generates a random project title using 3 words.
 * Example output: "happy-flying-project"
 */
export function generateProjectTitle() {
  return generateSlug(2, { format: "kebab" });
}
