import test from "ava";
import { merge } from "../src/service-config.mjs";

function mt(t, a, b, expected) {
  const result = merge(a, b)
  t.deepEqual(result, expected);
}

mt.title = (providedTitle = "merge", a, b, expected) =>
  `${providedTitle} ${JSON.stringify(a)} ${JSON.stringify(b)}`.trim();

test(mt, 1, 1, 1);
test(mt, { a: 1 }, { b: 2 }, { a: 1, b: 2 });
test(
  mt,
  { a: Buffer.from("a") },
  { a: Buffer.from("bb") },
  { a: Buffer.from("bb") }
);
