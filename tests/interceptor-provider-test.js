import { TimeoutInterceptor } from 'kronos-interceptor';
import InterceptorproviderMixin from '../src/interceptor-provider-mixin';
import test from 'ava';

class InterceptorProvider extends InterceptorproviderMixin(class {}) {}

test('interceptor provider', async t => {
  const ip = new InterceptorProvider();

  ip.registerInterceptor(TimeoutInterceptor);

  t.is(ip.declareInterceptor({ type: 'timeout' }).type, 'timeout');
});
