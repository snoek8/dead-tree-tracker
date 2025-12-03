import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get top 5 contributors using the database function
    const { data: contributors, error } = await supabase.rpc(
      "get_top_contributors",
      { limit_count: 5 }
    );

    if (error) {
      // If function doesn't exist yet, return empty array (migration not run)
      if (error.message.includes("function") && error.message.includes("does not exist")) {
        return NextResponse.json([]);
      }
      throw error;
    }

    return NextResponse.json(contributors || []);
  } catch (error: any) {
    console.error("Error fetching contributors:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch contributors" },
      { status: 500 }
    );
  }
}

