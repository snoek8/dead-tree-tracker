import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: entries, error } = await supabase
      .from("entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!entries || entries.length === 0) {
      return NextResponse.json([]);
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(entries.map((e) => e.user_id))];

    // Fetch usernames for all unique users using the database function
    const usernameMap: Record<string, string | null> = {};
    
    // Try using the database function first (more efficient)
    try {
      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const { data: username } = await supabase.rpc("get_username", {
              user_uuid: userId,
            });
            usernameMap[userId] = username || null;
          } catch (err) {
            // Function might not be available, will fallback to admin client
            usernameMap[userId] = null;
          }
        })
      );
    } catch (err) {
      // If function fails, use admin client fallback
    }

    // Fallback: Use admin client for any users without usernames
    const adminClient = createAdminClient();
    await Promise.all(
      uniqueUserIds.map(async (userId) => {
        if (usernameMap[userId] === null || usernameMap[userId] === undefined) {
          try {
            const { data: user } = await adminClient.auth.admin.getUserById(
              userId
            );
            usernameMap[userId] =
              user?.user?.user_metadata?.username ||
              user?.user?.email?.split("@")[0] ||
              null;
          } catch (err) {
            usernameMap[userId] = null;
          }
        }
      })
    );

    // Map usernames to entries
    const entriesWithUsernames = entries.map((entry) => ({
      ...entry,
      username: usernameMap[entry.user_id] || null,
    }));

    return NextResponse.json(entriesWithUsernames);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { photo_url, latitude, longitude, notes } = body;

    const { data, error } = await supabase
      .from("entries")
      .insert({
        user_id: user.id,
        photo_url,
        latitude,
        longitude,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

