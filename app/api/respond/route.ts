import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Best-effort rate limiting — not coordinated across serverless instances
// but reduces abuse within a single warm instance
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;
const ipWindows = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipWindows.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= RATE_LIMIT) return true;
  hits.push(now);
  ipWindows.set(ip, hits);
  return false;
}

const SYSTEM_PROMPT = `You are an expert at writing business responses to customer reviews.
Write responses that are genuine, address specific points raised, and represent the business professionally.
Keep responses concise — 3 to 5 sentences. Do not include a subject line or greeting like "Dear [Name]".
Vary your structure and opening every time — never start two responses the same way. Rotate between: leading with gratitude, leading with the specific issue raised, leading with a forward-looking statement, or leading with an acknowledgment of the customer's experience.`;

const OPENERS = [
  "Lead with specific gratitude for what they called out — not generic thanks.",
  "Open by directly addressing the core issue or praise they mentioned.",
  "Start with a forward-looking commitment — what will be different or stay great.",
  "Acknowledge their experience first, then pivot to your response.",
  "Open with something personal or specific to their situation before anything else.",
  "Start mid-conversation — skip the pleasantries, get straight to the substance.",
];

function randomOpener() {
  return OPENERS[Math.floor(Math.random() * OPENERS.length)];
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return new Response("Too many requests. Please wait a minute.", {
      status: 429,
    });
  }

  const { review, tone } = await req.json();

  if (!review?.trim()) {
    return new Response("Review text is required", { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: string) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
      };

      try {
        const response = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 16000,
          thinking: { type: "enabled", budget_tokens: 8000 },
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Write a ${tone} response to this Google review:\n\n"${review}"\n\nStructure note: ${randomOpener()}`,
            },
          ],
          stream: true,
        });

        let inThinking = false;

        for await (const event of response) {
          if (event.type === "content_block_start") {
            if (event.content_block.type === "thinking") {
              inThinking = true;
              send("thinking_start", "");
            } else if (event.content_block.type === "text") {
              inThinking = false;
              send("response_start", "");
            }
          } else if (event.type === "content_block_delta") {
            if (event.delta.type === "thinking_delta") {
              send("thinking_delta", JSON.stringify(event.delta.thinking));
            } else if (event.delta.type === "text_delta") {
              send("response_delta", JSON.stringify(event.delta.text));
            }
          } else if (event.type === "message_stop") {
            send("done", "");
          }
        }
      } catch (err) {
        send("error", JSON.stringify(String(err)));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
