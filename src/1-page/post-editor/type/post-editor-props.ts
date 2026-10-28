import type { ContentDocument } from "@/src/4-entity/post";

export type EditorPost = {
  id: string; slug: string; title: string; summary: string; contentJson: ContentDocument;
  level: "beginner" | "intermediate" | "advanced"; visibility: "public" | "private";
  category: string; tags: string[]; coverImageUrl: string | null;
  status: "draft" | "published"; version: number;
};

export type PostEditorProps = { initial?: EditorPost };
