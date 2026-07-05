export default defineNitroConfig({
  preset: "node-server",
  output: {
    serverDir: "dist/server",
    publicDir: "dist/client",
  },
  requestBody: {
    maxSize: "50mb",
  },
});
