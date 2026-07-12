import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const swPath = join(process.cwd(), "dist", "public-sw.js");
const buildId =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.CF_PAGES_COMMIT_SHA ||
  process.env.SOURCE_VERSION ||
  new Date().toISOString();

try {
  const source = await readFile(swPath, "utf8");
  await writeFile(swPath, source.replaceAll("__TICTIDE_BUILD_ID__", buildId), "utf8");
  console.log(`Stamped service worker build id ${buildId.slice(0, 12)}`);
} catch (error) {
  console.warn(`Skipping service worker stamp: ${error.message}`);
}
