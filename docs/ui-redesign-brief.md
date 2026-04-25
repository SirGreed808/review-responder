# Review Responder — Visual Redesign Brief

**For:** Kimi K2.6
**Date:** 2026-04-25
**Project:** Review Responder — Google Review Reply Generator
**Live:** https://review-responder-inky.vercel.app

> **Before writing any Next.js code:** Read the relevant guide in `node_modules/next/dist/docs/` — this version may differ from your training data.

---

## About the App

Review Responder is a single-page tool for small business owners. Paste a Google review, pick a tone (Professional / Friendly / Apologetic / Enthusiastic), and Claude generates a draft reply. Uses Anthropic's extended thinking and streams both the reasoning and response over Server-Sent Events. The whole frontend lives in one React component.

**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Anthropic SDK. Deployed on Vercel.

---

## Files to Know

| File | Role |
|---|---|
| `app/page.tsx` | The entire frontend — single client component with all state, SSE handling, and rendering |
| `app/globals.css` | All styling — CSS variables, custom utilities, animations |
| `app/layout.tsx` | Root layout, Google Fonts, metadata |
| `app/api/respond/route.ts` | Claude streaming endpoint. **Do not touch** |

---

## This Is a Full Visual Redesign

Do NOT preserve the existing visual design. Replace it entirely. The current site uses a cream/copper/navy palette with glassmorphism light cards — none of that carries over. Build something completely different.

**Interaction features from a previous pass are already built.** The following are functional in the current code — do NOT rebuild them, just restyle them to look right in your new design:

- Character progress arc below textarea (fills as user types, color shifts at 1500 and 1900 chars)
- Hint chip "Now pick a tone that fits ↓" appears at 50+ chars before tone selected
- Paste detection: textarea softly acknowledges paste with a border/background shift
- Tone pill warm bloom on selection (no bounce/overshoot — a gentle glow bloom)
- Tone pill hover shows `↗` arrow next to descriptor
- Generate button gentle press on click (no bounce)
- Loading stages with rotating messages every 1800ms ("Reading carefully…", "Choosing the right angle…", "Drafting a reply…", "One more pass…")
- Loading icons: BookOpen → Feather → PenLine → Stars, each with breathing/tilting/bobbing/twinkling animations
- Thinking panel: Brain icon header + breathing indicator dot + "Thought for N.Ns" phrase after completion
- No blinking cursor anywhere (no terminal aesthetic in this app)
- Response card settles in with gentle ease-in-out entrance on first character arrival
- "Draft ready" badge with one-shot warm bloom
- Copy button soft stamp: gentle press → color wash → icon cross-fade → text cross-fade, reverts after 2.5s
- "Want a different draft? Try once more ↻" link after response
- Background blobs: slow ambient motion (22s/26s/30s)
- Textarea focus brightens nearest blob
- Cmd/Ctrl + Enter submits from textarea

Your job: give all of the above a new face.

---

## Design Direction — Dark, Modern, Distinctive

**"A premium tool that takes its work seriously."**

This site should feel like expensive software. Dark, precise, considered. Not generic dark mode — genuinely distinctive in its typography choices, color selection, and layout intentionality. The kind of UI that makes someone screenshot it because it looks good.

### Visual Principles

- **Dark.** Deep base — near-black, very dark charcoal, or a rich dark surface (think `#0D0D0D`, `#111118`, or a deep dark that has a subtle hue to it). Darkness is the canvas; color lives in accents, borders, and type.
- **Colorful — but controlled.** 2–3 vivid accent colors that pop hard against the dark base. These should feel curated, not random. Consider: deep violet + electric teal + warm gold; dark forest green + hot coral + cream; dark indigo + neon amber + soft white. Stay away from Honest Dev's palette (no copper, no navy-as-main, no cream backgrounds). Your accents should feel electric against the dark.
- **Typographically modern.** Load a distinctive Google Font — not just Inter or Roboto. Consider Space Grotesk, Syne, DM Sans, Satoshi (via Fontshare), Neue Montreal (via Fontshare), or another modern sans that reads as deliberate. You can pair a bold display weight for the headline/page title with a lighter weight for body. The typography should feel like someone made a real choice.
- **Clean geometry.** Everything on grid. Generous, intentional padding. Cards and containers have sharp edges or very subtle radius (4–8px max — nothing puffy or rounded). Negative space is used as a design element, not just filler. The layout should feel architectural.
- **Dimensional without glass.** Dark card surfaces that sit slightly lighter than the background — maybe `#1A1A2E` on `#0D0D0D`, or dark charcoal on near-black. Thin, vivid 1px borders in an accent color on key containers (the response card, the thinking panel). No light-colored glassmorphism — if you do glass, it's dark-tinted glass.

