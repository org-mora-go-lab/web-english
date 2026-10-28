import { Account } from "@/src/1-page/account";

export default async function Page({ searchParams }: PageProps<"/login">) {
  const { callbackUrl } = await searchParams;
  return <Account mode="login" returnTo={typeof callbackUrl === "string" ? callbackUrl : "/studio"} />;
}
