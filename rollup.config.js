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

/** Collect property names that must NOT be mangled (dynamically accessed SFX, song, and font keys) */
function getReservedProperties() {
  const reserved = new Set();
  try {
    const audioContent = fs.readFileSync(path.resolve("src/core/assets/audio.gen.ts"), "utf8");
    const sfxMatch = audioContent.match(/_sfx:\s*\{([^}]+)\}/);
    if (sfxMatch) {
      for (const match of sfxMatch[1].matchAll(/(_\w+)\s*:/g)) {
        reserved.add(match[1]);
      }
    }
    const songsMatch = audioContent.match(/_songs:\s*\{([\s\S]+?)\}\s*\}/);
    if (songsMatch) {
      for (const match of songsMatch[1].matchAll(/(_\w+)\s*:\s*\{/g)) {
        reserved.add(match[1]);
      }
    }
    const drawablesContent = fs.readFileSync(
      path.resolve("src/core/assets/drawables.gen.ts"),
      "utf8",
    );
    for (const match of drawablesContent.matchAll(/(__font_\S+?)\s*:/g)) {
      reserved.add(match[1].replace(/['"]/g, ""));
    }
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.!".split("").forEach((c) => reserved.add(`__font_${c}`));
  } catch (e) {
    console.error("Failed reading reserved properties:", e);
  }
  return Array.from(reserved);
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
          } catch (_e) {
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

      // Convert const/let to var before Terser (AST-aware so GLSL string literals are untouched)
      !dev && {
        name: "const-to-var",
        renderChunk(code) {
          const ast = this.parse(code);
          const replacements = [];
          function walk(node) {
            if (!node || typeof node !== "object") return;
            if (
              node.type === "VariableDeclaration" &&
              (node.kind === "const" || node.kind === "let")
            ) {
              replacements.push({ start: node.start, end: node.start + node.kind.length });
            }
            for (const key of Object.keys(node)) {
              if (key === "comments") continue;
              const val = node[key];
              if (Array.isArray(val)) val.forEach(walk);
              else if (val && typeof val === "object") walk(val);
            }
          }
          walk(ast);
          replacements.sort((a, b) => b.start - a.start);
          for (const r of replacements) {
            code = code.slice(0, r.start) + "var" + code.slice(r.end);
          }
          return {
            code: code.replace(/#define GLSLIFY 1\n?/g, ""),
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
              DEBUG: false,
            },
          },
          mangle: {
            toplevel: true,
            properties: {
              regex: /^_/,
              reserved: getReservedProperties(),
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
