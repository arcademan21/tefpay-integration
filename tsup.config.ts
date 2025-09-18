import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  format: ["esm", "cjs"],
  outDir: "dist",
  sourcemap: true,
  external: ["browser-image-compression"],
});
