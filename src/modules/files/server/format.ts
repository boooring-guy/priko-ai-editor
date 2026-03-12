import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { getConfig } from "@/modules/config/server/get-config";

const SUPPORTED_EXTENSIONS = new Set([
  "js",
  "jsx",
  "mjs",
  "cjs",
  "ts",
  "tsx",
  "mts",
  "cts",
  "json",
  "jsonc",
  "css",
  "scss",
  "sass",
  "html",
  "graphql",
  "gql",
]);

const requireFromCwd = createRequire(`${process.cwd()}/package.json`);

let biomeBinaryPathCache: string | null | undefined;

function getFileExtension(fileName: string): string {
  const ext = fileName.split(".").pop();
  return (ext ?? "").toLowerCase();
}

function supportsBiomeFormatting(fileName: string): boolean {
  return SUPPORTED_EXTENSIONS.has(getFileExtension(fileName));
}

function isMuslRuntime(): boolean {
  if (process.platform !== "linux") return false;
  const report = process.report?.getReport?.() as
    | Record<string, any>
    | undefined;
  return !(report?.header as Record<string, any>)?.glibcVersionRuntime;
}

function resolveBiomeBinaryPath(): string | null {
  if (biomeBinaryPathCache !== undefined) return biomeBinaryPathCache;

  const platformKey =
    process.platform === "linux" && isMuslRuntime()
      ? "linux-musl"
      : process.platform;

  const map: Record<string, Partial<Record<NodeJS.Architecture, string>>> = {
    win32: {
      x64: "@biomejs/cli-win32-x64/biome.exe",
      arm64: "@biomejs/cli-win32-arm64/biome.exe",
    },
    darwin: {
      x64: "@biomejs/cli-darwin-x64/biome",
      arm64: "@biomejs/cli-darwin-arm64/biome",
    },
    linux: {
      x64: "@biomejs/cli-linux-x64/biome",
      arm64: "@biomejs/cli-linux-arm64/biome",
    },
    "linux-musl": {
      x64: "@biomejs/cli-linux-x64-musl/biome",
      arm64: "@biomejs/cli-linux-arm64-musl/biome",
    },
  };

  const packagePath = map[platformKey]?.[process.arch];
  if (!packagePath) {
    biomeBinaryPathCache = null;
    return biomeBinaryPathCache;
  }

  try {
    biomeBinaryPathCache = requireFromCwd.resolve(packagePath);
    return biomeBinaryPathCache;
  } catch {
    biomeBinaryPathCache = null;
    return biomeBinaryPathCache;
  }
}

async function runBiomeFormatter(
  content: string,
  fileName: string,
): Promise<string | null> {
  const binaryPath = resolveBiomeBinaryPath();
  if (!binaryPath) return null;

  return new Promise((resolve) => {
    const child = spawn(
      binaryPath,
      [
        "format",
        "--colors=off",
        "--stdin-file-path",
        fileName,
        "--config-path",
        process.cwd(),
      ],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: "pipe",
      },
    );

    let stdout = "";
    let settled = false;

    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };

    const timer = setTimeout(() => {
      child.kill();
      finish(null);
    }, 5000);

    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", () => {
      // drain stderr to avoid backpressure in long diagnostics
    });

    child.on("error", () => {
      finish(null);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        finish(null);
        return;
      }
      finish(stdout);
    });

    child.stdin.write(content);
    child.stdin.end();
  });
}

export async function formatContentOnSave(
  fileName: string,
  content: string,
): Promise<string> {
  const config = await getConfig();
  if (!config.app.editor.formatOnSave.enabled) return content;
  if (!supportsBiomeFormatting(fileName)) return content;

  const formatted = await runBiomeFormatter(content, fileName);
  if (formatted === null) return content;
  return formatted;
}
