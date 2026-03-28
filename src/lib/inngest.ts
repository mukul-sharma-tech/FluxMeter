// lib/inngest.ts
import { Inngest } from "inngest";

// This is the single, shared client instance that
// our API routes will import.
export const inngest = new Inngest({ id: "digital-lessons-app" });