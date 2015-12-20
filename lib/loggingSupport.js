/* jslint node: true, esnext: true */

"use strict";

const logLevels = [{
  name: 'trace',
  priority: 1
}, {
  name: 'debug',
  priority: 10
}, {
  name: 'info',
  priority: 100
}, {
  name: 'warn',
  priority: 1000
}, {
  name: 'error',
  priority: 10000
}, {
  name: 'fatal',
  priority: 100000
}];


/**
 * Adds logging methods to an existing object.
 * For each loglevel an function will be created.
 * @param theFunction {function} The function to be added under the loglevel name.
 *        This function will only be called if the current loglevel is greater equal
 *        the log level of the called logging function
 */
exports.assignLoggerFunctions = function (object, theFunction) {
  logLevels.forEach(level => {
    object[level.name] = function (providerFunction) {
      //console.log(`log ${this.logFence} ${level.priority}`);
      if (this.logFence <= level.priority)
        theFunction(this.logLevel, providerFunction(this.logLevel));
    };
  });

  let logLevel = logLevels[2];

  Object.defineProperty(object, 'logFence', {
    get: function () {
      return logLevel.priority;
    }
  });

  Object.defineProperty(object, 'logLevel', {
    get: function () {
      return logLevel.name;
    },
    set: function (level) {
      logLevel = findLevel(level);
    }
  });
};

function findLevel(level) {
  for (let l in logLevels) {
    if (logLevels[l].name === level)
      return logLevels[l];
  }

  return logLevels[2];
};
