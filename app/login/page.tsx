import { Account } from "@/src/1-page/account";
import { kakaoEnabled } from "@/src/4-entity/account";

export default async function Page({ searchParams }: PageProps<"/login">) {
  const { callbackUrl } = await searchParams;
  return <Account mode="login" kakaoEnabled={kakaoEnabled} returnTo={typeof callbackUrl === "string" ? callbackUrl : "/studio"} />;
}
