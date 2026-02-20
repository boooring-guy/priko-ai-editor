import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.url(),
  DATABASE_URL: z.url(),
  NEXT_PUBLIC_APP_URL: z.url(),
  RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.string(),
});

// parse check
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");
  for (const [key, value] of Object.entries(
    parsedEnv.error.flatten().fieldErrors,
  )) {
    console.error(`  - ${key}: ${value?.join(", ")}`);
  }
  process.exit(1);
}

export const envs = parsedEnv.data;
