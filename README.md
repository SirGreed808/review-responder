# Review Responder

Paste a Google review. Pick a tone. Get a ready-to-copy response — powered by Claude.

**Live demo:** [review-responder-inky.vercel.app](https://review-responder-inky.vercel.app)

---

## What it does

Small businesses spend way too much time staring at a blank reply box after a Google review. This tool fixes that — paste the review, choose how you want to sound, and get a genuinely good response in seconds.

Claude's extended thinking reads between the lines of the review before writing — it picks up on tone, specific complaints, and context most generators miss. Responses vary structure every time so they don't all sound like they came from the same script.

## Features

- **Extended thinking** — Claude reasons about the review before drafting, not just pattern-matching
- **Streaming output** — response appears word by word, no waiting for a full generation
- **Four tones** — Professional, Friendly, Apologetic, Enthusiastic (with descriptors so you know which to pick)
- **Response variety** — randomized opening angle injection keeps drafts from sounding templated
- **Copy to clipboard** — one click, done
- **Rate limiting** — 5 requests per minute per IP

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript) with streaming + extended thinking
- [Tailwind CSS v4](https://tailwindcss.com)
- TypeScript
- Deployed on [Vercel](https://vercel.com)

## Local setup

**Prerequisites:** Node.js 18+, an [Anthropic API key](https://console.anthropic.com)

```bash
git clone https://github.com/SirGreed808/review-responder.git
cd review-responder
npm install
```

Copy the env template and add your key:

```bash
cp .env.example .env.local
```

```env
# .env.local
ANTHROPIC_API_KEY=your_key_here
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSirGreed808%2Freview-responder)

Set `ANTHROPIC_API_KEY` in your Vercel project's environment variables before deploying.

## Project structure

```
app/
├── page.tsx              # UI — review input, tone picker, streaming output
├── layout.tsx            # Root layout, fonts, metadata
├── globals.css           # All styles (Tailwind + custom)
└── api/
    └── respond/
        └── route.ts      # Claude streaming endpoint with rate limiting
```

---

Built by [Honest Dev 808](https://honestdev808.com) · [hey@honestdev808.com](mailto:hey@honestdev808.com)
