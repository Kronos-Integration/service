/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  endpoint = require('kronos-endpoint'),
  Service = require('../lib/Service'),
  ServiceProviderMixin = require('../lib/ServiceProviderMixin'),
  ServiceConfig = require('../lib/ServiceConfig'),
  ServiceLogger = require('../lib/ServiceLogger');

class _ServiceProvider {}
class ServiceProvider extends ServiceProviderMixin(_ServiceProvider) {}

class ServiceTest extends Service {
  static get name() {
    return "test";
  }
  get type() {
    return ServiceTest.name;
  }

  reconfigure(config) {
    console.log(`${config}`);
    return Promise.resolve(`${this.name} reconfigured`);
  }
}

describe('service provider', () => {
  const sp = new ServiceProvider();
  const serviceConfig = sp.addService(new ServiceConfig({}, sp));
  sp.addService(new ServiceLogger({}));
  sp.addService(new ServiceTest({}));

  describe('initial setup', () => {
    it('config service', () => assert.equal(sp.services.config, 'config'));
    it('logger service', () => assert.equal(sp.services.logger, 'logger'));
  });

  sp.services.config.endpoints.config.receive({
    "test": {
      key1: 1,
      key2: "2"
    }
  }).then(r => {
    console.log(`configured: ${r}`);
  }).
  catch(e => {
    console.log(e);
  });

});
