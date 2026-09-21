// Generates the mock character portraits used by the seed data.
// Run: bun scripts/gen-portraits.mjs        (idempotent, skips existing files)
//      bun scripts/gen-portraits.mjs --force
import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { promisify } from "node:util";

const run = promisify(execFile);
const OUT = new URL("../public/characters/", import.meta.url);
const FORCE = process.argv.includes("--force");
const API = process.env.INFERAFT_API_URL ?? "https://inferaft.com/v1";
const KEY = process.env.INFERAFT_API_KEY;
const MODEL = process.env.INFERAFT_IMAGE_MODEL ?? "z-image-turbo";

// One art direction for the whole cast, so the grid reads as a single product.
const STYLE =
  "semi-realistic Korean webnovel cover illustration, cinematic rim lighting, dark muted background, half-body centered portrait, sharp facial features, no text, no watermark";

const cast = [
  ["seo-yuna", "a late-20s female late-night radio DJ, loose dark hair, headphones around her neck, dim studio booths and VU meters behind her"],
  ["aria-vale", "an elegant female archivist with silver hair and dark glasses, long coat, holding a lantern in a vast old archive of glowing memory jars"],
  ["rowan-park", "an early-30s male graduate student, black hair, thin glasses, grey hoodie, rain streaking a dark apartment window behind him"],
  ["han-seojun", "a sharp-featured young male chaebol heir in a black tailored suit, arms crossed, cold smirk, marble hotel lobby at night"],
  ["yoo-jia", "a female high school student with long black hair and a red ribbon, school uniform, unsettling soft smile, empty classroom"],
  ["kang-taeyang", "a male high school delinquent, bleached hair, school jacket slung over one shoulder, concrete alley at dusk"],
  ["mira-vesper", "a female starship navigator in a fitted flight suit, short violet hair, holographic nav displays glowing across a dark bridge"],
  ["jeong-haeun", "a female prosecutor in a beige trench coat, bobbed hair, unreadable expression, night courthouse corridor"],
  ["baek-muho", "a male swordsman in black and white hanbok, long hair tied back, hand resting on a sword hilt, moonlit bamboo forest"],
  ["seol-yerim", "a female apothecary witch with copper hair tied up, apron over a dark dress, green potion bottles, cluttered cottage shelves"],
  ["no-ah-in", "an androgynous android with pale silver hair and blue circuit lines glowing under translucent skin, minimalist white room"],
  ["cha-dohyeon", "a male intelligence agent in a dark coat, earpiece, scar above one eyebrow, neon-lit rainy alley behind him"],
  ["im-somi", "a cheerful young woman in an oversized knit sweater, short hair, convenience store at night, warm vending machine glow"],
  ["han-yul", "a male concert pianist in a black shirt, white grand piano, single stage spotlight in a dark concert hall"],
  ["seo-ryeon", "a female reaper with long black hair and black feathers drifting around her, dark robes, moonlit shrine gate"],
];

if (!KEY) {
  console.error("INFERAFT_API_KEY missing (expected from .env.local)");
  process.exit(1);
}
await mkdir(OUT, { recursive: true });

async function attempt(prompt, size) {
  const res = await fetch(`${API}/images/generations`, {
    method: "POST",
    headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt, n: 1, size }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 160)}`);
  const json = await res.json();
  const item = json.data?.[0];
  if (item?.b64_json) return Buffer.from(item.b64_json, "base64");
  // The asset URL is auth-gated, so it needs the same bearer token.
  const img = await fetch(item.url, { headers: { authorization: `Bearer ${KEY}` } });
  if (!img.ok) throw new Error(`asset fetch ${img.status}`);
  return Buffer.from(await img.arrayBuffer());
}

let made = 0;
for (const [slug, subject] of cast) {
  const jpg = new URL(`${slug}.jpg`, OUT);
  if (!FORCE && existsSync(jpg)) {
    console.log(`skip  ${slug}.jpg`);
    continue;
  }
  const prompt = `${subject}. ${STYLE}`;
  const png = new URL(`${slug}.png`, OUT);
  try {
    let bytes;
    try {
      bytes = await attempt(prompt, "768x1152");
    } catch (err) {
      console.warn(`retry ${slug} at 1024x1024 (${err.message})`);
      bytes = await attempt(prompt, "1024x1024");
    }
    await writeFile(png, bytes);
    // sips is on every macOS box — no image lib needed for the png→jpg step.
    await run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "82", png.pathname, "--out", jpg.pathname]);
    await rm(png);
    made += 1;
    console.log(`ok    ${slug}.jpg (${(bytes.length / 1024).toFixed(0)}kb png)`);
  } catch (err) {
    console.error(`FAIL  ${slug}: ${err.message}`);
  }
}
console.log(`\n${made} generated, ${cast.length - made} skipped`);
