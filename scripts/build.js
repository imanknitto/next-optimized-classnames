const esbuild = require("esbuild");
const { nodeExternalsPlugin } = require("esbuild-node-externals");

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    platform: "node",
    format: "cjs",
    outdir: "dist",
    sourcemap: true,
    minify: true,
    plugins: [nodeExternalsPlugin()],
  })
  .then(({ errors, warnings }) => {
    console.log("start Building");
    console.warn("warnings : ", warnings);
    console.error("errors : ", errors);
  })
  .catch(console.error);
