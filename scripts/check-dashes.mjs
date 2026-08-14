// Fails if an em dash or en dash has crept into the app or the docs.
// House style: neither character is used in this project. Use a colon,
// a comma, parentheses, or two sentences instead.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const roots = ["src", "docs"];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".md", ".json"]);
const banned = [
  { char: "—", name: "em dash" },
  { char: "–", name: "en dash" },
];

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return extensions.has(extname(full)) ? [full] : [];
  });
}

const hits = [];
for (const root of roots) {
  for (const file of walk(root)) {
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      for (const { char, name } of banned) {
        if (line.includes(char)) hits.push(`${file}:${i + 1}  ${name}  ${line.trim()}`);
      }
    });
  }
}

if (hits.length > 0) {
  console.error(`Found ${hits.length} banned dash character(s):\n`);
  console.error(hits.join("\n"));
  console.error("\nUse a colon, a comma, parentheses, or split the sentence.");
  process.exit(1);
}

console.log("No em or en dashes found.");
