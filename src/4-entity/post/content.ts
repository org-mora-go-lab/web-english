import { z } from "zod";

export type ContentNode = {
  type: string;
  text?: string;
  attrs?: Record<string, string>;
  marks?: { type: string; attrs?: Record<string, string> }[];
  content?: ContentNode[];
};

export type ContentDocument = { type: "doc"; content: ContentNode[] };

const containers = new Set(["paragraph", "heading", "bulletList", "orderedList", "listItem", "blockquote", "codeBlock"]);
const atoms = new Set(["horizontalRule", "hardBreak", "image", "vocabulary", "dialogue", "quiz"]);
const marks = new Set(["bold", "italic", "strike", "code", "link"]);

function safeUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 2000) return "";
  if (/^\/api\/media\/[0-9a-f-]{36}\/file$/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? value : "";
  } catch { return ""; }
}

export function sanitizeDocument(value: unknown): ContentDocument {
  if (!value || typeof value !== "object" || (value as { type?: unknown }).type !== "doc") throw new Error("본문 형식이 올바르지 않습니다.");
  let count = 0;
  function visit(raw: unknown, depth: number): ContentNode | null {
    if (!raw || typeof raw !== "object" || depth > 12 || ++count > 2500) throw new Error("본문이 너무 크거나 복잡합니다.");
    const node = raw as Record<string, unknown>;
    if (node.type === "text") {
      const text = typeof node.text === "string" ? node.text.slice(0, 20_000) : "";
      const rawMarks = Array.isArray(node.marks) ? node.marks : [];
      return { type: "text", text, marks: rawMarks.flatMap((mark) => {
        if (!mark || typeof mark !== "object" || !marks.has((mark as { type: string }).type)) return [];
        const typed = mark as { type: string; attrs?: { href?: unknown } };
        if (typed.type === "link") {
          const href = safeUrl(typed.attrs?.href);
          return href ? [{ type: "link", attrs: { href } }] : [];
        }
        return [{ type: typed.type }];
      }) };
    }
    const type = String(node.type ?? "");
    if (!containers.has(type) && !atoms.has(type)) return null;
    if (type === "image") {
      const attrs = (node.attrs ?? {}) as Record<string, unknown>;
      const src = safeUrl(attrs.src);
      return src ? { type, attrs: { src, alt: String(attrs.alt ?? "").slice(0, 200) } } : null;
    }
    if (type === "vocabulary" || type === "dialogue" || type === "quiz") {
      const attrs = (node.attrs ?? {}) as Record<string, unknown>;
      const allowed = type === "vocabulary" ? ["word", "meaning", "example"] : type === "dialogue" ? ["speaker", "line"] : ["question", "options", "answer"];
      return { type, attrs: Object.fromEntries(allowed.map((key) => [key, String(attrs[key] ?? "").slice(0, 1000)])) };
    }
    if (atoms.has(type)) return { type };
    const attrs = type === "heading" ? { level: String(Math.min(3, Math.max(1, Number((node.attrs as { level?: unknown } | undefined)?.level ?? 2)))) } : undefined;
    const content = (Array.isArray(node.content) ? node.content : []).map((child) => visit(child, depth + 1)).filter((child): child is ContentNode => child !== null);
    return { type, ...(attrs ? { attrs } : {}), content };
  }
  const raw = value as { content?: unknown };
  return { type: "doc", content: (Array.isArray(raw.content) ? raw.content : []).map((node) => visit(node, 0)).filter((node): node is ContentNode => node !== null) };
}

export function contentText(document: ContentDocument) {
  const parts: string[] = [];
  function walk(node: ContentNode) {
    if (node.text) parts.push(node.text);
    if (node.attrs) parts.push(...Object.values(node.attrs).filter(Boolean));
    node.content?.forEach(walk);
  }
  document.content.forEach(walk);
  return parts.join(" ").slice(0, 100_000);
}

export const postInputSchema = z.object({
  title: z.string().trim().min(1).max(180),
  summary: z.string().trim().max(500).default(""),
  contentJson: z.unknown(),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  visibility: z.enum(["public", "private"]).default("private"),
  category: z.string().trim().max(60).default(""),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  coverImageUrl: z.string().refine((value) => Boolean(safeUrl(value))).optional().nullable(),
  version: z.number().int().positive().optional(),
});

export function parsePostInput(value: unknown) {
  const input = postInputSchema.parse(value);
  if (JSON.stringify(input.contentJson).length > 200_000) throw new Error("본문이 너무 큽니다.");
  const json = sanitizeDocument(input.contentJson);
  return { ...input, contentJson: JSON.stringify(json), contentText: contentText(json) };
}

export function markdownToDocument(markdown: string): { title: string; contentJson: ContentDocument } {
  if (markdown.length > 200_000) throw new Error("파일이 너무 큽니다.");
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const title = lines.find((line) => /^#\s+/.test(line))?.replace(/^#\s+/, "").trim() ?? "가져온 콘텐츠";
  const content: ContentNode[] = [];
  function inline(value: string): ContentNode[] {
    const result: ContentNode[] = [];
    const pattern = /(\[([^\]]+)\]\((https:\/\/[^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
    let position = 0;
    for (const match of value.matchAll(pattern)) {
      const start = match.index ?? 0;
      if (start > position) result.push({ type: "text", text: value.slice(position, start) });
      if (match[2]) result.push({ type: "text", text: match[2], marks: [{ type: "link", attrs: { href: match[3] } }] });
      else if (match[4]) result.push({ type: "text", text: match[4], marks: [{ type: "bold" }] });
      else if (match[5]) result.push({ type: "text", text: match[5], marks: [{ type: "italic" }] });
      else if (match[6]) result.push({ type: "text", text: match[6], marks: [{ type: "code" }] });
      position = start + match[0].length;
    }
    if (position < value.length) result.push({ type: "text", text: value.slice(position) });
    return result;
  }
  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (!line.trim()) { index++; continue; }
    if (/^```/.test(line)) {
      const block: string[] = []; index++;
      while (index < lines.length && !/^```/.test(lines[index])) block.push(lines[index++]);
      if (index < lines.length) index++;
      content.push({ type: "codeBlock", content: [{ type: "text", text: block.join("\n") }] });
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) { content.push({ type: "heading", attrs: { level: String(heading[1].length) }, content: inline(heading[2]) }); index++; continue; }
    const list = /^(\s*)([-*]|\d+\.)\s+(.+)$/.exec(line);
    if (list) {
      const kind = /^\d/.test(list[2]) ? "orderedList" : "bulletList";
      const items: ContentNode[] = [];
      while (index < lines.length) {
        const item = /^(\s*)([-*]|\d+\.)\s+(.+)$/.exec(lines[index]);
        if (!item || (/^\d/.test(item[2]) ? "orderedList" : "bulletList") !== kind) break;
        items.push({ type: "listItem", content: [{ type: "paragraph", content: inline(item[3]) }] }); index++;
      }
      content.push({ type: kind, content: items });
      continue;
    }
    if (/^>\s?/.test(line)) { content.push({ type: "blockquote", content: [{ type: "paragraph", content: inline(line.replace(/^>\s?/, "")) }] }); index++; continue; }
    const paragraph: string[] = [line]; index++;
    while (index < lines.length && lines[index].trim() && !/^(#{1,3}\s|```|>\s?|\s*[-*]\s|\s*\d+\.\s)/.test(lines[index])) paragraph.push(lines[index++]);
    content.push({ type: "paragraph", content: inline(paragraph.join(" ")) });
  }
  return { title: title.slice(0, 180), contentJson: { type: "doc", content } };
}
