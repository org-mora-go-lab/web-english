import type { ContentDocument } from "@/src/4-entity/post";

export type LearnProps = { post: { id: string; slug: string; title: string; contentJson: ContentDocument }; signedIn: boolean; initialStatus: "started" | "completed" | null };
