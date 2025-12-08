import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  target: "node18",
  external: ["@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner"],
});
