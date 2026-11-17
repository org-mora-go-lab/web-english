/** Read SSE data frames across arbitrary UTF-8/chunk boundaries. */
export async function* readServerEvents(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let data: string[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      // A missing frame delimiter must not grow memory without bound.
      if (buffer.length > 1_048_576) throw new Error("Event frame too large");
      let end: number;
      while ((end = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, end).replace(/\r$/, "");
        buffer = buffer.slice(end + 1);
        if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""));
        else if (!line && data.length) {
          const payload = data.join("\n"); data = [];
          if (payload !== "[DONE]") yield JSON.parse(payload) as unknown;
        }
      }
      if (data.join("").length > 1_048_576) throw new Error("Event frame too large");
      if (done) break;
    }
    // Do not accept a truncated final frame as a completed response.
    if (buffer.trim() || data.length) throw new Error("Incomplete event frame");
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
