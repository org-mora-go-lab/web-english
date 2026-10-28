import Image from "next/image";
import type { ReactNode } from "react";

import type { ContentNode } from "./content";
import type { PostContentProps } from "./type";

function renderNode(node: ContentNode, key: number): ReactNode {
  if (node.type === "text") {
    let value: ReactNode = node.text;
    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") value = <strong>{value}</strong>;
      if (mark.type === "italic") value = <em>{value}</em>;
      if (mark.type === "strike") value = <s>{value}</s>;
      if (mark.type === "code") value = <code>{value}</code>;
      if (mark.type === "link") value = <a href={mark.attrs?.href} rel="noopener noreferrer" target="_blank">{value}</a>;
    }
    return <span key={key}>{value}</span>;
  }
  const children = node.content?.map(renderNode);
  switch (node.type) {
    case "paragraph": return <p key={key}>{children}</p>;
    case "heading": return Number(node.attrs?.level) === 1 ? <h1 key={key}>{children}</h1> : Number(node.attrs?.level) === 3 ? <h3 key={key}>{children}</h3> : <h2 key={key}>{children}</h2>;
    case "bulletList": return <ul key={key}>{children}</ul>;
    case "orderedList": return <ol key={key}>{children}</ol>;
    case "listItem": return <li key={key}>{children}</li>;
    case "blockquote": return <blockquote key={key}>{children}</blockquote>;
    case "codeBlock": return <pre key={key}>{children}</pre>;
    case "horizontalRule": return <hr key={key} />;
    case "hardBreak": return <br key={key} />;
    case "image": return node.attrs?.src ? <Image key={key} unoptimized width={1200} height={800} src={node.attrs.src} alt={node.attrs.alt ?? ""} /> : null;
    case "vocabulary": return <aside key={key} className="learning-block"><strong>단어 · {node.attrs?.word}</strong><p>{node.attrs?.meaning}</p><p>{node.attrs?.example}</p></aside>;
    case "dialogue": return <aside key={key} className="learning-block"><strong>{node.attrs?.speaker}</strong><p>{node.attrs?.line}</p></aside>;
    case "quiz": return <aside key={key} className="learning-block"><strong>질문 · {node.attrs?.question}</strong><p>{node.attrs?.options}</p></aside>;
    default: return null;
  }
}

export function PostContent({ document }: PostContentProps) {
  return <article className="post-content">{document.content.map(renderNode)}</article>;
}
