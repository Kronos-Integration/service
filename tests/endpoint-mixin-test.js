import { SendEndpoint, ReceiveEndpoint } from 'kronos-endpoint';
import EndpointMixin from '../src/endpoints-mixin';
import test from 'ava';

class Owner extends EndpointMixin(class {}) {}

test('outEndpoints', async t => {
  const o = new Owner();

  const s1 = new SendEndpoint('s1');
  const r1 = new ReceiveEndpoint('r1');

  o.addEndpoint(s1);
  o.addEndpoint(r1);

  t.deepEqual(o.outEndpoints, [s1]);
});

test('inEndpoints', async t => {
  const o = new Owner();

  const s1 = new SendEndpoint('s1');
  const r1 = new ReceiveEndpoint('r1');

  o.addEndpoint(s1);
  o.addEndpoint(r1);

  t.deepEqual(o.inEndpoints, [r1]);
});
