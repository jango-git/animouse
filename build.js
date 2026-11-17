import { copyFileSync, mkdirSync } from "node:fs";

import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: {
    three: "three",
    GLTFLoader: "three/addons/loaders/GLTFLoader.js",
    meshopt_decoder: "three/addons/libs/meshopt_decoder.module.js",
    laymur: "laymur",
    animouse: "animouse",
  },
  outdir: "vendor",
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2022",
  external: ["three"],
  legalComments: "eof",
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  logLevel: "info",
});

const FONTS = {
  "space-grotesk/files/space-grotesk-latin-400-normal.woff2": "space-grotesk-400.woff2",
  "space-grotesk/LICENSE": "LICENSE-space-grotesk.txt",
  "ubuntu-sans-mono/files/ubuntu-sans-mono-latin-500-normal.woff2": "ubuntu-sans-mono-500.woff2",
  "ubuntu-sans-mono/LICENSE": "LICENSE-ubuntu-sans-mono.txt",
};
mkdirSync("fonts", { recursive: true });
for (const [from, to] of Object.entries(FONTS)) {
  copyFileSync(`node_modules/@fontsource/${from}`, `fonts/${to}`);
}
