import Image from "next/image";

import type { AccountIdentityProps } from "./type";

export function AccountIdentity({ displayName, profileImageUrl, compact = false }: AccountIdentityProps) {
  return <span className="inline-flex min-w-0 items-center gap-2" aria-label={`로그인 사용자 ${displayName}`}>
    {profileImageUrl ? <Image unoptimized src={profileImageUrl} alt="" width={compact ? 32 : 44} height={compact ? 32 : 44} className={`${compact ? "h-8 w-8" : "h-11 w-11"} rounded-full object-cover`} /> : <span aria-hidden="true" className={`${compact ? "h-8 w-8 text-sm" : "h-11 w-11 text-lg"} grid shrink-0 place-items-center rounded-full bg-orange-100 font-bold text-orange-700`}>{displayName.slice(0, 1)}</span>}
    <span className="account-identity-name truncate font-semibold">{displayName}</span>
  </span>;
}
