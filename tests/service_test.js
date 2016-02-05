/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  endpoint = require('kronos-endpoint'),
  Service = require('../lib/Service');

describe('service', () => {
  const owner = {};

  const s1 = new Service({
    key1: "value1",
    key2: 2
  }, owner);

  describe('plain creation', () => {
    it('has a type', () => assert.equal(s1.type, 'service'));
    it('has a name', () => assert.equal(s1.name, 'service'));
    it('has a owner', () => assert.equal(s1.owner, owner));
    it('has a toString', () => assert.equal(s1.toString(), 'service: stopped'));
    it('is stopped', () => assert.equal(s1.state, 'stopped'));
    it('autstart is off', () => assert.isFalse(s1.autostart));
    it('has default logLevel info', () => assert.equal(s1.logLevel, 'info'));
  });

  describe('create with name', () => {
    const s2 = new Service({
      name: "myName"
    });
    it('has a name', () => assert.equal(s2.name, 'myName'));
  });

  describe('creation with logLevel', () => {
    const s2 = new Service({
      key1: "value1",
      logLevel: "trace"
    });

    it('has given logLevel', () => assert.equal(s2.logLevel, 'trace'));

    describe('can log', () => {
      s2.error("some error");
      s2.error({
        key1: "value1"
      });
    });

    describe('invalid loglevel', () => {
      const s2 = new Service({
        key1: "value1",
        logLevel: "na sowas"
      });

      it('fallback to info logLevel', () => assert.equal(s2.logLevel, 'info'));
    });
  });

  describe('derived service', () => {

    class MyService extends Service {
      static get type() {
        return "my-service";
      }
      get type() {
        return MyService.type;
      }

      constructor(config, owner) {
        super(config, owner);

        Object.defineProperty(this, 'key3', {
          value: config.key3
        });
        Object.defineProperty(this, 'key4', {
          value: config.key4
        });
      }

      _start() {
        return new Promise((f, r) => setTimeout(() => f(), 10));
      }

      configure(config) {
        Object.assign(this, config);
        //this.key2 = config.key2;
        return Promise.resolve();
      }
    };

    describe('creation', () => {
      const s2 = new MyService({
        key3: "value3",
        key4: 4
      });

      it('has a type', () => assert.equal(s2.type, 'my-service'));
      it('has a toString', () => assert.equal(s2.toString(), 'my-service: stopped'));

      it('has values', () => {
        assert.equal(s2.key3, 'value3');
        assert.equal(s2.key4, 4);
      });
    });

    describe('configuration', () => {
      const s2 = new MyService({
        key7: 1
      });

      const se = new endpoint.SendEndpoint('se', {get name() {
          return "a";
        }
      });
      se.connected = s2.endpoints.config;

      it("re configure", done => {
        se.receive({
          key2: 77
        }).then(
          f => {
            assert.equal(s2.key2, 77);
            done();
          }
        ).catch(done);
      });
    });

    describe('states', () => {
      const s1 = new MyService({
        key1: "value1",
        key2: 2,
      });

      it('can be started', () => s1.start().then(() => assert.equal(s1.state, 'running')));

      const s2 = new MyService({
        key1: "value1",
        key2: 2,
      });

      it('derived state untouced', () => assert.equal(s2.state, 'stopped'));

      it('can be stopped', () => s1.stop().then(() => assert.equal(s1.state, 'stopped')));
    });
  });
});
