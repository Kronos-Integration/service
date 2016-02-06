/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  Service = require('../lib/Service'),
  ServiceProviderMixin = require('../lib/ServiceProviderMixin'),
  ServiceConsumerMixin = require('../lib/ServiceConsumerMixin');

class ServiceProvider extends ServiceProviderMixin(Service) {}

class ServiceTest extends Service {
  static get name() {
    return "test";
  }
  get type() {
    return ServiceTest.name;
  }
}

describe('service consumer', () => {
  const sp = new ServiceProvider({});
  const object = {};

  it('defines', () =>
    sp.registerServiceFactory(ServiceTest).then(() =>
      ServiceConsumerMixin.defineServiceConsumerProperties(object, {
        'myTest': {
          type: 'test'
        }
      }, sp).then(() =>
        assert.equal(object.myTest.name, 'test'))
    )
  );
});
