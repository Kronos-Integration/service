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
    delete config.name;
    this.trace(config);
    //console.log(`${JSON.stringify(config)}`);
    Object.assign(this, config);
    return this.restartIfRunning();
  }
}

describe('service provider', () => {
  const sp = new ServiceProvider([{
    name: "a"
  }, {
    name: "test",
    key3: 3
  }]);

  describe('initial setup', () => {
    describe('config service', () => {
      it('present', () => assert.equal(sp.services.config.name, 'config'));
      it('preserved initial config', () => assert.deepEqual(Object.keys(sp.services.config.preservedConfigs), [
        'a', 'test'
      ]));
    });

    it('logger service', () => assert.equal(sp.services.logger.name, 'logger'));
    it('can be started', () => sp.start().then(() => assert.equal(sp.state, 'running')));
  });

  describe('without initial config', () => {
    const sp = new ServiceProvider();
    it('present', () => assert.equal(sp.services.config.name, 'config'));
  });

  describe('logging', () => {
    // TODO wait until logger service has fullfilled
    sp.info(`logging`);
  });

  describe('additional service', () => {
    sp.registerService(new ServiceTest({}, sp));
    sp.registerService(new ServiceTest({
      name: "t2"
    }, sp));

    it('test service', () => assert.equal(sp.services.test.name, 'test'));

    describe('configure service', () => {
      it('direct', () => sp.services.test.configure({
        key: "new value"
      }).then(() =>
        assert.equal(sp.services.test.key, "new value")
      ));

      it('send change request over config service', () =>
        sp.services.config.endpoints.config.receive([{
          name: 'config'
        }, {
          name: 'unknown'
        }, {
          name: 'test',
          key1: 4711,
          key2: "2"
        }]).then(() =>
          assert.equal(sp.services.test.key1, 4711)
        )
      );
    });

    it('can be unregistered', () =>
      sp.unregisterService('t2').then(s => assert.isUndefined(sp.services.t2))
    );
  });

  describe('declare service', () => {
    setTimeout(() =>
      sp.registerServiceFactory(ServiceTest), 200);

    sp.declareService({
      name: 's2',
      type: 'test',
      key: 1
    }, true).then(s => console.log(`XXX: ${s}`));

    xit('can be declared', () =>
      sp.declareService({
        name: 's2',
        type: 'test',
        key: 1
      }, true).then(
        s => {
          assert.equal(s.name, "s2");
          assert.equal(s.owner, sp);
        }
      )
    );

    xit('can be declared again', () =>
      sp.declareService({
        name: 's2',
        type: 'test',
        key: 2
      }, true).then(
        s => {
          assert.equal(s.name, "s2");
          assert.equal(s.owner, sp);
          assert.equal(s.key, 2);
        }
      )
    );
  });
});
