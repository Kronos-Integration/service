import { SendEndpoint, ReceiveEndpoint } from 'kronos-endpoint';
import Service from '../src/service';
import EndpointMixin from '../src/endpoints-mixin';
import ServiceProviderMixin from '../src/service-provider-mixin';
import test from 'ava';

class Owner extends ServiceProviderMixin(Service) {
  toString() {
    return 'owner';
  }
}

test('outEndpoints', t => {
  const o = new Owner();
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
});

test.skip('endpointForExpression service', t => {
  const o = new Owner();

  t.is(o.endpointForExpression('service(config).command').name, 'command');
});

test('endpointForExpression service throwing', t => {
  const o = new Owner();

  const error = t.throws(() => {
    o.endpointForExpression('service(something).something');
  }, Error);

  t.is(error.message, "Service 'something' not found in owner ()");
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

test('endpointFromConfig target', t => {
  const o = new Owner();

  const r1 = new ReceiveEndpoint('r1');
  o.addEndpoint(r1);

  const e = o.createEndpointFromConfig('e', { target: 'r1' }, o);

  t.is(e.name, 'e');
  t.is(e.connected.name, 'r1');
});
