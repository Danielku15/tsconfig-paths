import { loadConfig } from "./config-loader";
import { createMatchPath, MatchPath } from "./match-path-sync";
import { join } from "path";
import { existsSync } from "fs";

/**
 * Creates a function that can resolve paths according to tsconfig paths property
 * taking configurations from the current ts-node environment.
 */
export function createMatchPathForTsNode(): MatchPath {
  const configLoaderResult = loadConfig();
  if (configLoaderResult.resultType === "failed") {
    throw new Error(
      `Could not load configuration from ts-node environment: ${configLoaderResult.message}`
    );
  }

  return createMatchPath(
    configLoaderResult.absoluteBaseUrl,
    configLoaderResult.paths,
    configLoaderResult.mainFields,
    true,
    true
  );
}

/**
 * Resolves the path to the installed ts-node.
 *
 * @param cwd The current working directory from which to start searching.
 */
export function resolveTsNode(cwd: string): string | undefined {
  const candidates = [
    (join(cwd, "..", "ts-node"), join(cwd, "node_modules", "ts-node")),
  ];

  return candidates.find(existsSync);
}
