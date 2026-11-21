// main.ts — gta6-clipper-01 entry: "An Alligator Walks Into a Store in GTA 6"
//
// The creative work of this entry is the YouTube Short itself: a 13.9 s
// vertical clip (1080x1920) cut from Rockstar's official GTA VI Trailer 1 —
// the moment an alligator strolls into a Leonida convenience store, seen on
// the store's own CCTV (trailer time 47.53s-48.60s). The clip plays that one
// moment three ways — full frame, slow-motion close crop, full-speed replay —
// then carries the make.fun pitch inside the picture and in a spoken
// voiceover, as the bounty requires.
//
// This program's only job is the delivery contract: hand the video's public
// URL to the grader by copying VIDEO.json into the output directory.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? ".";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const srcPath = join(botDir, "VIDEO.json");
if (!existsSync(srcPath)) {
  throw new Error(`VIDEO.json not found in bot dir (${srcPath})`);
}

// Parse and sanity-check before copying, so a malformed file fails here at
// run time instead of surfacing later at grading time.
const video = JSON.parse(readFileSync(srcPath, "utf8")) as { url?: unknown };
if (typeof video.url !== "string") {
  throw new Error(`VIDEO.json carries no url string: ${JSON.stringify(video)}`);
}
const parsed = new URL(video.url);
const youTubeHost = ["www.youtube.com", "youtube.com", "youtu.be"].includes(parsed.hostname);
if (!youTubeHost || parsed.pathname.length < 2) {
  throw new Error(`VIDEO.json url is not a YouTube video URL: ${video.url}`);
}

mkdirSync(outDir, { recursive: true });
const dstPath = join(outDir, "VIDEO.json");
copyFileSync(srcPath, dstPath);

// Read the copy back and prove it is byte-identical to the source: the
// grader reads exactly this file, so a silent short write must fail loudly.
const srcBytes = readFileSync(srcPath);
const dstBytes = readFileSync(dstPath);
if (!srcBytes.equals(dstBytes)) {
  throw new Error(`copy verification failed: ${dstPath} differs from ${srcPath}`);
}
console.log(`delivered ${dstPath} (${dstBytes.length} bytes, verified identical) -> ${video.url}`);
