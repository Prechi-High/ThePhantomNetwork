import { redisPollEvents } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ subSessionId: string }> }
) {
  const { subSessionId } = await params;
  const encoder = new TextEncoder();
  const channel = redisKeys.realtimeChannel(subSessionId);
  let lastSeen = Date.now();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      send(JSON.stringify({ type: "connected", subSessionId }));

      const poll = async () => {
        while (!closed) {
          const events = await redisPollEvents(channel, lastSeen);
          for (const event of events) {
            lastSeen = (event as { at: number }).at ?? Date.now();
            send(JSON.stringify(event));
          }
          send(JSON.stringify({ type: "heartbeat" }));
          await new Promise((r) => setTimeout(r, 2000));
        }
      };

      poll().catch(() => {
        if (!closed) controller.close();
      });
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
