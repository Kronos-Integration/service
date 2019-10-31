import test from "ava";
import { Service, StandaloneServiceManager } from "../src/module.mjs";

class ServiceTest extends Service {
  static get name() {
    return "test";
  }

  configure(config) {
    delete config.name;
    Object.assign(this, config);
    return this.restartIfRunning();
  }
}

test("declareService", async t => {
  const ssm = new StandaloneServiceManager();
  ssm.registerServiceFactory(ServiceTest);

  const s = await Promise.all(["s1", "s2", "s3", "s4", "s5"].map(
    name =>
    ssm.declareService(
        {
          name,
          type: "test"
        },
        true
      )
  ));

 // console.log(s.map(s => s.name));

  t.is(ssm.services.s1.name, "s1");
//  t.is(ssm.services.s3.name, "s3");
});

test("declareService delayed", async t => {
  const ssm = new StandaloneServiceManager();

  const declarations = Promise.all(["s1", "s2", "s3", "s4", "s5"].map(
    name =>
    ssm.declareService(
        {
          name,
          type: "test"
        },
        true
      )
  ));

  await ssm.registerServiceFactory(ServiceTest);

  await declarations;
  t.is(ssm.services.s1.name, "s1");
 // t.is(ssm.services.s3.name, "s3");
});


test("configure", async t => {
  const ssm = new StandaloneServiceManager();
  ssm.registerServiceFactory(ServiceTest);

  const s1 = await ssm.declareService(
    {
      name: "s1",
      type: "test"
    },
    true
  );

  await ssm.services.config.configure({
    s1: {
      value: "for s1"
    }
  });

  t.is(s1.value, "for s1");
});
