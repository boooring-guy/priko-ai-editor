import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.url(),
  DATABASE_URL: z.url(),
  NEXT_PUBLIC_APP_URL: z.url(),
  RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_S3_BUCKET: z.string(),
  FIRECRAWL_API_KEY: z.string(),
  GOOGLE_API_KEY: z.string().optional(),
  OPEN_AI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  ALIYUN_API_KEY: z.string().optional(),
  GOOGLE_VERTEX_PROJECT: z.string().optional(),
  GOOGLE_VERTEX_PROJECT_ID: z.string().optional(),
  GOOGLE_VERTEX_LOCATION: z.string().optional(),
  VERTEX_API_KEY: z.string().optional(),
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
