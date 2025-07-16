import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "rollup-plugin-typescript2";
import minifyPrivatesTransformer from "ts-transformer-minify-privates";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/index.min.js",
      format: "esm",
      sourcemap: true,
      plugins: [
        terser({
          compress: {
            ecma: 2020,
            passes: 5,
            arrows: true,
            arguments: true,
            collapse_vars: true,
            computed_props: true,
            dead_code: true,
            drop_console: true,
            drop_debugger: true,
            hoist_props: true,
            inline: true,
            keep_fargs: false,
            pure_getters: true,
            reduce_funcs: true,
            reduce_vars: true,
            switches: true,
            toplevel: true,
            typeofs: true,
            unsafe: true,
            unsafe_arrows: true,
            unsafe_comps: true,
            unsafe_Function: true,
            unsafe_math: true,
            unsafe_methods: true,
            unsafe_proto: true,
            unsafe_regexp: true,
            unsafe_undefined: true,
          },
          format: {
            ecma: 2020,
            comments: false,
          },
          mangle: {
            toplevel: true,
            properties: {
              regex: /^_/,
            },
          },
        }),
      ],
    },
  ],
  plugins: [
    nodeResolve({ extensions: [".js", ".ts"] }),
    typescript({
      tsconfig: "tsconfig.json",
      useTsconfigDeclarationDir: true,
      transformers: [
        (service) => ({
          before: [minifyPrivatesTransformer.default(service.getProgram())],
          after: [],
        }),
      ],
    }),
  ],
  external: ["three"],
};
