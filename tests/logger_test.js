/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const loggingSupport = require('../lib/loggingSupport');

describe('logging', function () {

  let theValue = 0;
  let theLevel = "none";

  const someObject = {
    log(level, args) {
      theLevel = level;
      theValue = args;
    }
  };
  const someOtherObject = {
    log(level, args) {
      theLevel = level;
      theValue = args;
    }
  };


  loggingSupport.assignLoggerFunctions(someObject
    /*, (level, args) => {
       value = args;
     }*/
  );

  loggingSupport.assignLoggerFunctions(someOtherObject
    /*, (level, args) => {
       value = args;
     }*/
  );

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
      assert.equal(theValue, 'info message');
      assert.equal(theLevel, 'info');
    });
    it('trace ignored', function () {
      someObject.trace(level => "trace message");
      assert.equal(theValue, 'info message');
      assert.equal(theLevel, 'info');
    });
    it('error passes', function () {
      someObject.error(level => "error message");
      assert.equal(theValue, 'error message');
      assert.equal(theLevel, 'error');
    });
  });
});
