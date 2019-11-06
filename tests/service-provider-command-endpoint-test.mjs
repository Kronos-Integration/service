import test from 'ava';
import { SendEndpoint } from '@kronos-integration/endpoint';
import Service from '../src/service.mjs';
import ServiceProviderMixin from '../src/service-provider-mixin.mjs';

class ServiceProvider extends ServiceProviderMixin(Service) {
  static get name() {
    return 'service-provider';
  }
}

async function makeServiceProvider() {
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

  await sp.start();

  return { sp, testEndpoint };
}

test('service provider command endpoint', async t => {
  const { sp, testEndpoint } = await makeServiceProvider();

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
      endpoints: {},
      name: 'config',
      type: 'config'
    },
    {
      endpoints: {},
      name: 'logger',
      type: 'logger'
    }
  ]);
});

test('service provider command endpoint get', async t => {
  const { sp, testEndpoint } = await makeServiceProvider();

  const response = await testEndpoint.receive({
    action: 'get',
    service: 'logger',
    options: {
      includeRuntimeInfo: true,
      includeDefaults: true,
      includeConfig: true,
      includeName: true
    }
  });

  t.deepEqual(response, {
    description: 'This service is the base class for service implementations',
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
});

test('service provider command endpoint start / stop', async t => {
  const { sp, testEndpoint } = await makeServiceProvider();

  let response = await testEndpoint.receive({
    action: 'start',
    service: 'logger'
  });

  t.is(response.state, 'running');

  response = await testEndpoint.receive({
    action: 'stop',
    service: 'logger'
  });

  t.is(response.state, 'stopped');

  response = await testEndpoint.receive({
    action: 'restart',
    service: 'logger'
  });

  t.is(response.state, 'running');
});

test('service provider command endpoint several restarts', async t => {
  const { sp, testEndpoint } = await makeServiceProvider();

  const response = await testEndpoint.receive([
    {
      action: 'restart',
      service: 'logger'
    },
    {
      action: 'restart',
      service: 'logger'
    }
  ]);

  t.is(response[0].state, 'running');
  t.is(response[1].state, 'running');
});

test('service provider command endpoint restart unknown service', async t => {
  const { sp, testEndpoint } = await makeServiceProvider();

  try {
    const response = await testEndpoint.receive({
      action: 'restart',
      service: 'invalid'
    });
    t.is(response.state, 'running');
  } catch (e) {
    t.is(e.message, 'Unknown service: invalid');
  }
});

test('service provider command endpoint restart unknown command', async t => {
  const { sp, testEndpoint } = await makeServiceProvider();

  try {
    const response = await testEndpoint.receive({
      action: 'unknown',
      service: 'logger'
    });
    t.is(response.state, 'running');
  } catch (e) {
    t.is(e.message, 'Unknown command: unknown');
  }
});
