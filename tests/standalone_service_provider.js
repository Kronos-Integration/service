/* jslint node: true, esnext: true */

"use strict";

const Service = require('../lib/Service'),
  ServiceProviderMixin = require('../lib/ServiceProviderMixin');

class ServiceProvider extends ServiceProviderMixin(Service) {}

class ServiceTest extends Service {
  static get name() {
    return "test";
  }
  get type() {
    return ServiceTest.name;
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

const sp = new ServiceProvider();


for (const n of['s1', 's2', 's3', 's4', 's5']) {
  sp.declareService({
    name: n,
    type: 'test'
  }, true).then(
    s => {
      console.log(`declare: ${s}`);
    }, r =>
    console.log
  ).catch(console.log);
}

setTimeout(() => {
  sp.registerServiceFactory(ServiceTest);
}, 2000);

setTimeout(() => {
  console.log('done');
}, 5000);
