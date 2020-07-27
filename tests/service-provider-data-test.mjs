import test from "ava";
import { Service, StandaloneServiceProvider } from "@kronos-integration/service";
import { data } from "./fixtures/data.mjs";


class HttpService extends Service {
  static get name() {
    return "http";
  }
}

class ServiceLDAP extends Service {
}


test("service provider declare services", async t => {
  const sp = new StandaloneServiceProvider();

  /*
  sp.registerServiceFactory(HttpService);
  sp.registerServiceFactory(ServiceLDAP);
*/
  const s = await sp.declareServices(data, { waitForFactories: false });

  //t.is(s.length, 5);
  t.is(Object.values(sp.services).length, 3);
});
