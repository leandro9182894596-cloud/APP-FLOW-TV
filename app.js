import { fork, execSync } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "3000", 10);
const API_PORT = 3001;
const SSR_PORT = PORT + 2;

// Run Prisma migrations at startup
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

// Helper: proxy request to target
function proxyRequest(req, res, target) {
  const url = new URL(req.url || "/", target);
  const opts = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method: req.method,
    headers: { ...req.headers, host: url.host },
  };

  const proxy = http.request(opts, (upstream) => {
    res.writeHead(upstream.statusCode, upstream.headers);
    upstream.pipe(res);
  });

  proxy.on("error", () => {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Bad Gateway" }));
  });

  req.pipe(proxy);
}

// Start backend API (Express)
const backend = fork(path.join(__dirname, "backend/src/server.js"), [], {
  env: { ...process.env, PORT: String(API_PORT) },
  stdio: "pipe",
});
backend.stdout?.on("data", (d) => process.stdout.write(`[API] ${d}`));
backend.stderr?.on("data", (d) => process.stderr.write(`[API] ${d}`));

// Start frontend SSR (Nitro)
const frontend = fork(path.join(__dirname, "dist/server/server.js"), [], {
  env: { ...process.env, PORT: String(SSR_PORT) },
  stdio: "pipe",
});
frontend.stdout?.on("data", (d) => process.stdout.write(`[SSR] ${d}`));
frontend.stderr?.on("data", (d) => process.stderr.write(`[SSR] ${d}`));

// Wait for both to be ready
await Promise.all([
  new Promise((resolve) => {
    const check = () => {
      const req = http.get(`http://localhost:${API_PORT}/health`, (res) => {
        console.log(`[API] Ready (port ${API_PORT})`);
        res.resume();
        resolve();
      });
      req.on("error", () => setTimeout(check, 300));
      req.end();
    };
    check();
  }),
  new Promise((resolve) => {
    const check = () => {
      const req = http.get(`http://localhost:${SSR_PORT}/`, (res) => {
        console.log(`[SSR] Ready (port ${SSR_PORT})`);
        res.resume();
        resolve();
      });
      req.on("error", () => setTimeout(check, 300));
      req.end();
    };
    check();
  }),
]);

// Reverse proxy server
const server = http.createServer((req, res) => {
  const pathname = req.url || "/";
  const isApi =
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/users") ||
    pathname.startsWith("/api/favorites") ||
    pathname.startsWith("/api/history") ||
    pathname.startsWith("/api/settings") ||
    pathname.startsWith("/api/ads") ||
    pathname.startsWith("/api/admin") ||
    pathname === "/health";

  const target = `http://localhost:${isApi ? API_PORT : SSR_PORT}`;
  proxyRequest(req, res, target);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`  API Backend → http://localhost:${API_PORT}`);
  console.log(`  Frontend SSR → http://localhost:${SSR_PORT}`);
});
