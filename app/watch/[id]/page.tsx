import { notFound } from "next/navigation";

import Watch from "@/src/1-page/watch";
import { lessons } from "@/src/4-entity";

export function generateStaticParams() { return lessons.map(({ id }) => ({ id })); }

export async function generateMetadata({ params }: PageProps<"/watch/[id]">) {
  const { id } = await params;
  const lesson = lessons.find(item => item.id === id);
  return { title: lesson ? `${lesson.title} · Mora English` : "영상을 찾을 수 없어요 · Mora English" };
}

export default async function Page({ params }: PageProps<"/watch/[id]">) {
  const { id } = await params;
  const lesson = lessons.find(item => item.id === id);
  if (!lesson) notFound();
  return <Watch lesson={lesson} />;
}
