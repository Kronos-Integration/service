/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  Service = require('../lib/Service'),
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
    Object.assign(this, config);
    return this.restartIfRunning();
  }
}

describe('service provider', () => {
  const sp = new ServiceProvider();
  const serviceConfig = sp.registerService(new ServiceConfig({}, sp));
  sp.registerService(new ServiceLogger({}));
  sp.registerService(new ServiceTest({}));

  describe('initial setup', () => {
    it('config service', () => assert.equal(sp.services.config.name, 'config'));
    it('logger service', () => assert.equal(sp.services.logger.name, 'logger'));
  });

  describe('change', () => {
    it('change', done => {
      sp.services.config.endpoints.config.receive({
        "config": {},
        "test": {
          key1: 4711,
          key2: "2"
        }
      }).then(r => {
        assert.equal(sp.services.test.key1, 4711);
        done();
      }).
      catch(e => {
        console.log(e);
      });
    });
  });
});
