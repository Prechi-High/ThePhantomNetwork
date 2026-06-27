import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Creates an open test session starting in 15 minutes.
 * Run: npx tsx scripts/create-test-session.ts
 */
async function main() {
  const admin = createAdminClient();
  const startsAt = new Date(Date.now() + 15 * 60 * 1000);
  const registrationClosesAt = new Date(startsAt.getTime() - 10 * 60 * 1000);

  const { data, error } = await admin
    .from("sessions")
    .insert({
      title: "Phantom Test Session",
      status: "open",
      starts_at: startsAt.toISOString(),
      registration_closes_at: registrationClosesAt.toISOString(),
      entry_fee_cents: 500,
      max_players: 100,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }

  console.log("Created session:", data.id);
  console.log("Starts at:", data.starts_at);
}

main();
