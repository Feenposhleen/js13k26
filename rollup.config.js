// rollup.config.js
const fs = require("fs");
const path = require("path");
const typescript = require("@rollup/plugin-typescript");
const terser = require("@rollup/plugin-terser");
const serve = require("rollup-plugin-serve");
const livereload = require("rollup-plugin-livereload");
const glslify = require("rollup-plugin-glslify");

/** Very small CSS minifier (good enough for jam CSS) */
function minifyCss(css) {
  return String(css || "")
    .replace(/\/\*[\s\S]*?\*\//g, "") // strip comments
    .replace(/\s+/g, " ") // collapse whitespace
    .replace(/\s*([{}:;,>~+])\s*/g, "$1") // trim around symbols
    .replace(/;}/g, "}"); // drop last semicolons
}

function inlineTemplate({
  templatePath = "scaffold.template",
  cssPath = "src/style.css",
  outFile = "index.html",
  jsToken = "__js__",
  cssToken = "__css__",
  isProduction = false,
} = {}) {
  return {
    name: "inline-template",
    buildStart() {
      if (cssPath) this.addWatchFile(cssPath); // watch CSS in dev
      this.addWatchFile(templatePath);
    },
    async generateBundle(_opts, bundle) {
      const entry = Object.values(bundle).find((f) => f.type === "chunk" && f.isEntry);
      let js = entry ? entry.code : "";

      if (isProduction && js) {
        const { Packer } = await import("roadroller");
        const packer = new Packer([{ data: js, type: "js", action: "eval" }], {});
        await packer.optimize(2);
        const { firstLine, secondLine } = packer.makeDecoder();
        js = firstLine + "\n" + secondLine;
      }

      const css = fs.readFileSync(path.resolve(cssPath), "utf8");
      const template = fs.readFileSync(templatePath, "utf8");

      const html = template.replace(jsToken, js).replace(cssToken, minifyCss(css));

      this.emitFile({ type: "asset", fileName: outFile, source: html });
    },
  };
}

function runScript({ script = "editor/server.js" } = {}) {
  let child = null;
  return {
    name: "run-editor-server",
    buildStart() {
      if (child) return; // already started
      try {
        const cp = require("child_process");
        const scriptPath = path.resolve(script);
        child = cp.spawn(process.execPath, [scriptPath], {
          stdio: "inherit",
          windowsHide: true,
        });

        const killChild = (signal) => {
          if (!child) return;
          try {
            child.kill(signal || "SIGTERM");
          } catch (e) {
            try {
              child.kill();
            } catch (_) {}
          }
          child = null;
        };

        process.on("exit", () => killChild());
        process.on("SIGINT", () => {
          killChild();
          process.exit(0);
        });
        process.on("SIGTERM", () => {
          killChild();
          process.exit(0);
        });

        child.on("exit", (code, sig) => {
          child = null;
        });
      } catch (err) {
        this.warn(`run-editor-server: failed to start ${script}: ${err.message}`);
      }
    },
    closeBundle() {
      this.warn(`run-editor-server: watch mode — keeping ${script} running across rebuilds`);
      return;
    },
  };
}

module.exports = (cli) => {
  const dev = !!cli.watch; // true when running `rollup -w`

  return {
    input: "src/game/main.ts",
    output: {
      file: "dist/game.js",
      format: "iife",
      sourcemap: dev,
    },
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
    },
    plugins: [
      typescript({ tsconfig: "./tsconfig.json" }),

      // Support for GLSL shaders
      glslify({
        include: ["**/*.vs", "**/*.fs", "**/*.vert", "**/*.frag", "**/*.glsl"],
        exclude: "node_modules/**",
      }),

      // Start editor/server.js in dev watch mode
      dev && runScript({ script: "editor/server.js" }),

      // Convert const/let to var before Terser
      !dev && {
        name: "const-to-var",
        renderChunk(code) {
          return {
            code: code.replace(/\b(const|let)\b/g, "var").replace("#define GLSLIFY 1", ""),
          };
        },
      },

      // Production-only minification (keep builds fast in dev)
      !dev &&
        terser({
          ecma: 2020,
          toplevel: true,
          compress: {
            passes: 5,
            unsafe: true,
            unsafe_arrows: true,
            unsafe_methods: true,
            unsafe_math: true,
            pure_getters: true,
            drop_console: true,
            module: true,
            hoist_funs: true,
            hoist_vars: true,
            booleans_as_integers: true,
            global_defs: {
              DEBUG: false
            },
          },
          mangle: {
            toplevel: true,
            properties: {
              regex: /^_/,
            },
          },
          format: { comments: false },
        }),

      // Inject into scaffold.template -> dist/index.html (with Roadroller in production)
      inlineTemplate({ isProduction: !dev }),

      // Dev server + live reload only when watching
      dev &&
        serve({
          contentBase: [".", "dist"],
          port: 5173,
          headers: { "Cache-Control": "no-store" },
          open: false,
        }),

      dev && livereload({ watch: "dist", verbose: false }),
    ].filter(Boolean),
    watch: {
      clearScreen: true,
    },
  };
};
