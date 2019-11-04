import test from 'ava';
import { TestService, wait } from './util.mjs';

import { createAttributes } from 'model-attributes';
import { SendEndpoint } from '@kronos-integration/endpoint';
import Service from '../src/service.mjs';

const owner = {
  emit(name, arg1, arg2) {}, // dummy event emitter
  endpointIdentifier(e) {
    return `name:${e.name}`;
  }
};

test('service plain create', t => {
  const s1 = new Service(
    {
      key1: 'value1',
      key2: 2
    },
    owner
  );

  t.is(s1.type, 'service');
  t.is(s1.name, 'service');
  t.is(s1.owner, owner);
  t.is(s1.toString(), 'service: stopped');
  t.is(s1.state, 'stopped');
  t.is(s1.autostart, false);
  t.is(s1.logLevel, 'info');
  t.is(s1.timeout.start, 5);
});

test('service create with name', t => {
  const s1 = new Service(
    {
      name: 'myName'
    },
    owner
  );

  t.is(s1.name, 'myName');
  t.deepEqual(s1.toJSON(), {
    name: 'myName',
    type: 'service',
    endpoints: {}
  });
});

test('service create with endpoints', t => {
  const s1 = new Service(
    {
      endpoints: {
        ep1: { in: true }
      }
    },
    owner
  );

  t.deepEqual(s1.toJSON(), {
    name: 'service',
    type: 'service',
    endpoints: {
      ep1: { in: true }
    }
  });
});

test('service create with logLevel', t => {
  const s1 = new Service(
    {
      key1: 'value1',
      logLevel: 'trace'
    },
    owner
  );

  t.is(s1.logLevel, 'trace');

  s1.error('some error');
  s1.error({
    key1: 'value1'
  });

  const s2 = new Service({
    key1: 'value1',
    logLevel: 'na sowas'
  });

  t.is(s2.logLevel, 'info');
});

test('service create with DEBUG=1', t => {
  process.env.DEBUG=1;

  const s1 = new Service(
    {
      key1: 'value1'
    },
    owner
  );

  t.is(s1.logLevel, 'debug');

  const s2 = new Service({
    key1: 'value1',
    logLevel: 'warn'
  });

  t.is(s2.logLevel, 'debug');

  delete process.env.DEBUG;
});

test('service create with LOGLEVEL=trace', t => {
  process.env.LOGLEVEL="trace";

  const s1 = new Service(
    {
      key1: 'value1'
    },
    owner
  );

  t.is(s1.logLevel, 'trace');

  delete process.env.LOGLEVEL;
});

test('service derived creation', t => {
  const s1 = new TestService(
    {
      key3: 'value3',
      key4: 4
    },
    owner
  );
  t.is(s1.type, 'test');
  t.is(s1.description, 'my description');
  t.is(s1.toString(), 'test: stopped');
  t.is(s1.configurationAttributes.key3.name, 'key3');
  t.is(s1.key4, 4);
});

test('service derived configuration', async t => {
  const s1 = new TestService({
    key7: 1
  });

  const se = new SendEndpoint('se', {
    get name() {
      return 'a';
    }
  });
  se.connected = s1.endpoints.config;

  await se.receive({
    logLevel: 'trace',
    key2: 77
  });

  t.is(s1.logLevel, 'trace');
  t.is(s1.key2, 77);
});

test('service derived configuration change start timeout', async t => {
  const s1 = new TestService({
    key7: 1
  });

  await s1.configure({
    timeout: {
      start: 123.45
    }
  });

  t.is(s1.timeout.start, 123.45);
});

test('service states', async t => {
  const s1 = new TestService(
    {
      key1: 'value1',
      key2: 2
    },
    owner
  );

  await s1.restartIfRunning();
  t.is(s1.state, 'stopped');

  await s1.start();
  t.is(s1.state, 'running');

  await s1.restartIfRunning();
  t.is(s1.state, 'running');
  await s1.restart();
  t.is(s1.state, 'running');

  const s2 = new TestService({
    key1: 'value1',
    key2: 2
  });

  t.is(s2.state, 'stopped');

  await s1.stop();
  t.is(s1.state, 'stopped');
});
