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
    this.trace(config);
    Object.assign(this, config);
    return this.restartIfRunning();
  }
}

describe('service provider', () => {
  const sp = new ServiceProvider({});

  describe('initial setup', () => {
    it('config service', () => assert.equal(sp.services.config.name, 'config'));
    it('logger service', () => assert.equal(sp.services.logger.name, 'logger'));
  });

  describe('additional service', () => {
    sp.registerService(new ServiceTest({}));
    sp.registerService(new ServiceTest({
      name: "t2"
    }));

    it('test service', () => assert.equal(sp.services.test.name, 'test'));

    describe('configure service', () => {
      it('direct', () => sp.services.test.configure({
        key: "new value"
      }).then(() =>
        assert.equal(sp.services.test.key, "new value")
      ));

      it('send change request over config service', () =>
        sp.services.config.endpoints.config.receive({
          "config": {},
          "unknown": {},
          "test": {
            key1: 4711,
            key2: "2"
          }
        }).then(() =>
          assert.equal(sp.services.test.key1, 4711)
        )
      );
    });
  });
});
