export type StudioProps = { displayName: string; posts: { id: string; slug: string; title: string; status: "draft" | "published"; visibility: "public" | "private"; updatedAt: number }[] };
