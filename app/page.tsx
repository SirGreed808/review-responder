"use client";

import { useState, useRef, useEffect } from "react";

const TONES = ["Professional", "Friendly", "Apologetic", "Enthusiastic"] as const;
type Tone = (typeof TONES)[number];

const TONE_DESCRIPTORS: Record<Tone, string> = {
  Professional: "Clear, direct, represents your brand well.",
  Friendly: "Warm and human — not salesy.",
  Apologetic: "Owns the issue, focused on making it right.",
  Enthusiastic: "High energy — great for glowing reviews.",
};

const LOADING_STAGES = [
  "Reading carefully…",
  "Choosing the right angle…",
  "Drafting a reply…",
  "One more pass…",
];

/* ── Inline SVG icons ── */

function BrainIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04Z" />
    </svg>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function FeatherIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  );
}

function PenLineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function StarsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

const LOADING_ICONS = [
  { Icon: BookOpenIcon, anim: "icon-breathe" },
  { Icon: FeatherIcon, anim: "icon-tilt" },
  { Icon: PenLineIcon, anim: "icon-bob" },
  { Icon: StarsIcon, anim: "icon-twinkle" },
];

const MAX_CHARS = 2000;
const ARC_R = 14;
const ARC_CIRCUMFERENCE = 2 * Math.PI * ARC_R;

