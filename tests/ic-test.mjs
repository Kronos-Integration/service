import test from "ava";
import { TestService } from "./util.mjs";

import { InitializationContext } from "../src/initialization-context.mjs";
import StandaloneServiceProvider from "../src/standalone-service-provider.mjs";

function icet(t, sp, expression, ep, result) {
  const ic = new InitializationContext(sp);
  t.is(ic.endpointForExpression(expression, ep), result);
}

icet.title = (providedTitle = "", sp, expression, ep, result) =>
  `service ${providedTitle} ${expression} (${ep.name})`.trim();

const sp = new StandaloneServiceProvider();

test(icet, sp, "self", sp.endpoints.log, sp.endpoints.log);
test(icet, sp, "log", sp.endpoints.log, sp.endpoints.log);
test(icet, sp, "log", sp.endpoints.config, sp.endpoints.log);

test("service factory", async t => {
  const sp = new StandaloneServiceProvider();
  const ic = new InitializationContext(sp, { waitForFactories: false });

  t.is(await ic.getServiceFactory("test"), undefined);
  t.is(await ic.getServiceFactory(TestService), TestService);
});
