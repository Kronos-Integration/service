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

  instantiateInterceptor(def) {
    const interceptor = super.instantiateInterceptor(def);
    if (interceptor) {
      return interceptor;
    }
    return new Interceptor(def);
  }
}

test("service provider declare services", async t => {
  const sp = new StandaloneServiceProvider({}, new MyInitializationContext());

  sp.version = "1.2.3";

  await sp.declareServices(data);

  t.is(sp.info().version,"1.2.3");
  
  t.is(Object.values(sp.services).length, 12);

  t.is(sp.services.logger.name, "logger");
  t.is(sp.services.logger.type, "logger");
  t.is(sp.services.logger.logLevel, "info");
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

  t.is(sp.services.http.type, "service");

  const ep = sp.services.http.endpoints["/authenticate"];

  t.is(ep.name, "/authenticate");

  const ep2 = sp.services.admin.endpoints.services;
  const ep3 = sp.services.http.endpoints["/admin/services"];

  t.is(ep2.name, "services");
  t.is(ep3.name, "/admin/services");

  t.true(ep2.isConnected(ep3));

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
