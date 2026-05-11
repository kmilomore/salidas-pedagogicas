import type { SupabaseClient } from "@supabase/supabase-js";

const LIMIT_PER_HOUR = 10;

export async function limitTripCreation(supabase: SupabaseClient, userId: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("salidas_pedagogicas")
    .select("id", { count: "exact", head: true })
    .eq("director_id", userId)
    .gte("created_at", oneHourAgo);

  if (error) {
    return {
      success: true,
      limit: LIMIT_PER_HOUR,
      remaining: null,
      reset: null,
    };
  }

  const used = count ?? 0;

  return {
    success: used < LIMIT_PER_HOUR,
    limit: LIMIT_PER_HOUR,
    remaining: Math.max(LIMIT_PER_HOUR - used, 0),
    reset: oneHourAgo,
  };
}