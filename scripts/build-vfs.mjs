// scripts/build-vfs.mjs
import fs from "fs";
import path from "path";

const inDir = process.argv[2]; // e.g. public/fonts/khmer
const outFile = process.argv[3] || "src/app/pdf/vfs_fonts_khmer.js";

if (!inDir) {
  console.error("Usage: node scripts/build-vfs.mjs <inputDir> <outFile>");
  process.exit(1);
}

const files = fs
  .readdirSync(inDir)
  .filter((f) => f.toLowerCase().endsWith(".ttf"));
if (files.length === 0) {
  console.error("No .ttf files found in", inDir);
  process.exit(1);
}

const vfs = {};
for (const f of files) {
  const b64 = fs.readFileSync(path.join(inDir, f)).toString("base64");
  vfs[f] = b64;
}

const output = `// Auto-generated. Do not edit.
export const vfs = ${JSON.stringify(vfs, null, 2)};`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, output);
console.log(`✅ Wrote ${outFile} with ${files.length} font(s).`);
