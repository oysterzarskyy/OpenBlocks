import { mkdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import CleanCSS from "clean-css";
import { minify as minifyHtml } from "html-minifier-terser";
import JavaScriptObfuscator from "javascript-obfuscator";

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, "dist");
const htmlPath = path.join(root, "index.html");
const cssPath = path.join(root, "styles.css");
const jsPath = path.join(root, "script.js");
const jqueryPath = path.join(root, "node_modules", "jquery", "dist", "jquery.min.js");

await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, "vendor"), { recursive: true });

const css = await readFile(cssPath, "utf8");
const minifiedCss = new CleanCSS({ level: 2 }).minify(css);
if (minifiedCss.errors.length) throw new Error(minifiedCss.errors.join("\n"));
await writeFile(path.join(output, "styles.min.css"), minifiedCss.styles);

const js = await readFile(jsPath, "utf8");
const obfuscatedJs = JavaScriptObfuscator.obfuscate(js, {
  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  identifierNamesGenerator: "hexadecimal",
  renameGlobals: false,
  selfDefending: false,
  stringArray: true,
  stringArrayEncoding: ["base64"],
  stringArrayThreshold: 0.65,
  target: "browser-no-eval",
}).getObfuscatedCode();
await writeFile(path.join(output, "app.min.js"), obfuscatedJs);
await copyFile(jqueryPath, path.join(output, "vendor", "jquery.min.js"));

let html = await readFile(htmlPath, "utf8");
html = html
  .replace('<link rel="stylesheet" href="styles.css" />', '<link rel="stylesheet" href="styles.min.css" />')
  .replace(/<script src="https:\/\/code\.jquery\.com\/jquery-3\.7\.1\.min\.js"[^>]*><\/script>/, '<script src="vendor/jquery.min.js"><\/script>')
  .replace('<script src="script.js" defer></script>', '<script src="app.min.js" defer></script>');
html = await minifyHtml(html, {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
});
await writeFile(path.join(output, "index.html"), html);
console.log(`Built guest playground to ${output}`);
