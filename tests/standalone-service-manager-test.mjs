import test from "ava";
import { Service, StandaloneServiceManager } from "../src/module.mjs";

class ServiceTest extends Service {
  static get name() {
    return "test";
  }

  constructor(config, owner) {
    super(config, owner);
  }
  configure(config) {
    delete config.name;
    Object.assign(this, config);
    return this.restartIfRunning();
  }
}

test("declareService", async t => {
  const sp = new StandaloneServiceManager();
  sp.registerServiceFactory(ServiceTest);

  for (const n of ["s1", "s2", "s3", "s4", "s5"]) {
    const s = await sp.declareService(
      {
        name: n,
        type: "test"
      },
      true
    );

    // .then(s => console.log(`declare: ${s}`), r => console.log)
  }

  t.is(sp.services.s1.name, "s1");
});

/*
setTimeout(() => sp.registerServiceFactory(ServiceTest), 2000);
setTimeout(() => console.log('done'), 5000);
*/
