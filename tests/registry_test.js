/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  rgm = require('../lib/RegistryMixin'),
  Service = require('../lib/Service');

class Interceptor {
  static get name() {
    return "t1";
  }

  constructor(arg1, arg2) {
    if (arg2) {
      this.arg1 = arg2;
    } else
      this.arg1 = arg1;
  }
}

const InterceptorFactory = {
  type: 't1',
  createInstance(arg1, arg2) {
    if (arg2) {
      return {
        arg1: arg2
      };
    }

    return {
      arg1: arg1
    };
  }
};


describe('RegistrarMixin', () => {

  describe('empty', () => {
    const object = new Service();

    rgm.defineRegistryProperties(object, 'interceptor', {
      withCreateInstance: true,
      factoryType: 'new'
    });

    it('no entries', () => assert.deepEqual(object.interceptors, {}));
  });

  testRegistry('class', Interceptor, {
    withCreateInstance: true,
    factoryType: 'new'
  });

  testRegistry('function', InterceptorFactory, {
    withCreateInstance: true,
    factoryType: 'object',
    'factoryMethod': 'createInstance'
  });
});


function testRegistry(name, factory, registryOptions) {
  describe(`${name} entries`, () => {
    const object = new Service();

    rgm.defineRegistryProperties(object, 'interceptor', registryOptions);

    let registered;
    object.addListener('interceptorRegistered', r => registered = r);

    object.registerInterceptor(factory);

    describe('registered event', () => {
      it('send', () => assert.equal(registered, factory));
    });

    it('has one entry', () => assert.equal(object.interceptors.t1, factory));

    describe('create instance', () => {
      const inst1 = object.createInterceptorInstance("t1", "arg1");
      it('created', () => assert.equal(inst1.arg1, "arg1"));
    });

    describe('create instance from config', () => {
      const inst1 = object.createInterceptorInstanceFromConfig({
        type: "t1",
        "someOtherArgs": 1
      }, "arg1");
      it('created', () => assert.equal(inst1.arg1, "arg1"));
    });

    describe('unregister', () => {
      it('entry missing', () => {
        let unregistered;
        object.addListener('interceptorUnregistered', ur => unregistered = ur);
        object.unregisterInterceptor("t1");
        assert.equal(object.interceptors.t1, undefined);
        assert.equal(unregistered, factory);
      });
    });

    object.registerInterceptor(factory);
    it('one entry still there', () => assert.equal(object.interceptors.t1, factory));
  });
}
