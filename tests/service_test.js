/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  //  events = require('events'),
  service = require('../lib/service');

describe('service', function () {
  describe('creation', function () {
    const s1 = service.createService('myService', {
      key1: "value1",
      key2: 2
    });

    it('has a name', function () {
      assert.equal(s1.name, 'myService');
    });

    it('has a toString', function () {
      assert.equal(s1.toString(), 'myService');
    });

    it('is stopped', function () {
      assert.equal(s1.state, 'stopped');
    });

    it('has values', function () {
      assert.equal(s1.key1, 'value1');
      assert.equal(s1.key2, 2);
    });
  });

  describe('states', function () {

    const s1 = service.createService('myService', {
      key1: "value1",
      key2: 2,
      _start() {
        return new Promise((f, r) => {
          setTimeout(() => {
            f(this)
          }, 10);
        });
      }
    });

    it('can be started', function (done) {
      s1.start().then(() => {
        assert.equal(s1.state, 'running');
        done();
      }, done);
    });

    it('can be stopped', function (done) {
      s1.stop().then(() => {
        assert.equal(s1.state, 'stopped');
        done();
      }, done);
    });

  });

});
