//
// Override default ESM resolver to map paths before actual resolve
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { join } from "path";

const esmRequire = createRequire(fileURLToPath(import.meta.url));
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const tsConfigPaths = esmRequire("./");

const tsNodePath = tsConfigPaths.resolveTsNode(__dirname);
const matchPath = tsConfigPaths.createMatchPathForTsNode();

/** @type {import('ts-node/dist-raw/node-internal-modules-esm-resolve')} */
const esmResolver = esmRequire(join(
  tsNodePath,
  "dist-raw",
  "node-internal-modules-esm-resolve.js"
));
const originalCreateResolve = esmResolver.createResolve;
esmResolver.createResolve = (opts) => {
  const resolve = originalCreateResolve(opts);
  const originalDefaultResolve = resolve.defaultResolve;
  resolve.defaultResolve = (specifier, context, defaultResolve) => {
    const found = matchPath(specifier);
    if (found) {
      specifier = new URL(`file:///${found}`).href;
    }

    const result = originalDefaultResolve(
      specifier,
      context,
      defaultResolve
    );
    return result;
  };

  return resolve;
};

//
// Adopted from ts-node/esm
/** @type {import('ts-node/dist/esm')} */
const esm = esmRequire(join(tsNodePath, "dist", "esm.js"));
export const {
  resolve,
  load,
  getFormat,
  transformSource,
} = esm.registerAndCreateEsmHooks();
