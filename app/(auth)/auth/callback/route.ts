import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  
  // Get origin from request - this will be the actual domain (Vercel or localhost)
  const origin = requestUrl.origin;
  
  // Also check headers for the host in case origin is not set correctly
  const host = request.headers.get("host");
  const protocol = requestUrl.protocol || "https:";
  const finalOrigin = origin || (host ? `${protocol}//${host}` : process.env.NEXT_PUBLIC_SITE_URL || "https://dead-tree-tracker1.vercel.app");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  // Use the actual request origin to ensure we redirect to the correct domain
  return NextResponse.redirect(`${finalOrigin}/map`);
}

