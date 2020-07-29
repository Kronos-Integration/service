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

  get waitForFactories() {
    return false;
  }

  connectEndpoint(endpoint, connected) {
    try {
      super.connectEndpoint(endpoint, connected);
    } catch (e) {}
  }
}

test("service provider declare services", async t => {
  const sp = new StandaloneServiceProvider({}, new MyInitializationContext());

  await sp.declareServices(data);

  t.is(Object.values(sp.services).length, 11);
});
