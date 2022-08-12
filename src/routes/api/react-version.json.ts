import detectReactVersion from "$lib/internal/detectReactVersion";
import type { RequestHandler } from "@sveltejs/kit";

// eslint-disable-next-line import/prefer-default-export
export const GET: RequestHandler = async () => {
  return {
    body: await detectReactVersion(),
  };
};
