import { Account } from "@/src/1-page/account";

export default async function Page({ searchParams }: PageProps<"/verify-email">) {
  const { token } = await searchParams;
  return <Account mode="verify" token={typeof token === "string" ? token : undefined} />;
}
