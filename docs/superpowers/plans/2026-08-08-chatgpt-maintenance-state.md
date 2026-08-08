# ChatGPT Maintenance State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep ChatGPT visible but non-interactive and label it as under maintenance in the selected language, without logging a platform selection.

**Architecture:** Store temporary availability on `AiPlatform` and convert each platform into a small, pure card-presentation model. `AiWorkspace` uses that model to render maintenance cards as non-interactive containers and available cards as the existing external links.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Node test runner

## Global Constraints

- ChatGPT remains visible in search results and category filters.
- ChatGPT cannot open an external destination or send a request to `/api/log`.
- Show `อยู่ระหว่างการปรับปรุง` in Thai and `Under maintenance` in English.
- Available platforms retain their current links, hover behavior, and usage logging.
- Do not add dependencies or change APIs, authentication, admin reporting, or stored log schemas.

## File Map

- `data/platforms.ts`: owns the optional platform maintenance flag and marks ChatGPT as unavailable.
- `lib/ai-platform-presentation.ts`: pure mapping from platform and language to interactive/card action state.
- `tests/ai-platform-presentation.test.ts`: protects maintenance and available platform behavior.
- `components/AiWorkspace.tsx`: renders semantic interactive or non-interactive cards from the presentation model.

---

### Task 1: Model Platform Maintenance Presentation

**Files:**
- Create: `lib/ai-platform-presentation.ts`
- Create: `tests/ai-platform-presentation.test.ts`
- Modify: `data/platforms.ts`

**Interfaces:**
- Consumes: `AiPlatform` and `Language`.
- Produces: `getAiPlatformPresentation(platform, language): AiPlatformPresentation`, where available cards have `{ interactive: true, href, actionLabel }` and maintenance cards have `{ interactive: false, actionLabel }`.

- [ ] **Step 1: Write the failing presentation tests**

```ts
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
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/ai-platform-presentation.test.ts`

Expected: FAIL because `lib/ai-platform-presentation.ts` does not exist.

- [ ] **Step 3: Add the maintenance field and pure presentation model**

Add `maintenance?: boolean` to `AiPlatform` and `maintenance: true` to the ChatGPT entry. Create:

```ts
import type { Language } from "@/components/LanguageProvider";
import type { AiPlatform } from "@/data/platforms";

export type AiPlatformPresentation =
  | { interactive: false; actionLabel: string }
  | { interactive: true; href: string; actionLabel: string };

const ACTION_COPY = {
  th: { open: "เปิดใช้งาน", maintenance: "อยู่ระหว่างการปรับปรุง" },
  en: { open: "Open platform", maintenance: "Under maintenance" },
} as const;

export function getAiPlatformPresentation(
  platform: AiPlatform,
  language: Language,
): AiPlatformPresentation {
  if (platform.maintenance) {
    return { interactive: false, actionLabel: ACTION_COPY[language].maintenance };
  }
  return {
    interactive: true,
    href: platform.url,
    actionLabel: ACTION_COPY[language].open,
  };
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/ai-platform-presentation.test.ts`

Expected: 2 tests PASS and 0 fail.

- [ ] **Step 5: Commit the tested model**

```bash
git add data/platforms.ts lib/ai-platform-presentation.ts tests/ai-platform-presentation.test.ts
git commit -m "feat: model AI platform maintenance state"
```

---

### Task 2: Render ChatGPT as a Disabled Card

**Files:**
- Modify: `components/AiWorkspace.tsx`

**Interfaces:**
- Consumes: `getAiPlatformPresentation(platform, language)` from Task 1.
- Produces: a non-anchor maintenance card with no click handler, and unchanged anchor behavior for available platforms.

- [ ] **Step 1: Extract the shared card body**

Inside `AiWorkspace`, map each platform to `presentation`, construct the shared card body once, and keep the existing logo fallback, badges, description, and accent. Use `presentation.actionLabel` in the footer. For maintenance state, render a `CircleOff` icon and omit `ExternalLink` and `ChevronRight`.

```tsx
const presentation = getAiPlatformPresentation(platform, language);
const footer = (
  <div className={`flex items-center justify-between pt-4 border-t border-slate-100 text-sm font-medium transition-all duration-200 ${
    presentation.interactive
      ? "text-slate-400 group-hover:text-slate-700"
      : "text-amber-700"
  }`}>
    <span>{presentation.actionLabel}</span>
    {presentation.interactive ? (
      <div className="flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-1">
        <ExternalLink size={14} />
        <ChevronRight size={14} />
      </div>
    ) : (
      <CircleOff size={15} aria-hidden="true" />
    )}
  </div>
);
```

Move the current JSX from the top accent through the card body into
`cardContent`, replacing only its current footer with `{footer}`. This keeps
the existing content and image fallback byte-for-byte while allowing both
semantic wrappers to share it.

- [ ] **Step 2: Branch on card semantics and behavior**

Available cards retain the anchor, destination, new-tab attributes, and logging handler. Maintenance cards use a `div`, subdued opacity/background, `cursor-not-allowed`, and no hover translation or click handler:

```tsx
return presentation.interactive ? (
  <a
    key={platform.id}
    href={presentation.href}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    onClick={() => handleCardClick(platform.name)}
  >
    {cardContent}
  </a>
) : (
  <div
    key={platform.id}
    className="flex flex-col bg-slate-50/80 rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden opacity-75 cursor-not-allowed"
    aria-disabled="true"
  >
    {cardContent}
  </div>
);
```

- [ ] **Step 3: Run static and production verification**

Run: `npm test && npm run typecheck && npm run build`

Expected: all tests PASS; TypeScript and the production build exit 0.

- [ ] **Step 4: Inspect the final diff for scope and semantics**

Run: `git diff --check && git diff -- data/platforms.ts lib/ai-platform-presentation.ts tests/ai-platform-presentation.test.ts components/AiWorkspace.tsx`

Expected: no whitespace errors; ChatGPT alone has `maintenance: true`; the maintenance branch has no `href` or `onClick`; available platforms keep both.

- [ ] **Step 5: Commit the UI change**

```bash
git add components/AiWorkspace.tsx
git commit -m "feat: disable ChatGPT during maintenance"
```
