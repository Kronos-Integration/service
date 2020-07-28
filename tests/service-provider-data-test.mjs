import test from "ava";
import {
  Service,
  StandaloneServiceProvider,
  InitializationContext
} from "@kronos-integration/service";

import { data } from "./fixtures/data.mjs";

class MyInitializationContext extends InitializationContext {
  async getServiceFactory(type) {
    const f = await super.getServiceFactory(type);

    if (!f) {
      return Service;
    }
  }

  connectEndpoint(endpoint, connected) {
    try {
      super.connectEndpoint(endpoint, connected);
    } catch (e) {}
  }
}

test("service provider declare services", async t => {
  const sp = new StandaloneServiceProvider(
    {},
    new MyInitializationContext(undefined, { waitForFactories: false })
  );

  const s = await sp.declareServices(data);

  //t.is(s.length, 5);
  t.is(Object.values(sp.services).length, 11);
});
