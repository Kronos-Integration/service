/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  //  events = require('events'),
  service = require('../service');

describe('service', function () {
  describe('creation', function () {
    const s1 = service.createService('myService', {
      key1: "value1",
      key2: 2
    });

    it('has a name', function () {
      assert.equal(s1.name, 'myService');
    });

    it('is stopped', function () {
      assert.equal(s1.state, 'stopped');
    });

    it('has values', function () {
      assert.equal(s1.key1, 'value1');
      assert.equal(s1.key2, 2);
    });

  });
});
