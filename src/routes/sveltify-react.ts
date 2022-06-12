import detectReactVersion from "$lib/internal/detectReactVersion";
import type { RequestHandler } from "@sveltejs/kit";

// eslint-disable-next-line import/prefer-default-export
export const get: RequestHandler = async () => {
  const version = await detectReactVersion();
  return {
    status: 302,
    headers: {
      location: version <= 17 ? "/sveltify-react17" : "/sveltify-react18",
    },
  };
};
