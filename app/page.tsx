"use client";

import { useState, useRef } from "react";

const TONES = ["Professional", "Friendly", "Apologetic", "Enthusiastic"] as const;
type Tone = (typeof TONES)[number];

const TONE_DESCRIPTORS: Record<Tone, string> = {
  Professional: "Clear, direct, represents your brand well.",
  Friendly: "Warm and human — not salesy.",
  Apologetic: "Owns the issue, focused on making it right.",
  Enthusiastic: "High energy — great for glowing reviews.",
};

const LOADING_STAGES = [
  "Reading the review…",
  "Finding the right angle…",
  "Writing your response…",
  "Polishing the draft…",
];

export default function Home() {
  const [review, setReview] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [thinking, setThinking] = useState("");
  const [response, setResponse] = useState("");
  const [showThinking, setShowThinking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const stageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function handleGenerate() {
    if (!review.trim() || loading) return;

    setLoading(true);
    setThinking("");
    setResponse("");
    setShowThinking(false);
    setLoadingStage(0);

    let stage = 0;
    stageIntervalRef.current = setInterval(() => {
      stage = Math.min(stage + 1, LOADING_STAGES.length - 1);
      setLoadingStage(stage);
    }, 2500);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review, tone }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const msg =
          res.status === 429
            ? "Too many requests — please wait a minute and try again."
            : res.status === 400
              ? "That review can't be processed — check the length and try again."
              : "Something went wrong. Please try again.";
        setResponse(msg);
        return;
      }

      if (!res.body) {
        setResponse("No response from server. Please try again.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const lines = part.trim().split("\n");
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;

          const event = eventLine.slice(7).trim();
          const data = dataLine.slice(5).trim();

          if (event === "thinking_start") setShowThinking(true);
          if (event === "thinking_delta") setThinking((t) => t + JSON.parse(data));
          if (event === "response_delta") setResponse((r) => r + JSON.parse(data));
          if (event === "error") {
            const msg = data ? JSON.parse(data) : "Generation failed.";
            setResponse(msg);
            return;
          }
          if (event === "done") return;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setResponse("Something went wrong. Please try again.");
      }
    } finally {
      if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Animated background */}
      <div className="page-bg">
        <div className="dot-grid" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <main className="relative z-10 px-4 py-16">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-12 text-center">
            <span className="hero-badge">AI-Powered</span>
            <h1 className="hero-heading mt-4 mb-3">
              Turn reviews into<br />
              <span className="gradient-text">real relationships</span>
            </h1>
            <p className="text-base" style={{ color: "var(--muted)" }}>
              Paste any Google review. Pick your tone. Get a response worth sending.
            </p>
          </div>

          {/* Main card */}
          <div className="main-card">

            {/* Review input */}
            <div className="mb-6">
              <label htmlFor="review" className="field-label">What did they say?</label>
              <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="The food was great but the wait time was way too long…"
                className="review-textarea"
              />
              <div className="char-count">{review.length} / 2000 chars</div>
            </div>

            {/* Tone picker */}
            <div className="mb-8">
              <span className="field-label" id="tone-label">Tone</span>
              <div
                role="radiogroup"
                aria-labelledby="tone-label"
                className="flex flex-wrap gap-2 mb-2"
              >
                {TONES.map((t) => (
                  <button
                    key={t}
                    role="radio"
                    aria-checked={tone === t}
                    onClick={() => setTone(t)}
                    className={`tone-pill ${tone === t ? "tone-pill-active" : "tone-pill-inactive"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="tone-descriptor">{TONE_DESCRIPTORS[tone]}</p>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!review.trim() || loading}
              className="generate-btn"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="spinner" />
                  {LOADING_STAGES[loadingStage]}
                </span>
              ) : (
                "Write my response →"
              )}
            </button>
          </div>

          {/* Thinking block */}
          {showThinking && (
            <div className="result-card thinking-card mt-4">
              <button
                onClick={() => setShowThinking((v) => !v)}
                aria-expanded={showThinking}
                className="flex items-center gap-2 text-sm mb-3 font-medium w-full cursor-pointer"
                style={{ color: "var(--muted)" }}
              >
                {loading && <span className="thinking-pulse" />}
                <span>{loading ? "Working it out…" : "Claude's reasoning"}</span>
                <span className="text-xs ml-auto">{showThinking ? "▲" : "▼"}</span>
              </button>
              <div className="thinking-body" aria-live="polite">
                {thinking || <span className="animate-pulse">Thinking…</span>}
              </div>
            </div>
          )}

          {/* Response block */}
          {response && (
            <div className="result-card response-card mt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="draft-badge">Draft ready</span>
                <button
                  onClick={handleCopy}
                  className={`copy-btn ${copied ? "copy-btn-copied" : ""}`}
                >
                  {copied ? "Copied!" : "Copy response"}
                </button>
              </div>
              <div className="response-body" aria-live="polite">{response}</div>
            </div>
          )}

          {/* Lead CTA */}
          {response && !loading && (
            <div className="cta-card mt-6">
              <p className="text-sm font-semibold text-white mb-1">
                Want help managing your online reputation?
              </p>
              <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
                Honest Dev builds custom tools for small businesses — from review workflows to full web apps.
              </p>
              <a
                href="https://honestdev808.com"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-link"
              >
                Work with us →
              </a>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
