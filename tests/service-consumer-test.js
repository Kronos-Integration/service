import { SendEndpoint } from 'kronos-endpoint';
import Service from '../src/service';
import ServiceProviderMixin from '../src/service-provider-mixin';
import { defineServiceConsumerProperties } from '../src/service-consumer-mixin';
import { createAttributes } from 'model-attributes';
import test from 'ava';

class ServiceProvider extends ServiceProviderMixin(Service) {}

class ServiceTest extends Service {
  static get name() {
    return 'test';
  }
}

test('service consumer define with name and type', async t => {
  const sp = new ServiceProvider({});
  const object = {};

  await sp.registerServiceFactory(ServiceTest);

  await defineServiceConsumerProperties(
    object,
    {
      myTest: {
        type: 'test',
        name: 'n1'
      }
    },
    sp
  );
  t.is(object.myTest.name, 'n1');
});

test('service consumer define with type', async t => {
  const sp = new ServiceProvider({});
  const object = {};

  await sp.registerServiceFactory(ServiceTest);

  await defineServiceConsumerProperties(
    object,
    {
      myTest2: {
        type: 'test'
      }
    },
    sp
  );

  t.is(object.myTest2.name, 'myTest2');
});

test('service consumer define with type simple', async t => {
  const sp = new ServiceProvider({});
  const object = {};

  await sp.registerServiceFactory(ServiceTest);

  await defineServiceConsumerProperties(
    object,
    {
      myTest3: 'test'
    },
    sp
  );

  t.is(object.myTest3.name, 'myTest3');
});

test('service consumer with wait', async t => {
  const sp = new ServiceProvider({});
  const object = {};

  setTimeout(() => sp.registerServiceFactory(ServiceTest), 300);

  await defineServiceConsumerProperties(
    object,
    {
      myTest: {
        type: 'test'
      }
    },
    sp,
    true
  );

  t.is(object.myTest.name, 'myTest');
});
