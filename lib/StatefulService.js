/* jslint node: true, esnext: true */

"use strict";

const stm = require('./StateTransitionMixin');
const lm = require('./LoggingMixin');

const actions = stm.prepareActions({
  start: {
    stopped: {
      target: "running",
      during: "starting",
      timeout: 10
    }
  },
  stop: {
    stopping: {
      target: "stopped",
      during: "stopping",
      timeout: 5
    },
    starting: {
      target: "stopped",
      during: "stopping",
      timeout: 10
    }
  }
});

// console.log(`actions: ${JSON.stringify(actions,null,1)}`);

class BaseService {
  constructor(name) {
    Object.defineProperty(this, 'name', {
      value: name
    });
  }

  toString() {
    return `${this.name}`;
  }

  log(level, args) {
    console.log(`${level} ${this}: ${args}`);
  }
}

stm.defineActionMethods(BaseService.prototype, actions);
lm.assignLoggerMethods(BaseService.prototype);

class LoggingBaseService extends lm.LogLevelMixin(BaseService) {}

class StatefullService extends stm.StateTransitionMixin(LoggingBaseService, actions, "stopped") {
  constructor(name, values) {
    super(name);

    const props = {};
    for (let key in values) {
      if (key !== 'name') {
        props[key] = {
          value: values[key]
        };
      }
    }
    Object.defineProperties(this, props);
  }
}


const s1 = new StatefullService('a name');

console.log(`logLevel: ${s1.logLevel}`);
s1.info(level => "info...");

s1.start().then(f => {
  console.log(`${s1} start() -> ${f}`);
});

console.log(`${s1.name}: ${s1.state} ${Object.keys(s1.actions)}`);
