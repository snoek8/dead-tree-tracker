import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

// Username validation regex: 3-30 chars, alphanumeric + underscore/hyphen
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get username from user metadata
    const username = (user.user_metadata?.username as string) || null;

    return NextResponse.json({ username });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Validate username format
    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens",
        },
        { status: 400 }
      );
    }

    // Check username uniqueness using the database function
    const adminClient = createAdminClient();
    const { data: isAvailable, error: checkError } = await adminClient.rpc(
      "check_username_available",
      { username_to_check: username }
    );

    if (checkError) {
      console.error("Error checking username:", checkError);
      return NextResponse.json(
        { error: "Failed to check username availability" },
        { status: 500 }
      );
    }

    // If username is not available and it's not the current user's username
    if (!isAvailable) {
      const currentUsername = user.user_metadata?.username;
      if (currentUsername !== username) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 }
        );
      }
    }

    // Update user metadata using admin client
    const { data: updatedUser, error: updateError } =
      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          username: username,
        },
      });

    if (updateError) {
      console.error("Error updating user:", updateError);
      return NextResponse.json(
        { error: "Failed to update username" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      username: updatedUser.user.user_metadata?.username || null,
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

