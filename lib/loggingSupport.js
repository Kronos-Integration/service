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
 * @param {Object} target object where to assign properties tp
 * @param {Function} theFunction The function to be added under the loglevel name.
 *        This function will only be called if the current loglevel is greater equal
 *        the log level of the called logging function
 */
exports.assignLoggerFunctions = function (object, theFunction) {

  if (theFunction) {
    logLevels.forEach(level => {
      const myLevel = level.priority;
      object[level.name] = function (providerFunction) {
        if (logLevel.priority <= myLevel)
          theFunction(this.logLevel, providerFunction(this.logLevel));
      };
    });
  } else {
    logLevels.forEach(level => {
      const myLevel = level.priority;
      object[level.name] = function (providerFunction) {
        if (logLevel.priority <= myLevel)
          this.log(this.logLevel, providerFunction(this.logLevel));
      };
    });
  }

  let logLevel = logLevels[2];

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
