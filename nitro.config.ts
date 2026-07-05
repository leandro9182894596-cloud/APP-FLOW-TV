export default defineNitroConfig({
  preset: "netlify",
  output: {
    serverDir: "dist/server",
    publicDir: "dist/client",
  },
  requestBody: {
    maxSize: "50mb",
  },
});
