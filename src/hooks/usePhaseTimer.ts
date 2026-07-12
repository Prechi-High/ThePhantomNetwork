"use client";

/**
 * usePhaseTimer — Accurate Phase Countdown
 *
 * Domain: Phase timing only. Re-exported from useRealtimeSession for convenience.
 *
 * Uses server-provided phaseEndsAt timestamp + client clock.
 * Polls at 250ms for smooth display — not setInterval(1000) with drift.
 * Every player reaches 00:00 at the same moment.
 */

export { usePhaseTimer, useTimerState } from "./useRealtimeSession";
