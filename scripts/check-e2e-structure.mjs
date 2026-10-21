import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const errors = [];
const requirements = new Set();
let cases = 0;

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

for (const document of walk(path.join(root, "tests-prd")).filter((file) =>
  file.endsWith(".md"),
)) {
  const relative = path.relative(path.join(root, "tests-prd"), document);
  const numbers = [
    ...readFileSync(document, "utf8").matchAll(/^(\d+)\.\s+/gm),
  ].map((match) => Number(match[1]));
  if (
    !numbers.length ||
    numbers.length > 10 ||
    numbers.some((number, index) => number !== index + 1)
  ) {
    errors.push(
      `${relative}: requirements must be sequential and contain 1–10 entries`,
    );
  }
  for (const number of numbers) {
    requirements.add(
      path.join(
        relative.slice(0, -3),
        `${String(number).padStart(2, "0")}.e2e.spec.ts`,
      ),
    );
  }
}

const files = walk(path.join(root, "tests"));
for (const file of files.filter((file) => file.endsWith(".e2e.spec.ts"))) {
  const relative = path.relative(path.join(root, "tests"), file);
  if (!requirements.delete(relative))
    errors.push(`${relative}: no matching PRD requirement`);
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const isTest = (node) =>
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "test";
  const topLevel = source.statements.filter(
    (node) => ts.isExpressionStatement(node) && isTest(node.expression),
  );
  let declarations = 0;
  const visit = (node) => {
    if (isTest(node)) declarations += 1;
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (topLevel.length !== 1 || declarations !== 1)
    errors.push(`${relative}: expected one top-level test declaration`);
  cases += declarations;
}
for (const missing of requirements)
  errors.push(`${missing}: PRD requirement has no test`);

const resourceDirectories = new Set();
for (const file of files) {
  let directory = path.dirname(file);
  while (directory !== path.join(root, "tests")) {
    if (
      path
        .relative(root, directory)
        .split(path.sep)
        .some((part) => /^__(fixture|util|mock|constant)__$/.test(part))
    )
      resourceDirectories.add(directory);
    directory = path.dirname(directory);
  }
}
for (const directory of resourceDirectories) {
  if (!files.includes(path.join(directory, "index.ts")))
    errors.push(`${path.relative(root, directory)}: missing resource barrel`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `PRD ↔ E2E structure valid: ${cases} cases, one test per file, all resource barrels present.`,
  );
}
