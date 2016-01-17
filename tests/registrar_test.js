/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  rgm = require('../lib/RegistrarMixin');

describe('RegistrarMixin', () => {
  let object = {};

  rgm.defineRegistrarProperties(object, 'Interceptor', 'interceptors');

  describe('empty', () => {
    it('no entries', () => assert.deepEqual(object.interceptors, {}));
  });

  describe('add entry', () => {
    const t1 = {get type() {
        return "t1";
      }
    };

    object.registerInterceptor(t1);

    it('on entry', () => assert.equal(object.interceptors.t1.type, "t1"));
  });

});
