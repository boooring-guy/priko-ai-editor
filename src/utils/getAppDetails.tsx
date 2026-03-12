import {
  author,
  bugs,
  description,
  homepage,
  license,
  name,
  repository,
  version,
} from "@/../package.json";

export type AppAuthor =
  | string
  | {
      name: string;
      email?: string;
      url?: string;
    };

export interface AppDetails {
  /** Static application metadata from package.json */
  metadata: {
    name: string;
    version: string;
    description: string;
    license: string;
    author: AppAuthor;
    links: {
      homepage: string;
      repository: string;
      bugs: string;
    };
  };
  /** Runtime environment information */
  env: {
    nodeEnv: string;
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
  };
  /** Execution context */
  runtime: {
    isServer: boolean;
    isClient: boolean;
    baseUrl: string;
  };
}

/**
 * Retrieves comprehensive application details including package metadata,
 * environment status, and runtime context.
 *
 * @returns {AppDetails} A structured object containing app state and metadata.
 */
export function getAppDetails(): AppDetails {
  const nodeEnv = process.env.NODE_ENV || "development";
  const isServer = typeof window === "undefined";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    metadata: {
      name: name || "priko",
      version: version || "0.0.0",
      description: description || "",
      license: license || "Unlicensed",
      author: author || "Unknown",
      links: {
        homepage: homepage || "",
        repository:
          typeof repository === "string" ? repository : repository?.url || "",
        bugs: typeof bugs === "string" ? bugs : bugs?.url || "",
      },
    },
    env: {
      nodeEnv,
      isDevelopment: nodeEnv === "development",
      isProduction: nodeEnv === "production",
      isTest: nodeEnv === "test",
    },
    runtime: {
      isServer,
      isClient: !isServer,
      baseUrl,
    },
  };
}
