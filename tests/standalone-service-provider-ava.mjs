import test from "ava";
import { TestServiceWithoutAdditionalEndpoints } from "./helpers/test-service-without-additional-configs.mjs";
import { TestService } from "./helpers/test-service.mjs";
import { TemplateInterceptor } from "@kronos-integration/interceptor";
import {
  StandaloneServiceProvider,
  ServiceLogger
} from "@kronos-integration/service";

test("basics", t => {
  const ssm = new StandaloneServiceProvider();
  t.true(ssm.isServiceProvider);
  t.true(ssm.autostart);
  t.true(ssm.toJSON().serviceProvider);
});

test("registerFactories", async t => {
  const ssm = new StandaloneServiceProvider();
  ssm.registerFactories([
    TestService,
    TestServiceWithoutAdditionalEndpoints,
    TemplateInterceptor
  ]);

  t.is(ssm.serviceFactories.logger, ServiceLogger);

  t.is(ssm.serviceFactories.test, TestService);
  t.is(
    ssm.serviceFactories["test-without-additional-endpoints"],
    TestServiceWithoutAdditionalEndpoints
  );

  t.is(ssm.interceptorFactories.template, TemplateInterceptor);
});

test("declareService", async t => {
  const ssm = new StandaloneServiceProvider();
  ssm.registerServiceFactory(TestService);

  const s = await Promise.all(
    ["s1", "s2", "s3", "s4", "s5"].map(name =>
      ssm.declareService(
        {
          name,
          type: "test"
        },
        true
      )
    )
  );

  t.is(ssm.services.s1.name, "s1");
});

test("declareService delayed", async t => {
  const ssm = new StandaloneServiceProvider();

  const declarations = Promise.all(
    ["s1", "s2", "s3", "s4", "s5"].map(name =>
      ssm.declareService(
        {
          name,
          type: "test"
        },
        true
      )
    )
  );

  await ssm.registerServiceFactory(TestService);

  await declarations;
  t.is(ssm.services.s1.name, "s1");
});

test.only("declareService delayed timeout", async t => {
  const ssm = new StandaloneServiceProvider();

  const declarations = Promise.all(
    ["s1", "s2", "s3", "s4", "s5"].map(name =>
      ssm.declareService(
        {
          name,
          type: "test"
        },
        true
      )
    )
  );

  try {
    await declarations;
    t.true(false);
  } catch (e) {
    t.is(e.message, "timeout waiting for service test");
  }
});

test.only("declareService from as module", async t => {
  const ssm = new StandaloneServiceProvider();

  const s = await Promise.all(
    ["s1", "s2", "s3", "s4", "s5"].map(name =>
      ssm.declareService(
        {
          name,
          type: new URL("./helpers/test-service.mjs", import.meta.url).pathname
        },
        true
      )
    )
  );

  t.is(ssm.services.s1.name, "s1");
});

test("configure", async t => {
  const ssm = new StandaloneServiceProvider();
  ssm.registerServiceFactory(TestService);

  const s1 = await ssm.declareService(
    {
      name: "s1",
      type: "test"
    },
    true
  );

  t.is(s1.type, "test");

  await ssm.services.config.configure({
    s1: {
      value: "for s1"
    }
  });

  t.is(s1.value, "for s1");
});
