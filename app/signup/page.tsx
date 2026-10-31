import { Account } from "@/src/1-page/account";
import { kakaoEnabled } from "@/src/4-entity/account";

export default function Page() { return <Account mode="signup" kakaoEnabled={kakaoEnabled} />; }
