// app/api/update-blog/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { blogId, content } = await req.json();
    if (!blogId || !content) return NextResponse.json({ error: "blogId and content required" }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from("blogs").update({ content }).eq("id", blogId);
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
