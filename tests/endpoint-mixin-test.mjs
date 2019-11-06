import test from 'ava';
import { TestLogger } from "./util.mjs";

import { SendEndpoint, ReceiveEndpoint } from '@kronos-integration/endpoint';
import Service from '../src/service.mjs';
import ServiceProviderMixin from '../src/service-provider-mixin.mjs';

class Owner extends ServiceProviderMixin(Service, TestLogger) {
  get name() {
    return 'owner';
  }
}

test('outEndpoints', t => {
  const o = new Owner();

  t.truthy(o.endpoints.log.receive);

  t.deepEqual(o.outEndpoints, [o.endpoints.log]);
});

test('inEndpoints', t => {
  const o = new Owner();
  t.deepEqual(o.inEndpoints.map(e => e.name), ['config', 'command']);
});

test('endpointForExpression simple', t => {
  const o = new Owner();
  const s1 = new SendEndpoint('s1');
  const r1 = new ReceiveEndpoint('r1');

  o.addEndpoint(s1);
  o.addEndpoint(r1);

  t.deepEqual(o.endpointForExpression('r1'), r1);
  t.deepEqual(o.endpointForExpression('s1'), s1);
});

test('endpointForExpression service', async t => {
  const o = new Owner();
  await o.start();

  //console.log(o.services);
  t.is(o.endpointForExpression('service(config).command').name, 'command');
  t.is(o.endpointForExpression('service(logger).log').name, 'log');
});

test('endpointForExpression service throwing', async t => {
  const o = new Owner();
  await o.start();

  const error = t.throws(() => {
    o.endpointForExpression('service(something).something');
  }, Error);

  t.is(
    error.message,
    "Service 'something' not found in owner (logger,config,owner)"
  );
});

test('endpointForExpression throwing', t => {
  const o = new Owner();
  const r1 = new ReceiveEndpoint('r1');

  o.addEndpoint(r1);

  const error = t.throws(() => {
    o.endpointForExpression('r2');
  }, Error);

  t.is(error.message, "Endpoint 'r2' not found in owner");
});

test('endpointFromConfig simple target', t => {
  const o = new Owner();

  const r1 = new ReceiveEndpoint('r1');
  o.addEndpoint(r1);

  const e = o.createEndpointFromConfig('e', { target: 'r1' }, o);

  t.is(e.name, 'e');
  t.is(e.connected.name, 'r1');
});

test('endpointFromConfig foreign target', t => {
  const o = new Owner();

  const e = o.createEndpointFromConfig('e', { target: 'service(logger).log' }, o);

  t.is(e.name, 'e');
  t.is(e.connected.name, 'log');
  t.is(e.connected.owner.name, 'logger');
});