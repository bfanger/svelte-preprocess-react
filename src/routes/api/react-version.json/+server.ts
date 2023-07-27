import type { RequestHandler } from "@sveltejs/kit";
import detectReactVersion from "$lib/internal/detectReactVersion";

export const GET: RequestHandler = async () =>
  new Response(`${await detectReactVersion()}`, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
