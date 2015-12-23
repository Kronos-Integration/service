/* jslint node: true, esnext: true */

"use strict";


class State {
  constructor(name) {
    this._name = name;
    this._transitions = {};
  }

  get name() {
    return this._name;
  }

  get transitions() {
    return this._transitions;
  }

  toString() {
    return `${this.name}: ${Object.keys(this.transitions).join(',')}`;
  }

  addTransition(transition)
  {
    this._transitions[transition.name] = transition;
  }

  hasTransition(transition) {
    return this._transitions[transition.name] ? true : false;
  }
}

class StateTransition {
  constructor(name,initialState,targetState,duringState,timeout) {
    this._name = name;
    this._initialState = initialState;
    this._targetState = targetState;
    this._duringState = duringState;
    this._timeout = timeout || 0;

    initialState.addTransition(this);
  }

  get name() {
    return this._name;
  }

  get timeout() {
    return this._timeout;
  }

  get initialState() {
    return this._initialState;
  }

  get targetState() {
    return this._targetState;
  }

  get duringState() {
    return this._duringState;
  }

  toString() {
    return `${this.name}: ${this.initialState} -> ${this.duringState} -> ${this.targetState} (${this.timeout})`;
  }

}

function rejectUnlessResolvedWithin(promise, timeout) {
  if (timeout === 0) return promise;

  return new Promise(function (fullfill, reject) {
    const p = promise.then((fullfilled, rejected) => {
      fullfilled(this);
    });

    setTimeout(function () {
      reject(`Not resolved within ${timeout}s`);

    }, timeout * 1000);
  });
}

let transitionFunction = function (transition) {
  return function () {
    if (this.state.hasTransition(transition)) {

      this.state = transition.duringState;

      if (transition.timeout) {
        //console.log(`Guard ${transition.name} transition timeout ${transition.timeout}s`);
        this._transitionTimeoutID = setTimeout(() => {
          this._transitionTimeoutID = undefined;
          if (this._transitionPromise) {
            this.error(level => `${transition.name} transition timed out`);
            // TODO how to report
          }
        }, transition.timeout * 1000);
      }

      return this._transitionPromise = this['_' + transition.name]().then(
        resolved => {
          this.state = transition.targetState;
          this._transitionPromise = undefined;
          if (this._transitionTimeoutID) {
            clearTimeout(this._transitionTimeoutID);
            this._transitionTimeoutID = undefined;
          }

          return this;
        }, rejected => {
          this.error(level => `Executing ${transition.name} transition leads to ${rejected}`);

          this.state = 'failed';
          this._transitionPromise = undefined;

          if (this._transitionTimeoutID) {
            clearTimeout(this._transitionTimeoutID);
            this._transitionTimeoutID = undefined;
          }

          return Promise.reject(reject);
        }
      );
    }
    if (this.state === transition.duringState) {
      return this._transitionPromise;
    }
    if (this.state === transition.targetState) {
      return Promise.resolve(this);
    }

    return this.rejectWrongState(transition.name);
  };
};

const stopped = new State('stopped');
const starting = new State('starting');
const stopping = new State('stopping');
const running = new State('running');
const failed = new State('failed');
const removed = new State('removed');

//const states = new Set([stopped,starting,stopping,running,failed,removed]);

const states = [
  stopped,starting,stopping,running,failed,removed
];


const transitions = [
  new StateTransition('start',stopped,running,starting,10),
  new StateTransition('stop',running,stopping,stopped,  5),
  new StateTransition('stop',starting,stopping,stopped,10)
];


console.log(`transitions:\n  ${transitions.map( t => t.toString()).join('\n  ')}`);
console.log(`states:\n  ${states.map( t => t.toString()).join('\n  ')}`);
