import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";

export const runTextStreamCheck = (scenario: "complete" | "cancel" | "incomplete") => promisify(execFile)(process.execPath, [resolve("tests/06. AI 영어/13. 순차 응답/__util__/server-check.mjs"), scenario], { timeout: 25_000, windowsHide: true });
