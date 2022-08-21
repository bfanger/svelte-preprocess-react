import detectReactVersion from "$lib/internal/detectReactVersion";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
  return new Response(`${await detectReactVersion()}`, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
