import type { RequestHandler } from "@sveltejs/kit";
import pkg from "../../package.json";

// eslint-disable-next-line import/prefer-default-export
export const get: RequestHandler = async () => {
  const version = parseInt(pkg.devDependencies.react, 10);
  return {
    status: 302,
    headers: {
      location: version <= 17 ? "/sveltify-react17" : "/sveltify-react18",
    },
  };
};
