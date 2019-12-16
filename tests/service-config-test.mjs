import test from "ava";
import { StandaloneServiceProvider } from "../src/module.mjs";

test("configFor", async t => {
  const sp = new StandaloneServiceProvider();

  const sc = sp.services.config;

  t.is(sc.configFor("not-present"), undefined);

  await sc.configure({
    s1: {
      key1: "value1"
    }
  });

  t.deepEqual(sc.configFor("s1"), {
    key1: "value1"
  });

  sc.clear("s1");

  t.is(sc.configFor("s1"), undefined);
});
