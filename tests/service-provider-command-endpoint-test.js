import { SendEndpoint } from 'kronos-endpoint';
import Service from '../src/service';
import ServiceConfig from '../src/service-config';
import ServiceLogger from '../src/service-logger';
import ServiceProviderMixin from '../src/service-provider-mixin';
import test from 'ava';

class ServiceProvider extends ServiceProviderMixin(Service) {
  static get name() {
    return 'service-provider';
  }
}

test('service provider command endpoint', async t => {
  const sp = new ServiceProvider([
    {
      name: 'a'
    },
    {
      name: 'test',
      key3: 3
    }
  ]);

  const testEndpoint = new SendEndpoint('test');
  testEndpoint.connected = sp.endpoints.command;

  const response = await testEndpoint.receive({
    action: 'list'
  });

  t.deepEqual(response.sort((a, b) => a.name.localeCompare(b.name)), [
    {
      endpoints: {},
      name: 'a',
      type: 'service-provider'
    },
    {
      endpoints: {
        config: {
          in: true
        }
      },
      name: 'config',
      type: 'config'
    },
    {
      endpoints: {
        log: {
          in: true
        }
      },
      name: 'logger',
      type: 'logger'
    }
  ]);
});

/*
describe('service provider', () => {
  describe('command endpoint', () => {
    describe('get', () => {
      it('has response ', () =>
        testEndpoint
          .receive({
            action: 'get',
            service: 'logger',
            options: {
              includeRuntimeInfo: true,
              includeDefaults: true,
              includeConfig: true,
              includeName: true
            }
          })
          .then(r => {
            assert.deepEqual(r, {
              description:
                'This service is the base class for service implementations',
              endpoints: {
                command: {
                  in: true
                },
                config: {
                  in: true
                },
                log: {
                  in: true
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
          }));
    });

    describe('start', () => {
      it('is running', () =>
        testEndpoint
          .receive({
            action: 'start',
            service: 'logger'
          })
          .then(r => {
            assert.equal(r.state, 'running');
          }));
    });
    describe('stop', () => {
      it('is stopped', () =>
        testEndpoint
          .receive({
            action: 'stop',
            service: 'logger'
          })
          .then(r => {
            assert.equal(r.state, 'stopped');
          }));
    });

    describe('restart', () => {
      it('is running', () =>
        testEndpoint
          .receive({
            action: 'restart',
            service: 'logger'
          })
          .then(r => {
            assert.equal(r.state, 'running');
          }));
    });

    describe('several restarts', () => {
      it('is running', () =>
        testEndpoint
          .receive([
            {
              action: 'restart',
              service: 'logger'
            },
            {
              action: 'restart',
              service: 'logger'
            }
          ])
          .then(r => {
            assert.equal(r[1].state, 'running');
          }));
    });

    describe('restart unknown service', () => {
      it('is running', () =>
        testEndpoint
          .receive({
            action: 'restart',
            service: 'invalid'
          })
          .then(
            r => {
              assert.equal(r.state, 'xxrunning');
            },
            e => {
              assert.ok(true);
            }
          ));
    });

    describe('unknown command', () => {
      it('rejects', () =>
        testEndpoint
          .receive({
            action: 'unknown',
            service: 'logger'
          })
          .then(
            r => {
              assert.equal(r.state, 'xxrunning');
            },
            e => {
              assert.ok(true);
            }
          ));
    });
  });

  describe('additional service', () => {
    before(() => {
      sp.registerService(new ServiceTest({}, sp));
      sp.registerService(
        new ServiceTest(
          {
            name: 't2'
          },
          sp
        )
      );
    });

    it('test service', () => assert.equal(sp.services.test.name, 'test'));

    describe('configure service', () => {
      it('direct', () =>
        sp.services.test
          .configure({
            key: 'new value'
          })
          .then(() => assert.equal(sp.services.test.key, 'new value')));

      it('send change request over config service', () =>
        sp.services.config.endpoints.config
          .receive([
            {
              name: 'config'
            },
            {
              name: 'unknown'
            },
            {
              name: 'test',
              key1: 4711,
              key2: '2'
            }
          ])
          .then(() => assert.equal(sp.services.test.key1, 4711)));
    });

    it('can be unregistered', () =>
      sp.unregisterService('t2').then(s => assert.isUndefined(sp.services.t2)));
  });

  describe('declare service', () => {
    describe('with type', () => {
      before(() => {
        setTimeout(() => sp.registerServiceFactory(ServiceTest), 30);

        sp.declareService({
          name: 's2',
          type: 'test'
        }, true);
        sp.declareService({
          name: 's2',
          type: 'test'
        }, true);
      });

      it('can be declared', () =>
        sp
          .declareService(
            {
              name: 's2',
              type: 'test',
              key: 1
            },
            true
          )
          .then(s => {
            assert.equal(s.name, 's2');
            assert.equal(s.type, 'test');
          }));

      it('can be declared again', () =>
        sp
          .declareService(
            {
              name: 's2',
              type: 'test',
              key: 2
            },
            true
          )
          .then(s => {
            assert.equal(s.name, 's2');
            assert.equal(s.key, 2);
          }));
    });

    xdescribe('without type', () => {
      const sp = new ServiceProvider([
        {},
        {
          name: 'test',
          value: 77
        }
      ]);

      sp.declareService(
        {
          name: 'test'
        },
        true
      );

      setTimeout(() => sp.registerServiceFactory(ServiceTest), 50);

      it('can be declared', () =>
        sp
          .declareService(
            {
              name: 'test'
            },
            true
          )
          .then(s => {
            assert.equal(s.name, 'test');
            //assert.equal(s.value, 77);
          }));
    });
  });
});
*/
