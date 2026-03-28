import { createClient } from "@/utils/supabase/server";
import Dashboard from "@/app/components/Dashboard";
import { Database } from "./types_db";

export type Blog = Database["public"]["Tables"]["blogs"]["Row"];

export default async function Home() {
  const supabase = await createClient();
  const { data: blogs } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });

  return <Dashboard initialBlogs={blogs || []} />;
}
