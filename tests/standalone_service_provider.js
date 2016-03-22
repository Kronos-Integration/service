/* jslint node: true, esnext: true */

"use strict";

const Service = require('../lib/Service'),
  ServiceConfig = require('../lib/ServiceConfig'),
  ServiceLogger = require('../lib/ServiceLogger'),
  ServiceProviderMixin = require('../lib/ServiceProviderMixin');

class ServiceProvider extends ServiceProviderMixin(Service) {}

class ServiceTest extends Service {
  static get name() {
    return "test";
  }
  get type() {
    return ServiceTest.name;
  }

  get autostart() {
    return true;
  }

  configure(config) {
    delete config.name;
    this.trace(config);
    Object.assign(this, config);
    return this.restartIfRunning();
  }
}

const sp = new ServiceProvider([{
  name: "a"
}, {
  name: "test",
  key3: 3
}]);

sp.declareService({
  name: 's2',
  type: 'test',
  key: 1
}, true).then(
  s => {
    console.log(`declare: ${s}`);
  }, r =>
  console.log
).catch(console.log);

sp.declareService({
  name: 's2',
  type: 'test',
  key: 2
}, true).then(
  s => {
    console.log(`declare 2: ${s}`);
  }, r => console.log
).catch(console.log);
