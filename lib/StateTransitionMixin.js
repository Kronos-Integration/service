/* jslint node: true, esnext: true */

"use strict";


class State {
  constructor(name) {
    Object.defineProperty(this,'name',{ value: name });
    this._transitions = {};
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
    Object.defineProperty(this,'name',{ value: name });
    Object.defineProperty(this,'timeout',{ value: timeout || 0 });
    Object.defineProperty(this,'initialState',{ value: initialState });
    Object.defineProperty(this,'targetState',{ value: targetState });
    Object.defineProperty(this,'duringState',{ value: duringState });

    initialState.addTransition(this);
  }

  toString() {
    return `${this.name}: ${this.initialState} -> ${this.duringState} -> ${this.targetState} (${this.timeout})`;
  }
}

const StateTransitionMixin = (superclass,transitions,currentState) => class extends superclass {
  constructor(args) {
    super(args);
  }

  /**
   * Called when state transition is not allowed
   * @param {StateTransition} transition
   * @return {Promise} rejecting with an Error
   */
  illegalStateTransition(transition) {
    return Promise.reject(new Error(`Can't ${transition.name} ${this} in ${this.state} state`));
  }

  /**
	 * To be overwritten
	 * Called when the state changes
	 * @param {String} oldState
	 * @param {String} newState
	 */
	stateChanged(oldState, newState) {
			this.trace(level => `${this} transitioned from ${oldState} -> ${newState}`);
		}

  get transitions() { return transitions; }
  get state() { return currentState.name; }
};

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

module.exports.State = State;
module.exports.StateTransition = StateTransition;
module.exports.StateTransitionMixin = StateTransitionMixin;
