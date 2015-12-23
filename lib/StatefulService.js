/* jslint node: true, esnext: true */

"use strict";

const stm = require('./StateTransitionMixin');

const State = stm.State;
const StateTransition = stm.StateTransition;
const StateTransitionMixin = stm.StateTransitionMixin;

const stopped = new State('stopped');
const starting = new State('starting');
const stopping = new State('stopping');
const running = new State('running');
const failed = new State('failed');
const removed = new State('removed');

//const states = new Set([stopped,starting,stopping,running,failed,removed]);

const states = [
  stopped, starting, stopping, running, failed, removed
];


const transitions = [
  new StateTransition('start', stopped, running, starting, 10),
  new StateTransition('stop', running, stopping, stopped, 5),
  new StateTransition('stop', starting, stopping, stopped, 10)
];

/*
console.log(`transitions:\n  ${transitions.map( t => t.toString()).join('\n  ')}`);
console.log(`states:\n  ${states.map( t => t.toString()).join('\n  ')}`);
*/

class BaseService {
  constructor(name) {
    Object.defineProperty(this, 'name', {
      value: name
    });
  }

}

class StatefullService extends StateTransitionMixin(BaseService, transitions, running) {
  constructor(name) {
    super(name);
  }
}

const s1 = new StatefullService('a name');

console.log(`${s1.name}: ${s1.state} ${s1.transitions}`);
