import { redirect, type RequestHandler } from "@sveltejs/kit";
import detectReactVersion from "$lib/internal/detectReactVersion";

export const GET: RequestHandler = async () => {
  const version = await detectReactVersion();
  const location = version <= 17 ? "/sveltify-react17" : "/sveltify-react18";
  throw redirect(302, location);
};
