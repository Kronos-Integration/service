/* global xdescribe, describe, it, xit, before, beforeEach, after, afterEach */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  endpoint = require('kronos-endpoint'),
  Service = require('../dist/Service').Service,
  ServiceConfig = require('../lib/ServiceConfig'),
  ServiceLogger = require('../lib/ServiceLogger'),
  ServiceProviderMixin = require('../lib/ServiceProviderMixin');

class ServiceProvider extends ServiceProviderMixin(Service) {
  static get name() {
    return 'service-provider';
  }
}

class ServiceTest extends Service {
  static get name() {
    return 'test';
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
      it('has response', () =>
        testEndpoint.receive({
          action: 'list'
        }).then(r => {
          assert.deepEqual(r.sort((a, b) => a.name.localeCompare(b.name)), [{
            endpoints: {},
            name: 'a',
            type: 'service-provider'
          }, {
            endpoints: {
              /*  command: { in : true
              },*/
              config: { in : true
              }
            },
            name: 'config',
            type: 'config'
          }, {
            endpoints: {
              log: { in : true
              }
            },
            name: 'logger',
            type: 'logger'
          }]);
        })
      );
    });
    describe('get', () => {
      it('has response ', () =>
        testEndpoint.receive({
          action: 'get',
          service: 'logger',
          options: {
            includeRuntimeInfo: true,
            includeDefaults: true,
            includeConfig: true
          }
        }).then(r => {
          assert.deepEqual(r, {
            endpoints: {
              command: { in : true
              },
              config: { in : true
              },
              log: { in : true
              }
            },
            timeout: {
              start: 5
            },
            logLevel: 'info',
            state: 'running',
            name: 'logger',
            type: 'logger'
          });
        })
      );
    });

    describe('start', () => {
      it('is running', () =>
        testEndpoint.receive({
          action: 'start',
          service: 'logger'
        }).then(r => {
          assert.equal(r.state, 'running');
        })
      );
    });
    describe('stop', () => {
      it('is stopped', () =>
        testEndpoint.receive({
          action: 'stop',
          service: 'logger'
        }).then(r => {
          assert.equal(r.state, 'stopped');
        })
      );
    });

    describe('restart', () => {
      it('is running', () =>
        testEndpoint.receive({
          action: 'restart',
          service: 'logger'
        }).then(r => {
          assert.equal(r.state, 'running');
        })
      );
    });

    describe('several restarts', () => {
      it('is running', () =>
        testEndpoint.receive([{
          action: 'restart',
          service: 'logger'
        }, {
          action: 'restart',
          service: 'logger'
        }]).then(r => {
          assert.equal(r[1].state, 'running');
        })
      );
    });

    describe('restart unknown service', () => {
      it('is running', () =>
        testEndpoint.receive({
          action: 'restart',
          service: 'invalid'
        }).then(r => {
          assert.equal(r.state, 'xxrunning');
        }, e => {
          assert.ok(true);
        })
      );
    });

    describe('unknown command', () => {
      it('rejects', () =>
        testEndpoint.receive({
          action: 'unknown',
          service: 'logger'
        }).then(r => {
          assert.equal(r.state, 'xxrunning');
        }, e => {
          assert.ok(true);
        })
      );
    });
  });

  describe('additional service', () => {
    before(() => {
      sp.registerService(new ServiceTest({}, sp));
      sp.registerService(new ServiceTest({
        name: 't2'
      }, sp));
    });

    it('test service', () => assert.equal(sp.services.test.name, 'test'));

    describe('configure service', () => {
      it('direct', () => sp.services.test.configure({
        key: 'new value'
      }).then(() =>
        assert.equal(sp.services.test.key, 'new value')
      ));

      it('send change request over config service', () =>
        sp.services.config.endpoints.config.receive([{
          name: 'config'
        }, {
          name: 'unknown'
        }, {
          name: 'test',
          key1: 4711,
          key2: '2'
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
      before(() => {
        setTimeout(() =>
          sp.registerServiceFactory(ServiceTest), 30);

        // force pending promises
        /*
        sp.declareService({
          name: 's2',
          type: 'test'
        }, true);
        sp.declareService({
          name: 's2',
          type: 'test'
        }, true);
        */
      });

      it('can be declared', () =>
        sp.declareService({
          name: 's2',
          type: 'test',
          key: 1
        }, true).then(
          s => { 
            assert.equal(s.name, 's2');
            assert.equal(s.type, 'test');
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
            assert.equal(s.name, 's2');
            assert.equal(s.key, 2);
          }
        )
      );
    });

    xdescribe('without type', () => {
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
            assert.equal(s.name, 'test');
            //assert.equal(s.value, 77);
          }
        )
      );
    });
  });
});
