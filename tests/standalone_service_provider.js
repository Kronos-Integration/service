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

sp.registerServiceFactory(ServiceTest);

sp.declareService({
  name: 's1',
  type: 'test'
}, true).then(
  s => {
    console.log(`declare: ${s}`);
  }, r =>
  console.log
).catch(console.log);

setTimeout(() => {
  console.log('done');
}, 1000);
