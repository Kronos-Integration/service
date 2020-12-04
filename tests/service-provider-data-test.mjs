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

  instantiateInterceptor(def) {
    console.log(def);
    const interceptor = super.instantiateInterceptor(def);
    if (interceptor) {
      return interceptor;
    }
    return new Interceptor(def);
  }
}

test("service provider declare services", async t => {
  const sp = new StandaloneServiceProvider({}, new MyInitializationContext());

  await sp.declareServices(data);

  t.is(Object.values(sp.services).length, 10);

  t.is(sp.services.logger.name, "logger");
  t.is(sp.services.logger.type, "logger");
  t.is(sp.services.logger.logLevel, "error");
  t.is(sp.services.logger.state, "stopped");

  t.is(sp.services.logger.endpoints.log.name, "log");
  t.is(sp.services.logger.endpoints.log.isIn, true);
  t.is(sp.services.logger.endpoints.log.isOut, true);
  t.is(sp.services.logger.endpoints.log.isOpen, true);
  t.is(sp.services.logger.endpoints.log.hasConnections, true);

  t.is(sp.services.logger.endpoints.config.name, "config");
  t.is(sp.services.logger.endpoints.config.isIn, true);
  t.is(sp.services.logger.endpoints.config.isOut, false);
  t.is(sp.services.logger.endpoints.config.isOpen, true);
  t.is(sp.services.logger.endpoints.config.hasConnections, false);

  const ep = sp.services.http.endpoints["/entitlement"];

  t.is(ep.name, "/entitlement");
  /*
  t.is(ep.type, "GET");
  t.is(ep.method, "GET");
  */

  /*
 t.is(ep.interceptors.length, 3);

  const i0 = ep.interceptors[0];
  t.is(i0.type, "ctx-jwt-verify");
*/
});
