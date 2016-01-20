/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  rgm = require('../lib/RegistrarMixin');

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
    let object = {};

    rgm.defineRegistrarProperties(object, 'Interceptor', 'interceptors');

    it('no entries', () => assert.deepEqual(object.interceptors, {}));
  });

  describe('add entry', () => {
    let object = {};

    rgm.defineRegistrarProperties(object, 'Interceptor', 'interceptors');

    object.registerInterceptor(Interceptor);

    //console.log(`object keys: ${Interceptor.name} ${Object.keys(object.interceptors)}`);

    it('one entry', () => assert.equal(object.interceptors.t1.name, "t1"));

    const inst1 = object.createInterceptorInstance("t1", "arg1");
    it('instance created', () => assert.equal(inst1.arg1, "arg1"));

    object.registerInterceptor(Interceptor);
    it('one entry still there', () => assert.equal(object.interceptors.t1.name, "t1"));
  });

});