### Specific Elements

**Tone Pills:**
Not bubbly pill buttons. Consider: outlined dark rectangles with vivid accent borders on selection, or flat dark cards that invert on hover. Each pill should feel like a deliberate choice, not a UI component from a library. The selected state should be unmistakably clear.

**Thinking Panel:**
This is where Claude deliberates. It should feel like a system window — dark, contained, slightly recessed. The Brain icon + "Thinking it through…" header and the breathing indicator dot should adapt to your color palette (your accent color, not copper). The streaming reasoning text should be readable but quiet — it's background process, not featured content.

**Response Card:**
When the response arrives, it should feel like a reveal. The card entrance (settle-in animation) and the "Draft ready" badge bloom should adapt to your dark palette — the badge can use one of your vivid accents. The response text itself should be legible and clean against the dark surface.

**Generate Button:**
Large, confident, filled with your primary accent color. This is the most important interactive element. Make it look like one.

**Background Blobs:**
Keep the concept — 3 slow-moving ambient blobs. But adapt to dark: low-opacity dark-tinted color blobs that add subtle depth to the dark background. Not visible decorations — ambient mood. Much more subtle than the light version. The focus-aware blob brightness shift stays.

---

## What You Can Change

Everything visual:
- `app/globals.css` — full replacement
- `app/page.tsx` — layout, class names, structural markup (keep all interaction and SSE logic)
- `app/layout.tsx` — Google Fonts imports only (metadata stays)
- `tailwind.config.js` — update the color palette to match your new design system

---

## Files NOT to Touch

- `app/api/respond/route.ts` — the Claude streaming endpoint (system prompt, rate limiting, model config, error handling)
- `app/layout.tsx` metadata section
- `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`

---

## Acceptance Criteria

**Design:**
- [ ] Site looks completely different from the previous cream/copper/navy version
- [ ] Dark base applied throughout — no light backgrounds
- [ ] Distinctive modern font loaded and applied
- [ ] 2–3 vivid accents pop clearly against the dark base
- [ ] Card surfaces are dark and layered (not light glass)
- [ ] Layout feels clean and grid-precise (no asymmetry, no rotation)
- [ ] Tone pills have a strong, design-intentional look — not generic buttons

**Functionality (must not break):**
- [ ] Character progress arc still fills and color-shifts as user types
- [ ] Hint chip appears at 50+ chars (before tone selected), fades out on tone click
- [ ] Paste detection still triggers soft textarea acknowledgment
- [ ] Tone pill bloom still fires on selection (no bounce)
- [ ] Tone pill hover still shows `↗` arrow
- [ ] Generate button gentle press still fires
- [ ] Loading messages rotate every 1800ms with correct text
- [ ] Loading icons cycle BookOpen → Feather → PenLine → Stars with correct animations
- [ ] Thinking panel: Brain icon + "Thinking it through…" + breathing dot in header
- [ ] "Thought for N.Ns" phrase appears after thinking completes
- [ ] **No blinking cursor** anywhere in the app
- [ ] Response card entrance animation still fires (settle-in, no bounce)
- [ ] "Draft ready" badge still shows one-shot bloom on arrival
- [ ] Copy button: press + warm color wash + icon/text cross-fade, reverts after 2.5s
- [ ] "Want a different draft? Try once more ↻" link appears after response
- [ ] Background blobs present, slow (22s/26s/30s timing)
- [ ] Textarea focus brightens nearest blob
- [ ] Cmd/Ctrl + Enter submits from textarea
- [ ] "⌘ ↵ to generate" hint visible near Generate button (hidden during loading)
- [ ] All SSE events handled correctly (thinking_start, thinking_delta, response_start, response_delta, error, done)
- [ ] Rate limiting (429) still displays correctly
- [ ] Abort/cancellation still works
- [ ] All easings on new animations: ease-in-out or gentle cubic-bezier (no spring/bounce/overshoot)
