import assert from "node:assert/strict";
import test from "node:test";

import { aiPlatforms } from "../data/platforms.ts";
import { getAiPlatformPresentation } from "../lib/ai-platform-presentation.ts";

const chatgpt = aiPlatforms.find(({ id }) => id === "chatgpt");
const gemini = aiPlatforms.find(({ id }) => id === "gemini");

if (!chatgpt || !gemini) throw new Error("Expected platform fixtures");

test("maintenance platform is non-interactive and presents localized status", () => {
  assert.deepEqual(getAiPlatformPresentation(chatgpt, "th"), {
    interactive: false,
    actionLabel: "อยู่ระหว่างการปรับปรุง",
  });
  assert.deepEqual(getAiPlatformPresentation(chatgpt, "en"), {
    interactive: false,
    actionLabel: "Under maintenance",
  });
});

test("available platform keeps its external destination and localized action", () => {
  assert.deepEqual(getAiPlatformPresentation(gemini, "en"), {
    interactive: true,
    href: "https://gemini.google.com",
    actionLabel: "Open platform",
  });
});
