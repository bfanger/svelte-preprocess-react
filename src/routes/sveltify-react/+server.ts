import { redirect, type RequestHandler } from "@sveltejs/kit";
import detectReactVersion from "$lib/internal/detectReactVersion";

export const GET: RequestHandler = async () => {
  const version = await detectReactVersion();
  const location = version <= 17 ? "/sveltify-react17" : "/sveltify-react18";
  /* eslint-disable-next-line @typescript-eslint/no-throw-literal */
  throw redirect(302, location);
};
