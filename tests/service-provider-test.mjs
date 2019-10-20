import test from 'ava';
import Service from '../src/service.mjs';
import ServiceProviderMixin from '../src/service-provider-mixin.mjs';

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

test('service provider config service', async t => {
  const sp = new ServiceProvider([
    {
      name: 'a'
    },
    {
      name: 'test',
      key3: 3
    }
  ]);

  await sp.start();

  t.is(sp.services.config.name, 'config');
  t.deepEqual(Object.keys(sp.services.config.preservedConfigs), ['a', 'test']);

  t.is(sp.services.logger.name, 'logger');

  t.is(sp.state, 'running');

  t.is(sp.services.a.name, 'a');
});

test('service provider without initial config', async t => {
  const sp = new ServiceProvider();

  await sp.start();

  t.is(sp.services.config.name, 'config');

  sp.info(`logging`);
});

async function makeServices() {
  const sp = new ServiceProvider();

  await sp.start();

  await sp.registerService(new ServiceTest({}, sp));
  await sp.registerService(
    new ServiceTest(
      {
        name: 't2'
      },
      sp
    )
  );

  return sp;
}

test('service provider additional service', async t => {
  const sp = await makeServices();

  t.is(sp.services.test.name, 'test');
});

test('service provider additional service configure service', async t => {
  const sp = await makeServices();

  await sp.services.test.configure({
    key: 'new value'
  });

  t.is(sp.services.test.key, 'new value');
});

test('service provider additional service send change request over config service', async t => {
  const sp = await makeServices();

  await sp.services.config.endpoints.config.receive([
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
  ]);

  t.is(sp.services.test.key1, 4711);
});

test('service provider additional service can be unregistered', async t => {
  const sp = await makeServices();

  await sp.unregisterService('t2');

  t.is(sp.services.t2, undefined);
});

test('service provider additional service declare service with type', async t => {
  const sp = await makeServices();

  setTimeout(() => sp.registerServiceFactory(ServiceTest), 30);

  await sp.declareService(
    {
      name: 's2',
      type: 'test'
    },
    true
  );
  await sp.declareService(
    {
      name: 's2',
      type: 'test'
    },
    true
  );

  let s = await sp.declareService(
    {
      name: 's2',
      type: 'test',
      key: 1
    },
    true
  );

  t.is(s.name, 's2');
  t.is(s.type, 'test');
  t.is(s.key, 1);

  s = await sp.declareService(
    {
      name: 's2',
      type: 'test',
      key: 2
    },
    true
  );

  t.is(s.name, 's2');
  t.is(s.type, 'test');
  t.is(s.key, 2);
});

/*
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
