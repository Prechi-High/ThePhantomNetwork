import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { captureException } from "@/lib/monitoring/capture";
import { createAndStartPracticeSession } from "@/lib/gameplay/practice-session";
import type { PhaseConfig } from "@/types/gameplay";

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const title = (body.title as string)?.trim() || "My AI Practice";
    const botCount = Math.min(20, Math.max(1, Number(body.botCount) || 10));
    const phase_config = body.phase_config as PhaseConfig;

    const result = await createAndStartPracticeSession({
      userId: user!.id,
      title,
      botCount,
      phaseConfig: phase_config,
    });

    return NextResponse.json(result);
  } catch (err) {
    await captureException("session", err);
    const msg = err instanceof Error ? err.message : "Failed to create practice session";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
