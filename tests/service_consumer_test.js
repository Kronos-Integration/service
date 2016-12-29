/* global describe, it, xit */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  {
    Service, ServiceProviderMixin, defineServiceConsumerProperties
  } = require('../dist/module');

class ServiceProvider extends ServiceProviderMixin(Service) {}

class ServiceTest extends Service {
  static get name() {
    return 'test';
  }
}

describe('service consumer', () => {
  const sp = new ServiceProvider({});
  const object = {};

  it('define with name and type', () =>
    sp.registerServiceFactory(ServiceTest).then(() =>
      defineServiceConsumerProperties(object, {
        'myTest': {
          type: 'test',
          name: 'n1'
        }
      }, sp).then(() =>
        assert.equal(object.myTest.name, 'n1'))
    )
  );

  it('define with type', () =>
    sp.registerServiceFactory(ServiceTest).then(() =>
      defineServiceConsumerProperties(object, {
        'myTest2': {
          type: 'test'
        }
      }, sp).then(() =>
        assert.equal(object.myTest2.name, 'myTest2'))
    )
  );

  it('define with type simple', () =>
    sp.registerServiceFactory(ServiceTest).then(() =>
      defineServiceConsumerProperties(object, {
        'myTest3': 'test'
      }, sp).then(() =>
        assert.equal(object.myTest3.name, 'myTest3'))
    )
  );
});

describe('service consumer with wait', () => {
  const sp = new ServiceProvider({});
  const object = {};

  setTimeout(() => sp.registerServiceFactory(ServiceTest), 300);

  it('defines', () => defineServiceConsumerProperties(object, {
    'myTest': {
      type: 'test'
    }
  }, sp, true).then(() =>
    assert.equal(object.myTest.name, 'myTest')));
});
