import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = join(fileURLToPath(import.meta.url), "..");
const serverPath = join(__dirname, "dist", "server", "server.js");

if (!existsSync(serverPath)) {
  console.log("[postbuild] dist/server/server.js not found, skipping");
  process.exit(0);
}

let content = readFileSync(serverPath, "utf8");

// Fix the baseDir computation: change `join(__filename$1, "..", "..")` to `join(__filename$1, "..", "..", "..")`
// The generated code goes from `/dist/server/server.js` up 2 levels to `/dist/`, but it needs to go to the project root.
const oldBaseDir = `let baseDir = join(__filename$1, "..", "..")`;
const newBaseDir = `let baseDir = join(__filename$1, "..", "..", "..")`;

if (content.includes(oldBaseDir)) {
  content = content.replace(oldBaseDir, newBaseDir);
  writeFileSync(serverPath, content, "utf8");
  console.log("[postbuild] Fixed Nitro SSR baseDir path");
} else {
  console.log("[postbuild] baseDir pattern not found, may already be fixed");
}
