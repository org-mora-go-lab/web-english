import { notFound } from "next/navigation";

import Watch from "@/src/1-page/watch";
import { LoginInvitation } from "@/src/3-feature";
import { lessons, songs } from "@/src/4-entity";
import { getActor } from "@/src/4-entity/account";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/watch/[id]">) {
  const { id } = await params;
  const lesson = [...lessons, ...songs].find(item => item.id === id);
  return { title: lesson ? `${lesson.title} · Mora English` : "영상을 찾을 수 없어요 · Mora English" };
}

export default async function Page({ params }: PageProps<"/watch/[id]">) {
  const { id } = await params;
  if (!await getActor()) return <LoginInvitation returnTo={`/watch/${encodeURIComponent(id)}`} />;
  const lesson = [...lessons, ...songs].find(item => item.id === id);
  if (!lesson) notFound();
  return <Watch lesson={lesson} />;
}
