/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const loggingSupport = require('../lib/loggingSupport');

describe('logging', function () {

  const someObject = {};
  const someOtherObject = {};

  let value = 0;

  loggingSupport.assignLoggerFunctions(someObject, (level, args) => {
    value = args;
  });

  loggingSupport.assignLoggerFunctions(someOtherObject, (level, args) => {
    value = args;
  });

  describe('levels', function () {
    it('default info', function () {
      assert.equal(someObject.logLevel, "info");
    });

    it('set invalid fallback info', function () {
      someObject.logLevel = "unknown";
      assert.equal(someObject.logLevel, "info");
    });

    ['trace', 'error', 'debug', 'info'].forEach(level => {
      it(`set ${level}`, function () {
        someObject.logLevel = level;
        assert.equal(someObject.logLevel, level);
      });
    });

    it('default info', function () {
      someOtherObject.logLevel = 'trace';
      assert.equal(someOtherObject.logLevel, "trace");
      assert.equal(someObject.logLevel, "info");
    });
  });

  describe('logging with levels', function () {
    it('info passes', function () {
      someObject.info(level => "info message");
      assert.equal(value, 'info message');
    });
    it('trace ignored', function () {
      someObject.trace(level => "trace message");
      assert.equal(value, 'info message');
    });
    it('error passes', function () {
      someObject.error(level => "error message");
      assert.equal(value, 'error message');
    });
  });
});
