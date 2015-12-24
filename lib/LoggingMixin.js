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
exports.assignLoggerMethods = function (object, theFunction) {

  const properties = {};

  logLevels.forEach(level => {
    const myLevel = level.priority;
    const levelName = level.name;
    properties[levelName] = {
      value: theFunction ?
        function (providerFunction) {
          if (this.logLevelPriority <= myLevel)
            theFunction(levelName, providerFunction(levelName));
        } : function (providerFunction) {
          if (this.logLevelPriority <= myLevel)
            this.log(levelName, providerFunction(levelName));
        }
    };
  });

  Object.defineProperties(object, properties);
};


/**
 * Declares two properties:
 *  logLevel {String} 'info','error',...
 *  logLevelPriority {Number}
 * @param {Object} properties target object where the properties will be written into
 * @param {String} defaultLogLevel the default value for the properties
 */
module.exports.LogLevelMixin = (superclass) => class extends superclass {
  constructor() {
    super();
    this._logLevel = findLevel('info');
  }

  get logLevel() {
    return this._logLevel.name;
  }
  set logLevel(level) {
    this._logLevel = findLevel(level);
  }
  get logLevelPriority() {
    console.log(`${this._logLevel.name}`);
    return this._logLevel.priority;
  }
};

function findLevel(level) {
  const ll = logLevels.find(l => l.name === level);
  return ll ? ll : logLevels[2];
};
