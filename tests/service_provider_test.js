/* global describe, it, xit, before, beforeEach, after, afterEach */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  endpoint = require('kronos-endpoint'),
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
    Object.assign(this, config);
    return this.restartIfRunning();
  }
}

describe('service provider', () => {
  const sp = new ServiceProvider([{
    name: 'a'
  }, {
    name: 'test',
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
    it('service provider service', () => assert.equal(sp.services.a.name, 'a'));
  });

  describe('without initial config', () => {
    const sp = new ServiceProvider();
    it('present', () => assert.equal(sp.services.config.name, 'config'));
  });

  describe('logging', () => {
    // TODO wait until logger service has fullfilled
    sp.info(`logging`);
  });

  describe('command endpoint', () => {
    const testEndpoint = new endpoint.SendEndpoint('test');
    testEndpoint.connected = sp.endpoints.command;

    describe('info', () => {
      it('has response ', () =>
        testEndpoint.receive({
          data: {
            action: "list"
          }
        }).then(r => {
          assert.deepEqual(r.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0), [{
            "endpoints": {
              "command": {
                "in": true
              },
              "log": {
                "out": true,
                "target": "logger:log"
              }
            },
            "name": "a",
            "type": "service"
          }, {
            "endpoints": {
              "config": {
                "in": true
              }
            },
            "name": "config",
            "type": "config"
          }, {
            "endpoints": {
              "log": {
                "in": true
              }
            },
            "name": "logger",
            "type": "logger"
          }, {
            "endpoints": {},
            "name": "s2",
            "type": "test"
          }, {
            "endpoints": {},
            "name": "t2",
            "type": "test"
          }, {
            "endpoints": {},
            "name": "test",
            "type": "test"
          }]);
        })
      );
    });
    describe('get', () => {
      it('has response ', () =>
        testEndpoint.receive({
          data: {
            action: "get",
            service: "logger",
            options: {
              includeRuntimeInfo: true,
              includeDefaults: true
            }
          }
        }).then(r => {
          assert.deepEqual(r, {
            "endpoints": {
              "config": {
                "in": true
              },
              "log": {
                "in": true
              }
            },
            "logLevel": "info",
            "state": "running",
            "name": "logger",
            "type": "logger"
          });
        })
      );
    });

    describe('start', () => {
      it('is running', () =>
        testEndpoint.receive({
          data: {
            action: "start",
            service: "logger"
          }
        }).then(r => {
          assert.equal(r.state, 'running');
        })
      );
    });
    describe('stop', () => {
      it('is stopped', () =>
        testEndpoint.receive({
          data: {
            action: "stop",
            service: "logger"
          }
        }).then(r => {
          assert.equal(r.state, 'stopped');
        })
      );
    });

    describe('restart', () => {
      it('is running', () =>
        testEndpoint.receive({
          data: {
            action: "restart",
            service: "logger"
          }
        }).then(r => {
          assert.equal(r.state, 'running');
        })
      );
    });

    describe('unknown command', () => {
      it('rejects', () =>
        testEndpoint.receive({
          data: {
            action: "unknown",
            service: "logger"
          }
        }).then(r => {
          assert.equal(r.state, 'xxrunning');
        }, e => {
          assert.ok(true);
        })
      );
    });
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
    describe('with type', () => {
      setTimeout(() =>
        sp.registerServiceFactory(ServiceTest), 50);

      // force pending promises
      sp.declareService({
        name: 's2',
        type: 'test'
      }, true);
      sp.declareService({
        name: 's2',
        type: 'test'
      }, true);
      it('can be declared', () =>
        sp.declareService({
          name: 's2',
          type: 'test',
          key: 1
        }, true).then(
          s => {
            assert.equal(s.name, "s2");
          }
        )
      );

      it('can be declared again', () =>
        sp.declareService({
          name: 's2',
          type: 'test',
          key: 2
        }, true).then(
          s => {
            assert.equal(s.name, "s2");
            assert.equal(s.key, 2);
          }
        )
      );
    });

    describe('without type', () => {
      const sp = new ServiceProvider([{}, {
        name: 'test',
        value: 77
      }]);

      sp.declareService({
        name: 'test'
      }, true);

      setTimeout(() =>
        sp.registerServiceFactory(ServiceTest), 50);

      it('can be declared', () =>
        sp.declareService({
          name: 'test'
        }, true).then(
          s => {
            assert.equal(s.name, "test");
            //assert.equal(s.value, 77);
          }
        )
      );
    });
  });
});
