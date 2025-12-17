import test from "ava";
import { TestLogger } from "./helpers/test-logger.mjs";
import { SendEndpoint, ReceiveEndpoint } from "@kronos-integration/endpoint";
import {
  Service,
  ServiceProviderMixin,
  InitializationContext
} from "@kronos-integration/service";

class Owner extends ServiceProviderMixin(Service, TestLogger) {
  get name() {
    return "__owner__";
  }

  get myProperty() {
    return 77;
  }

  async myMethod() {
    return 78;
  }
}

const o = new Owner();
const ic = new InitializationContext(o);

o.addEndpoint(new SendEndpoint("s1"));
o.addEndpoint(new ReceiveEndpoint("r1"));
const s1 = new Service({ name: "s1" }, ic, "s1");
o.registerService(s1);

function eet(t, model, expression, from, name) {
  const ep = model.endpointForExpression(expression, from);
  if (name) {
    t.is(ep.name, name);
  } else {
    t.falsy(ep);
  }
}

eet.title = (providedTitle = "", model, expression) =>
  `endpointForExpression ${providedTitle} ${expression}`.trim();

test(eet, o, undefined, undefined, undefined);
test(eet, o, "", undefined, undefined);
test(eet, o, "something", undefined, undefined);
test(eet, o, "service(something).something", undefined, undefined);

test(eet, o, "self", new SendEndpoint("sx"), "sx");
test(eet, o, new SendEndpoint("e"), undefined, "e");
test(eet, o, "s1", undefined, "s1");
test(eet, o, "r1", undefined, "r1");
test(eet, o, "config", undefined, "config");
test(eet, o, "service(logger).log", undefined, "log");
test(eet, o, "service(logger).log[TC]", undefined, "log");
test(eet, o, "service(s1).log", undefined, "log");
test(eet, s1, "log", undefined, "log");
test(eet, s1, "service(config).log", undefined, "log");
test(eet, s1, "service().log", undefined, "log");

test("outEndpoints", t => {
  const o = new Owner();

  t.truthy(o.endpoints.log.send);

  t.deepEqual(o.outEndpoints, [o.endpoints.log]);
});

test("inEndpoints", t => {
  const o = new Owner();
  t.deepEqual(
    o.inEndpoints.map(e => e.name),
    ["config", "info"]
  );
});

test("endpointFromConfig simple connected", t => {
  const o = new Owner();
  const ic = new InitializationContext(o);

  const r1 = new ReceiveEndpoint("r1");
  o.addEndpoint(r1);

  const e = o.createEndpointFromConfig("e", { connected: "r1" }, ic);

  t.is(e.name, "e");
  t.true(e.isConnected(r1));
});

test("endpointFromConfig multiple connected", t => {
  const o = new Owner();
  const ic = new InitializationContext(o);

  const r1 = new ReceiveEndpoint("r1");
  o.addEndpoint(r1);
  const r2 = new ReceiveEndpoint("r2");
  o.addEndpoint(r2);

  const e = o.createEndpointFromConfig("e", { connected: ["r1", "r2"] }, ic);

  t.is(e.name, "e");
  t.true(e.isConnected(r1));
  t.true(e.isConnected(r2));
});

test("endpointFromConfig request multi", t => {
  const o = new Owner();
  const ic = new InitializationContext(o);

  const r1 = new ReceiveEndpoint("r1");
  o.addEndpoint(r1);
  const r2 = new ReceiveEndpoint("r2");
  o.addEndpoint(r2);

  // request multi
  const e = o.createEndpointFromConfig("e", { multi: true }, ic);

  t.is(e.name, "e");

  // connect later
  e.addConnection(r1);
  e.addConnection(r2);

  t.true(e.isConnected(r1));
  t.true(e.isConnected(r2));
});

test("endpointFromConfig foreign connected", t => {
  const o = new Owner();
  const ic = new InitializationContext(o);

  const e = o.createEndpointFromConfig(
    "e",
    { connected: "service(logger).log" },
    ic
  );

  t.is(e.name, "e");
  t.true(e.isConnected(o.services.logger.endpoints.log));
});

test("endpointFromConfig foreign connected expression only", t => {
  const o = new Owner();
  const ic = new InitializationContext(o);

  const e = o.createEndpointFromConfig("e", "service(logger).log[T]", ic);

  t.true(e.isConnected(o.services.logger.endpoints.log));

  t.is(e.name, "e");
  t.true(e.isConnected(o.services.logger.endpoints.log));
});

test("endpointFromConfig real connected", t => {
  const dummyLogReceiver = new ReceiveEndpoint("log", {});

  dummyLogReceiver.receive = entry => {
    console.log(safeStringify(entry));
  };

  const o = new Owner();
  const ic = new InitializationContext(o);

  const e = o.createEndpointFromConfig(
    "e",
    { connected: dummyLogReceiver },
    ic
  );

  t.is(e.name, "e");
  t.true(e.isConnected(dummyLogReceiver));
});

test("endpointFromConfig receive property", async t => {
  const o = new Owner();
  const ic = new InitializationContext(o);

  const e = o.createEndpointFromConfig("e", { receive: "myProperty" }, ic);

  t.is(await e.receive(), 77);
});

test("endpointFromConfig receive method", async t => {
  const o = new Owner();
  const ic = new InitializationContext(o);
  const e = o.createEndpointFromConfig("e", { receive: "myMethod" }, ic);

  t.is(await e.receive(), 78);
});
