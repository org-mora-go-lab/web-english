export type AccountProps = {
  mode: "signup" | "login" | "verify" | "forgot" | "reset";
  token?: string;
  returnTo?: string;
};
