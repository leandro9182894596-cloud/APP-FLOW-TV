import { fork, execSync } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, statSync, createReadStream } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "3000", 10);
const API_PORT = 3001;
const SSR_PORT = PORT + 2;
const CLIENT_DIR = path.join(__dirname, "dist", "client");

// Run Prisma migrations
try {
  execSync("npx prisma migrate deploy", {
    cwd: path.join(__dirname, "backend"),
    stdio: "inherit",
    env: process.env,
  });
  console.log("[DB] Migrations applied");
} catch (e) {
  console.error("[DB] Migration failed:", e.message);
}

// Fork backend API
const backend = fork(path.join(__dirname, "backend/src/server.js"), [], {
  env: { ...process.env, PORT: String(API_PORT) },
  stdio: "pipe",
});
backend.stdout?.on("data", (d) => process.stdout.write(`[API] ${d}`));
backend.stderr?.on("data", (d) => process.stderr.write(`[API] ${d}`));

// Fork frontend SSR (Nitro)
const frontend = fork(path.join(__dirname, "dist/server/server.js"), [], {
  env: { ...process.env, PORT: String(SSR_PORT) },
  stdio: "pipe",
});
frontend.stdout?.on("data", (d) => process.stdout.write(`[SSR] ${d}`));
frontend.stderr?.on("data", (d) => process.stderr.write(`[SSR] ${d}`));

// Wait for both
await Promise.all([
  waitForServer(API_PORT, "/health"),
  waitForServer(SSR_PORT, "/"),
]);

console.log("[Proxy] Both servers ready, starting proxy on port", PORT);

function waitForServer(port, path) {
  return new Promise((resolve) => {
    const check = () => {
      http.get(`http://localhost:${port}${path}`, (res) => {
        res.resume();
        resolve();
      }).on("error", () => setTimeout(check, 300));
    };
    check();
  });
}

const MIME_TYPES = {
  ".html": "text/html", ".css": "text/css", ".js": "application/javascript",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".webp": "image/webp",
  ".woff": "font/woff", ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

// Proxy server with direct static file serving
http.createServer((req, res) => {
  const urlPath = req.url || "/";

  // Serve static files directly (bypass Nitro SSR which has path bug)
  const staticPath = path.join(CLIENT_DIR, urlPath);
  if (existsSync(staticPath) && statSync(staticPath).isFile()) {
    const ext = path.extname(staticPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000, immutable" });
    createReadStream(staticPath).pipe(res);
    return;
  }

  // Route API calls to backend or SSR
  const isApi = [
    "/api/auth", "/api/users", "/api/favorites",
    "/api/history", "/api/settings", "/api/ads",
    "/api/admin", "/health",
  ].some((p) => urlPath.startsWith(p));

  const target = `http://localhost:${isApi ? API_PORT : SSR_PORT}`;
  const url = new URL(urlPath, target);

  const proxyReq = http.request(
    { hostname: url.hostname, port: url.port, path: url.pathname + url.search,
      method: req.method, headers: req.headers },
    (proxyRes) => {
      const cleanHeaders = { ...proxyRes.headers };
      delete cleanHeaders["transfer-encoding"];
      res.writeHead(proxyRes.statusCode, cleanHeaders);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on("error", (err) => {
    console.error("[Proxy]", err.message);
    res.writeHead(502);
    res.end("Bad Gateway");
  });

  req.pipe(proxyReq);
}).listen(PORT, () => {
  console.log(`Proxy listening on port ${PORT}`);
});
