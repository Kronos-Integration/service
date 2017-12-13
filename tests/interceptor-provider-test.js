import { TimeoutInterceptor } from 'kronos-interceptor';
import InterceptorroviderMixin from '../src/interceptor-provider-mixin';
import test from 'ava';

class InterceptorProvider extends InterceptorroviderMixin(class {}) {}

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
