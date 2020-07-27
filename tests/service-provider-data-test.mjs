import test from "ava";
import {  makeServices } from "./helpers/util.mjs";
import { data } from "./fixtures/data.mjs";
 
test("service provider declare services", async t => {
  const sp = await makeServices({ waitForFactories: false});
  const s = await sp.declareServices(data);

  t.is(s.length,5);
 // t.is(Object.values(s.services).length, 5);
});
