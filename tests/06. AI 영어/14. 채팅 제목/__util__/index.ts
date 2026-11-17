import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";

export const checkChatTitles = (scenario: "text" | "voice") => promisify(execFile)(process.execPath, [resolve("tests/06. AI 영어/14. 채팅 제목/__util__/server-check.mjs"), scenario], { timeout: 25_000, windowsHide: true });
