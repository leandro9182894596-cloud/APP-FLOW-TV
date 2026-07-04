import { fork, execSync } from "node:child_process";
import http from "node:http";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "3000", 10);
const API_PORT = 3001; // Fixed internal port for the Express backend

// Run Prisma migrations at startup
try {
  execSync("npx prisma migrate deploy", {
    cwd: path.join(__dirname, "backend"),
    stdio: "inherit",
    env: process.env,
  });
  console.log("[DB] Migrations applied");
} catch (e) {
  console.error("[DB] Migration failed, continuing anyway:", e.message);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Start backend API in a child process
const backend = fork(path.join(__dirname, "backend/src/server.js"), [], {
  env: { ...process.env, PORT: String(API_PORT) },
  stdio: "pipe",
});

backend.stdout?.on("data", (d) => process.stdout.write(`[API] ${d}`));
backend.stderr?.on("data", (d) => process.stderr.write(`[API] ${d}`));

// Wait for backend to be ready
await new Promise((resolve) => {
  const check = () => {
    const req = http.get(`http://localhost:${API_PORT}/health`, (res) => {
      console.log(`[API] Backend ready (status ${res.statusCode})`);
      res.resume();
      resolve();
    });
    req.on("error", () => setTimeout(check, 300));
    req.end();
  };
  check();
});

// Proxy backend API routes to the child process
const BACKEND_PREFIXES = [
  "/api/auth", "/api/users", "/api/favorites",
  "/api/history", "/api/settings", "/api/ads", "/api/admin",
];

app.use(async (req, res, next) => {
  const matches = BACKEND_PREFIXES.some((p) => req.path.startsWith(p));
  if (!matches) return next();

  const targetUrl = `http://localhost:${API_PORT}${req.originalUrl}`;

  try {
    const headers = {
      "content-type": req.headers["content-type"] || "application/json",
      accept: req.headers["accept"] || "application/json",
      host: `localhost:${API_PORT}`,
    };

    const body = req.method !== "GET" && req.method !== "HEAD"
      ? JSON.stringify(req.body)
      : undefined;

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    res.status(upstream.status);
    upstream.headers.forEach((v, k) => {
      if (!["transfer-encoding", "connection"].includes(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    });
    res.end(await upstream.text());
  } catch {
    res.status(502).json({ error: "Backend unavailable" });
  }
});

// Serve static assets directly
const clientDir = path.join(__dirname, "dist/client");
if (existsSync(clientDir)) {
  app.use("/assets", express.static(path.join(clientDir, "assets"), { maxAge: "7d" }));
  app.use("/favicon.ico", express.static(path.join(clientDir, "favicon.ico")));
  app.use("/favicon.png", express.static(path.join(clientDir, "favicon.png")));
  app.use(express.static(clientDir));
}

// Mount the Nitro SSR handler (frontend + /api/public/*)
const { handler } = await import("./dist/server/server.js");
app.use(handler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Backend API on port ${API_PORT}`);
});
