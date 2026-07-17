import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const iconsDir = fileURLToPath(
  new URL("../apps/app/public/icons/", import.meta.url),
);
const sizes = [192, 512];

async function main() {
  const svg = await readFile(path.join(iconsDir, "icon.svg"));

  for (const size of sizes) {
    const outPath = path.join(iconsDir, `icon-${size}.png`);
    await sharp(svg, { density: 384 }).resize(size, size).png().toFile(outPath);
    console.log(`Wrote ${path.relative(process.cwd(), outPath)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
