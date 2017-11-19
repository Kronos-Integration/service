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

  t.is(sp.services.config.name, 'config');
  t.deepEqual(Object.keys(sp.services.config.preservedConfigs), ['a', 'test']);

  t.is(sp.services.logger.name, 'logger');

  await sp.start();
  t.is(sp.state, 'running');

  t.is(sp.services.a.name, 'a');
});

test('service provider without initial config', async t => {
  const sp = new ServiceProvider();
  t.is(sp.services.config.name, 'config');

  sp.info(`logging`);
});
