import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";

export const runServerVoiceCheck = async (scenario: "observer" | "warm") => promisify(execFile)(process.execPath, [resolve("tests/06. AI 영어/06. 무중단 음성 전환/__util__/server-check.mjs"), scenario], { timeout: 30_000, windowsHide: true });
