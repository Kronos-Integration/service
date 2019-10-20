import test from 'ava';

import { TimeoutInterceptor } from '@kronos-integration/interceptor';
import InterceptorProviderMixin from '../src/interceptor-provider-mixin.mjs';

class InterceptorProvider extends InterceptorProviderMixin(class {}) {}

test('interceptor provider', async t => {
  const ip = new InterceptorProvider();

  ip.registerInterceptor(TimeoutInterceptor);

  t.is(ip.declareInterceptor({ type: 'timeout' }).type, 'timeout');
});

test('interceptor unknown type', async t => {
  const ip = new InterceptorProvider();

  try {
    ip.declareInterceptor(
      {
        type: 'unknown-interceptor'
      },
      {}
    );
  } catch (e) {
    t.is(e.message, 'Undefined interceptor unknown-interceptor');
  }
});
