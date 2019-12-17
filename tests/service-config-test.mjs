import test from "ava";
import { StandaloneServiceProvider } from "../src/module.mjs";
import { ServiceProvider } from "./util.mjs";

test("service provider without initial config", async t => {
  const sp = new ServiceProvider();

  await sp.start();

  t.is(sp.services.config.name, "config");
});

test("service provider config service", async t => {
  const sp = new ServiceProvider([
    {
      name: "a" // provider itself
    },
    {
      name: "test",
      key3: 3
    }
  ]);

  await sp.start();

  t.is(sp.services.config.name, "config");
  t.is(sp.services.config.state, "running");

  const sc = sp.services.config;

  t.deepEqual(sc.configFor("service1"), {
    key1: 1
  });

  t.deepEqual(sc.configFor("test"), {
    key3: 3
  });

  t.deepEqual(
    [...sp.services.config.preservedConfigs.keys()],
    ["service1", "test"]
  );

  t.deepEqual(sc.preservedConfigs.get("service1"), { key1: 1 });
  t.deepEqual(sc.preservedConfigs.get("test"), { key3: 3 });

  t.is(sp.services.logger.name, "logger");
  t.is(sp.services.logger.state, "running");

  t.is(sp.state, "running");

  t.is(sp.services.a.name, "a");
});

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
