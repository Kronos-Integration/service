import { SendEndpoint, ReceiveEndpoint } from 'kronos-endpoint';
import EndpointMixin from '../src/endpoint-mixin';
import test from 'ava';

class Owner extends EndpointMixin(class {}) {}

test('outEndpoints', async t => {
  const o = new Owner();

  const s1 = new SendEndpoint('s1');
  const r1 = new ReceiveEndpoint('r1');

  o.addEndpoint(s1);

  t.deepEqual(o.outEndpoints, [s1]);
});

