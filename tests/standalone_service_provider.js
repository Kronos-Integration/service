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
    console.log(`constructor`);
  }
  configure(config) {
    delete config.name;
    this.trace(config);
    Object.assign(this, config);
    return this.restartIfRunning();
  }
}

const sp = new ServiceProvider();

sp.registerService(new ServiceTest({}, sp));

sp.declareService({
  name: 's2',
  type: 'test'
}, true).then(
  s => {
    console.log(`declare: ${s}`);
  }, r =>
  console.log
).catch(console.log);

sp.declareService({
  name: 's2',
  type: 'test'
}, true).then(
  s => {
    console.log(`declare 2: ${s}`);
  }, r => console.log
).catch(console.log);

setTimeout(() => {
  console.log('done');
}, 1000);
