import { Account } from "@/src/1-page/account";

export default async function Page({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  return <Account mode="reset" token={typeof token === "string" ? token : undefined} />;
}
