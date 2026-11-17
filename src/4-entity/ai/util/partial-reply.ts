/** Only expose the first `reply` string, never JSON syntax or suggestion metadata. */
export function partialReply(json: string) {
  const start = /^\s*\{\s*"reply"\s*:\s*"/.exec(json);
  if (!start) return "";
  let text = "";
  for (let i = start[0].length; i < json.length; i++) {
    const character = json[i];
    if (character === '"') break;
    if (character !== "\\") { text += character; continue; }
    const escaped = json[++i];
    if (!escaped) break;
    if (escaped === "u") {
      const digits = json.slice(i + 1, i + 5);
      if (!/^[\da-f]{4}$/i.test(digits)) break;
      text += String.fromCharCode(parseInt(digits, 16)); i += 4;
    } else {
      const escapes: Record<string, string> = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" };
      if (!(escaped in escapes)) break;
      text += escapes[escaped];
    }
  }
  return text.slice(0, 2_000).replace(/[\uD800-\uDBFF]$/, "");
}
