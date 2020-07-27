import test from "ava";

import { ServiceProvider, TestService, makeServices } from "./helpers/util.mjs";
import { InitializationContext } from "@kronos-integration/service";

import { data } from "./fixtures/data.mjs";
 
test("service provider declare services", async t => {
  const sp = await makeServices();

  const s = await sp.declareServices(data, false);

  t.is(Object.values(s.services).length, 5);
});
