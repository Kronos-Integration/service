/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  rgm = require('../lib/RegistrarMixin'),
  Service = require('../lib/Service');

class Interceptor {
  static get name() {
    return "t1";
  }

  constructor(arg1) {
    this.arg1 = arg1;
  }
}

describe('RegistrarMixin', () => {

  describe('empty', () => {
    const object = new Service();

    rgm.defineRegistrarProperties(object, 'interceptor');

    it('no entries', () => assert.deepEqual(object.interceptors, {}));
  });

  describe('register entry', () => {
    const object = new Service();

    rgm.defineRegistrarProperties(object, 'interceptor');

    object.registerInterceptor(Interceptor);

    it('has one entry', () => assert.equal(object.interceptors.t1.name, "t1"));

    describe('create instance', () => {
      const inst1 = object.createInterceptorInstance("t1", "arg1");
      it('instance created', () => assert.equal(inst1.arg1, "arg1"));
    });

    describe('unregister', () => {
      it('entry missing', () => {
        let unregistered;
        object.addListener('interceptorUnregistered', ur => unregistered = ur);
        object.unregisterInterceptor("t1");
        assert.equal(object.interceptors.t1, undefined);
        assert.equal(unregistered, Interceptor);
      });
    });

    object.registerInterceptor(Interceptor);
    it('one entry still there', () => assert.equal(object.interceptors.t1.name, "t1"));
  });
});