export default function Home() {
  const [review, setReview] = useState("");
  const [tone, setTone] = useState<Tone | null>(null);
  const [thinking, setThinking] = useState("");
  const [response, setResponse] = useState("");
  const [showThinking, setShowThinking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [pasted, setPasted] = useState(false);
  const [toneBloom, setToneBloom] = useState<string | null>(null);
  const [thinkingStartTime, setThinkingStartTime] = useState<number | null>(null);
  const [thinkingDuration, setThinkingDuration] = useState<number | null>(null);
  const [badgeBloomed, setBadgeBloomed] = useState(false);
  const [copyPress, setCopyPress] = useState(false);
  const [textareaFocused, setTextareaFocused] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const stageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pasteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const badgeBloomRef = useRef(false);

  /* ── Derived state ── */

  const charProgress = Math.min(review.length / MAX_CHARS, 1);
  const strokeDashoffset = ARC_CIRCUMFERENCE * (1 - charProgress);

  let arcClass = "low";
  if (review.length >= 1900) arcClass = "high";
  else if (review.length >= 1500) arcClass = "mid";

  const showHint = review.length >= 50 && !tone && !loading && !response;

  /* ── Handlers ── */

  const handlePaste = () => {
    setPasted(true);
    if (pasteTimeoutRef.current) clearTimeout(pasteTimeoutRef.current);
    pasteTimeoutRef.current = setTimeout(() => setPasted(false), 800);
  };

  const handleToneSelect = (t: Tone) => {
    setTone(t);
    setToneBloom(t);
    setTimeout(() => setToneBloom(null), 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleGenerate();
    }
  };

  async function handleGenerate() {
    if (!review.trim() || loading) return;

    setLoading(true);
    setThinking("");
    setResponse("");
    setShowThinking(false);
    setLoadingStage(0);
    setBadgeBloomed(false);
    badgeBloomRef.current = false;
    setThinkingDuration(null);
    setThinkingStartTime(null);

    let stage = 0;
    stageIntervalRef.current = setInterval(() => {
      stage = Math.min(stage + 1, LOADING_STAGES.length - 1);
      setLoadingStage(stage);
    }, 1800);

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

          if (event === "thinking_start") {
            setShowThinking(true);
            setThinkingStartTime(Date.now());
          }
          if (event === "thinking_delta") setThinking((t) => t + JSON.parse(data));
          if (event === "response_start") {
            if (thinkingStartTime) {
              setThinkingDuration((Date.now() - thinkingStartTime) / 1000);
            }
          }
          if (event === "response_delta") {
            setResponse((r) => r + JSON.parse(data));
            if (!badgeBloomRef.current) {
              badgeBloomRef.current = true;
              setBadgeBloomed(true);
              setTimeout(() => setBadgeBloomed(false), 600);
            }
          }
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
    setCopyPress(true);
    setTimeout(() => setCopyPress(false), 150);
    setTimeout(() => setCopied(false), 2500);
  }

  /* ── Effects ── */

  useEffect(() => {
    return () => {
      if (pasteTimeoutRef.current) clearTimeout(pasteTimeoutRef.current);
    };
  }, []);

  /* ── Render ── */

  const { Icon: LoadingIcon, anim: iconAnim } = LOADING_ICONS[loadingStage];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="page-bg">
        <div className={`grid-floor ${textareaFocused ? "focused" : ""}`} />
        <div className="hex-particle hex-1" />
        <div className="hex-particle hex-2" />
        <div className="hex-particle hex-3" />
        <div className="hex-particle hex-4" />
        <div className="hex-particle hex-5" />
      </div>
      <div className="scan-lines" />
      <div className="vignette" />
      <div className="horizon-glow" />
      <div className="light-beam beam-1" />
      <div className="light-beam beam-2" />
      <div className="light-beam beam-3" />

      <main className="relative z-10 px-4 py-10 md:py-16">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-10 md:mb-14 text-center">
            <span className="hero-badge">AI-Powered</span>
            <h1 className="hero-heading mt-5 mb-3">
              Review<br />
              <span className="glitch" data-text="RESPONDER">RESPONDER</span>
            </h1>
            <p className="tagline">
              Paste a review. Choose your vibe. Get a reply that hits.
            </p>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Left column — input */}
            <div className="lg:col-span-3">
              <div className="main-card p-6 md:p-8">

                {/* Section label */}
                <div className="section-label mb-5">
                  <span>Input</span>
                </div>

                {/* Review textarea */}
                <div className="mb-5">
                  <textarea
                    id="review"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setTextareaFocused(true)}
                    onBlur={() => setTextareaFocused(false)}
                    rows={6}
                    maxLength={MAX_CHARS}
                    placeholder="The food was great but the wait time was way too long…"
                    className={`review-textarea ${pasted ? "pasted" : ""}`}
                  />
                  <div className="char-arc-wrap">
                    <span className="char-count">{review.length} / {MAX_CHARS}</span>
                    <svg className="char-arc" viewBox="0 0 32 32">
                      <circle className="char-arc-bg" cx="16" cy="16" r={ARC_R} />
                      <circle
                        className={`char-arc-fill ${arcClass}`}
                        cx="16"
                        cy="16"
                        r={ARC_R}
                        strokeDasharray={ARC_CIRCUMFERENCE}
                        strokeDashoffset={strokeDashoffset}
                      />
                    </svg>
                  </div>
                </div>

                {/* Hint chip */}
                {showHint && (
                  <div className="mb-5">
                    <span className="hint-chip">
                      <span>Now pick a tone that fits</span>
                      <span>↓</span>
                    </span>
                  </div>
                )}

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={!review.trim() || loading}
                  className="generate-btn"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="loading-icon-wrap">
                        <LoadingIcon className={`loading-icon ${iconAnim}`} />
                      </span>
                      {LOADING_STAGES[loadingStage]}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>Generate Response</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </span>
                  )}
                </button>

                {/* Keyboard hint */}
                {!loading && (
                  <div className="keyboard-hint">
                    <kbd>⌘</kbd>
                    <span>+</span>
                    <kbd>↵</kbd>
                    <span>to generate</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right column — tone picker */}
            <div className="lg:col-span-2">
              <div className="main-card p-6 md:p-8 h-full">
                <div className="section-label mb-5">
                  <span>Tone</span>
                </div>

                <div
                  role="radiogroup"
                  aria-label="Select tone"
                  className="flex flex-col gap-3"
                >
                  {TONES.map((t, i) => (
                    <button
                      key={t}
                      role="radio"
                      aria-checked={tone === t}
                      onClick={() => handleToneSelect(t)}
                      className={`tone-card ${tone === t ? "tone-card-active" : "tone-card-inactive"} ${toneBloom === t ? "tone-card-bloom" : ""}`}
                    >
                      <span className="tone-index">0{i + 1}</span>
                      <span>{t}</span>
                      <ArrowRightIcon className="tone-arrow w-4 h-4" />
                    </button>
                  ))}
                </div>

                {/* Tone descriptor */}
                <p className="tone-descriptor mt-4">
                  {tone ? TONE_DESCRIPTORS[tone] : "Select a tone to see how it sounds…"}
                </p>
              </div>
            </div>
          </div>

          {/* Thinking block */}
          {showThinking && (
            <div className="result-card thinking-card mt-6 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="thinking-header">
                  <BrainIcon className="w-4 h-4" style={{ color: "var(--neon-cyan)" }} />
                  <span>{loading ? "Thinking it through…" : "Claude's reasoning"}</span>
                  {loading && <span className="thinking-pulse" />}
                </div>
                {!loading && thinkingDuration !== null && (
                  <span className="thinking-time">Thought for {thinkingDuration.toFixed(1)}s</span>
                )}
              </div>
              <div className="thinking-body" aria-live="polite">
                {thinking || <span style={{ color: "var(--text-dim)" }}>Thinking…</span>}
              </div>
            </div>
          )}

          {/* Response block */}
          {response && (
            <div className="result-card response-card mt-6 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`draft-badge ${badgeBloomed ? "draft-badge-bloom" : ""}`}>Draft ready</span>
                <button
                  onClick={handleCopy}
                  className={`copy-btn ${copied ? "copy-btn-copied" : ""} ${copyPress ? "copy-btn-press" : ""}`}
                >
                  <span className="flex items-center gap-2">
                    {copied ? (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <CopyIcon className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
              <div className="response-body" aria-live="polite">{response}</div>
              {!loading && (
                <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(0, 240, 255, 0.06)" }}>
                  <button
                    onClick={handleGenerate}
                    className="regenerate-link"
                  >
                    <span>Want a different draft? Try once more</span>
                    <span>↻</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Lead CTA */}
          {response && !loading && (
            <div className="cta-card mt-6 p-6 md:p-8">
              <p className="cta-heading mb-1">
                Want help managing your <span className="glitch" data-text="ONLINE REP?">ONLINE REP?</span>
              </p>
              <p className="text-sm mb-5" style={{ color: "var(--text-dim)" }}>
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
