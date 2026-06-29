import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

const server = {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

export default server;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
let baseDir = join(__filename, "..", "..");
// If running from dist/server/, adjust path to project root
if (baseDir.includes(join("dist", "server"))) {
  baseDir = join(baseDir, "..", "..");
}
const __dirname = baseDir;

// MIME types mapping
const mimeTypes: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "font/otf",
};

// Node.js server startup
if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  
  const httpServer = createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      
      // Try to serve static file first
      const staticFilePath = join(__dirname, "dist", "client", url.pathname);
      if (existsSync(staticFilePath) && statSync(staticFilePath).isFile()) {
        const ext = join(staticFilePath).slice(join(staticFilePath).lastIndexOf(".")).toLowerCase();
        const contentType = mimeTypes[ext] || "application/octet-stream";
        
        res.writeHead(200, { "Content-Type": contentType });
        const readStream = createReadStream(staticFilePath);
        readStream.pipe(res);
        return;
      }

      // If not static, pass to TanStack Start
      const request = new Request(url, {
        method: req.method,
        headers: new Headers(req.headers as any),
        body:
          req.method !== "GET" && req.method !== "HEAD"
            ? req
            : undefined,
        // @ts-ignore
        duplex: "half",
      });

      const response = await server.fetch(request, {}, {});

      res.statusCode = response.status;
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      if (response.body) {
        const reader = response.body.getReader();
        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            return;
          }
          res.write(value);
          return pump();
        };
        pump();
      } else {
        res.end();
      }
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.end(renderErrorPage());
    }
  });

  httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
