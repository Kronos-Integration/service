import test from "ava";
import { TestService, TestServiceWithoutAdditionalEndpoints } from "./util.mjs";

import { SendEndpoint } from "@kronos-integration/endpoint";
import Service from "../src/service.mjs";

const owner = {
  emit(name, arg1, arg2) {}, // dummy event emitter
  services: {},

  getService(name) {
    console.log("GET SERVICE", name, this.services[name]);
    return this.services[name];
  },
  endpointIdentifier(e) {
    return `name:${e.name}`;
  }
};
owner.services.logger = new Service({}, owner);

owner.services.logger.endpoints.log.receive = entry => console.log(entry);

function st(t, factory, expected = {}) {
  expected = {
    timeout: { start: 5 },
    autostart: false,
    endpoints: {
      log: { isConnected: true },
      ...expected.entpoints
    },

    options: {
      key3: "value3",
      key4: 4
    },
    configuration: {},
    ...expected
  };

  const s1 = new factory(expected.options, owner);

  t.is(s1.owner, owner, "owner");

  t.is(s1.type, factory.name, "name", "type");

  t.is(s1.state, "stopped");
  t.is(s1.autostart, expected.autostart);
  t.is(s1.logLevel, "info");
  t.is(s1.timeout.start, expected.timeout.start);

  for (const [name, e] of Object.entries(expected.endpoints)) {
    t.truthy(s1.endpoints[name], `${name} endpoint`);
    t.is(s1.endpoints[name].name, name, `${name} endpoint`);
    if (e.isConnected !== undefined) {
      t.is(
        s1.endpoints[name].isConnected,
        e.isConnected,
        `${name} endpoint connected`
      );
    }
  }

  for (const [name, c] of Object.entries(expected.configuration)) {
    t.truthy(s1.configurationAttributes[name], `${name} configuration`);
    t.is(s1.configurationAttributes[name].name, name);
    if (c.value !== undefined) {
      t.is(s1[name], c.value, `${name} value`);
    }
  }

  if (expected.description !== undefined) {
    t.is(s1.description, expected.description, "service description");
  }

  if (expected.name !== undefined) {
    t.is(s1.name, expected.name, "service name");
  }

  if (expected.json !== undefined) {
    t.deepEqual(s1.toJSON(), expected.json);
  }

  t.is(s1.toString(), `${s1.name}: stopped`);
}

st.title = (providedTitle = "", factory, b) =>
  `service ${providedTitle} ${factory.name} ${b}`.trim();

test(st, Service, {
  name: "service",
  options: {
    key1: "value1",
    key2: 2
  }
});

test("given name", st, Service, {
  name: "myName",
  options: {
    name: "myName"
  },
  json: {
    name: "myName",
    type: "service"
  }
});

test("with endpoints", st, Service, {
  endpoints: { ep1: { isConnected: false } },

  options: {
    endpoints: {
      ep1: { in: true }
    }
  },
  json: {
    name: "service",
    type: "service",
    endpoints: {
      ep1: { in: true }
    }
  }
});

test(st, TestService, {
  description: "my description",
  autostart: true,
  endpoints: { testIn: { isConnected: false } },
  configuration: {
    key3: {},
    key4: { value: 4 }
  }
});

test(st, TestServiceWithoutAdditionalEndpoints);

test("service create with logLevel", t => {
  const s1 = new Service(
    {
      key1: "value1",
      logLevel: "trace"
    },
    owner
  );

  t.is(s1.logLevel, "trace");

  s1.error("some error");
  s1.error({
    key1: "value1"
  });

  const s2 = new Service(
    {
      key1: "value1",
      logLevel: "na sowas"
    },
    owner
  );

  t.is(s2.logLevel, "info");
});

test.only("service create with DEBUG=1", t => {
  process.env.DEBUG = 1;

  const s1 = new Service(
    {
      key1: "value1"
    },
    owner
  );

  t.is(s1.logLevel, "debug");

  const s2 = new Service(
    {
      key1: "value1",
      logLevel: "warn"
    },
    owner
  );

  t.is(s2.logLevel, "debug");

  delete process.env.DEBUG;
});

test("service create with LOGLEVEL=trace", t => {
  process.env.LOGLEVEL = "trace";

  const s1 = new Service(
    {
      key1: "value1"
    },
    owner
  );

  t.is(s1.logLevel, "trace");

  delete process.env.LOGLEVEL;
});

test("service derived configuration", async t => {
  const s1 = new TestService({
    key7: 1
  });

  const se = new SendEndpoint("se", {
    get name() {
      return "a";
    }
  });
  se.connected = s1.endpoints.config;

  await se.receive({
    logLevel: "trace",
    key2: 77
  });

  t.is(s1.logLevel, "trace");
  t.is(s1.key2, 77);

  t.is(s1.endpoints.testIn.name, "testIn");
});

test("service derived configuration change start timeout", async t => {
  const s1 = new TestService({
    key7: 1
  });

  await s1.configure({
    timeout: {
      start: 123.45
    }
  });

  t.is(s1.timeout.start, 123.45);
});

test("service states", async t => {
  const s1 = new TestService(
    {
      key1: "value1",
      key2: 2
    },
    owner
  );

  await s1.restartIfRunning();
  t.is(s1.state, "stopped");

  await s1.start();
  t.is(s1.state, "running");

  await s1.restartIfRunning();
  t.is(s1.state, "running");
  await s1.restart();
  t.is(s1.state, "running");

  const s2 = new TestService({
    key1: "value1",
    key2: 2
  });

  t.is(s2.state, "stopped");

  await s1.stop();
  t.is(s1.state, "stopped");
});
