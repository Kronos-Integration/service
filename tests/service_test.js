/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  endpoint = require('kronos-endpoint'),
  Service = require('../lib/Service');

const owner = {
  emit(name, arg1, arg2) {}, // dummy event emitter
    endpointIdentifier(e) {
      return `name:${e.name}`;
    }
};

describe('service', () => {

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
    }, owner);
    it('has a name', () => assert.equal(s2.name, 'myName'));
    it('json', () => assert.deepEqual(s2.toJSON(), {
      name: "myName",
      type: "service",
      endpoints: {}
    }));
  });

  describe('creation with logLevel', () => {
    const s2 = new Service({
      key1: "value1",
      logLevel: "trace"
    }, owner);

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
        return super.configure(config).then(
          () => {
            Object.assign(this, config);
            return Promise.resolve();
          }
        );
      }
    }

    describe('creation', () => {
      const s2 = new MyService({
        key3: "value3",
        key4: 4
      }, owner);

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

      it("re configure", () =>
        se.receive({
          logLevel: 'trace',
          key2: 77
        }).then(
          f => {
            assert.equal(s2.logLevel, 'trace');
            assert.equal(s2.key2, 77);
          }
        )
      );
    });

    describe('states', () => {
      const s1 = new MyService({
        key1: "value1",
        key2: 2,
      }, owner);
      it('can be restartIfRunning (when stopped)', () => s1.restartIfRunning().then(() => assert.equal(s1.state,
        'stopped')));

      it('can be started', () => s1.start().then(() => assert.equal(s1.state, 'running')));
      it('can be restartIfRunning', () => s1.restartIfRunning().then(() => assert.equal(s1.state, 'running')));
      it('can be restarted', () => s1.restart().then(() => assert.equal(s1.state, 'running')));

      const s2 = new MyService({
        key1: "value1",
        key2: 2,
      });

      it('derived state untouched', () => assert.equal(s2.state, 'stopped'));

      it('can be stopped', () => s1.stop().then(() => assert.equal(s1.state, 'stopped')));
    });
  });
});
