import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const encoder = new TextEncoder();
  let closed = false;
  let lastId: string | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      const poll = async () => {
        while (!closed) {
          try {
            const admin = createAdminClient();
            const { data } = await admin
              .from("live_feed_events")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(5);

            if (data?.length) {
              const newest = data[0];
              if (newest.id !== lastId) {
                lastId = newest.id;
                send(
                  JSON.stringify({
                    eventType: newest.event_type,
                    message: newest.message,
                    metadata: newest.metadata,
                  })
                );
              }
            }
          } catch {
            // ignore poll errors
          }
          await new Promise((r) => setTimeout(r, 5000));
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
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
