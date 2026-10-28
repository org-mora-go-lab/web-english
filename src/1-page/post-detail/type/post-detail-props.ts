import type { ContentDocument } from "@/src/4-entity/post";

export type PostDetailProps = { post: { id: string; slug: string; title: string; summary: string; authorName: string; category: string; tags: string[]; level: string; publishedAt: number | null; contentJson: ContentDocument; visibility: string } };
