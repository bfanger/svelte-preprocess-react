import { renderToReadableStream } from "react-dom/server";

export default async function renderToStringAsync(
  ...args: Parameters<typeof renderToReadableStream>
): Promise<string> {
  return await streamToString(await renderToReadableStream(...args));
}

async function streamToString(stream: ReadableStream) {
  let output = "";
  const decoder = new TextDecoder();
  await stream.pipeTo(
    new WritableStream({
      write(chunk) {
        output += decoder.decode(chunk);
      },
    }),
  );
  return output;
}
