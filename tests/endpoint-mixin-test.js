import { SendEndpoint, ReceiveEndpoint } from 'kronos-endpoint';
import EndpointMixin from '../src/endpoints-mixin';
import test from 'ava';

class Owner extends EndpointMixin(class {}) {
  toString() {
    return 'owner';
  }
}

test('outEndpoints', t => {
  const o = new Owner();

  const s1 = new SendEndpoint('s1');
  const r1 = new ReceiveEndpoint('r1');

  o.addEndpoint(s1);
  o.addEndpoint(r1);

  t.deepEqual(o.outEndpoints, [s1]);
});

test('inEndpoints', t => {
  const o = new Owner();

  const s1 = new SendEndpoint('s1');
  const r1 = new ReceiveEndpoint('r1');

  o.addEndpoint(s1);
  o.addEndpoint(r1);

  t.deepEqual(o.inEndpoints, [r1]);
});

test('endpointForExpression', t => {
  const o = new Owner();
  const s1 = new SendEndpoint('s1');
  const r1 = new ReceiveEndpoint('r1');

  o.addEndpoint(s1);
  o.addEndpoint(r1);

  t.deepEqual(o.endpointForExpression('r1'), r1);
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
