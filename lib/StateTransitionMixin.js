/* jslint node: true, esnext: true */

"use strict";

module.exports.prepareActions = function (as) {
  const actions = {};

  Object.keys(as).forEach(name => {
    const a = as[name];
    const ts = {};
    Object.keys(a).forEach(tn => {
      ts[tn] = a[tn];
      a[tn].name = tn;
    });
    actions[name] = {
      name: name,
      transitions: ts
    };
  });

  return actions;
};

module.exports.StateTransitionMixin = (superclass, actions, currentState) => class extends superclass {
  constructor(args) {
    super(args);
  }

  /**
   * Called when state action is not allowed
   * @param {Object} action
   * @return {Promise} rejecting with an Error
   */
  illegalStateTransition(action) {
    return Promise.reject(new Error(`Can't ${action.name} ${this} in ${this.state} state`));
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

  get actions() {
    return actions;
  }

  get state() {
    return currentState;
  }
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

module.exports.defineActionMethods = function (object, actions) {
  Object.keys(actions).forEach(actionName => {
    const action = actions[actionName];
    const privateActionName = '_' + actionName;

    Object.defineProperty(object, privateActionName, {
      value: function () {
        return Promise.resolve(this);
      }
    });

    Object.defineProperty(object, actionName, {
      value: function () {
        console.log(`${actionName}`);
        /*
        if (this.state === transition.during) {
          return this._transitionPromise;
        }
        if (this.state === transition.target) {
          return Promise.resolve(this);
        }*/

        if (action.transitions[this.state]) {
          return this._transitionPromise = this[privateActionName]().then(
            resolved => {
              this.state = transition.target;
              this._transitionPromise = undefined;
              return this;
            }, rejected => {
              this.error(level => `Executing ${transition.name} transition leads to ${rejected}`);

              this.state = 'failed';
              this._transitionPromise = undefined;
              return Promise.reject(reject);
            });
        } else {
          return this.rejectWrongState(action);
        }
      }
    });
  });
};

/*
function mixin(target, source) {
  target = target.prototype; source = source.prototype;

  Object.getOwnPropertyNames(source).forEach(function (name) {
    if (name !== "constructor") Object.defineProperty(target, name,
      Object.getOwnPropertyDescriptor(source, name));
  });
}
*/
