/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  Service = require('../lib/service');

describe('service', function () {
  const s1 = new Service({
    key1: "value1",
    key2: 2
  });

  describe('plain creation', function () {
    it('has a type', function () {
      assert.equal(s1.type, 'service');
    });

    it('has a toString', function () {
      assert.equal(s1.toString(), 'service');
    });

    it('is stopped', function () {
      assert.equal(s1.state, 'stopped');
    });

    it('has default logLevel info', function () {
      assert.equal(s1.logLevel, 'info');
    });
  });

  describe('creation with logLevel', function () {
    const s2 = new Service({
      key1: "value1",
      logLevel: "trace"
    });

    it('has given logLevel', function () {
      assert.equal(s2.logLevel, 'trace');
    });

    describe('can log', function () {
      s2.error("some error");
      s2.error({
        key1: "value1"
      });
    });
  });

  describe('derived service', function () {

    class MyService extends Service {
      static get type() {
        return "my-service";
      }
      get type() {
        return MyService.type;
      }

      constructor(config) {
        super(config);

        Object.defineProperty(this, 'key3', {
          value: config.key3
        });
        Object.defineProperty(this, 'key4', {
          value: config.key4
        });
      }

      _start() {
        return new Promise((f, r) => setTimeout(() => f(this), 10));
      }
    };

    describe('creation', function () {
      const s2 = new MyService({
        key3: "value3",
        key4: 4
      });

      it('has a type', function () {
        assert.equal(s2.type, 'my-service');
      });

      it('has a toString', function () {
        assert.equal(s2.toString(), 'my-service');
      });

      it('has values', function () {
        assert.equal(s2.key3, 'value3');
        assert.equal(s2.key4, 4);
      });
    });

    /*
        describe('states', function () {
          const s1 = new MyService({
            key1: "value1",
            key2: 2,
          });

          it('can be started', function (done) {
            s1.start().then(() => {
              assert.equal(s1.state, 'running');
              done();
            }, done);
          });

          const s2 = new MyService({
            key1: "value1",
            key2: 2,
          });

          it('derived state untouced', function () {
            assert.equal(s2.state, 'stopped');
          });

          it('can be stopped', function (done) {
            s1.stop().then(() => {
              assert.equal(s1.state, 'stopped');
              done();
            }, done);
          });
        });
        */
  });
});
