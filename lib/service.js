/* jslint node: true, esnext: true */
"use strict";

const llm = require('loglevel-mixin'),
	stm = require('statetransition-mixin');

const actions = stm.prepareActions({
	start: {
		stopped: {
			target: "running",
			during: "starting",
			timeout: 5000
		}
	},
	stop: {
		running: {
			target: "stopped",
			during: "stopping",
			timeout: 5000
		},
		starting: {
			target: "stopped",
			during: "stopping",
			timeout: 5000
		}
	}
});

const BaseService = {

	/**
	 * To be overwritten
	 * Called when the state changes
	 * @param {String} oldState
	 * @param {String} newState
	 */
	stateChanged(oldState, newState) {
			this.trace(level => `${this} transitioned from ${oldState} -> ${newState}`);
		},

		/**
		 * Called when state transition is not allowed
		 * @param {String} action
		 * @return {Promise} rejecting with an Error
		 */
		rejectWrongState(action) {
			return Promise.reject(new Error(`Can't ${action} ${this} in ${this.state} state`));
		},

		/**
		 * Returns the string representation of this step
		 * @return {String} human readable name
		 */
		toString() {
			return this.name;
		},

		log(level, arg) {
			const logevent = {
				"timestamp": Date.now(),
				"level": level,
				"service": this.name,
				"service-state": this.state
			};

			if (typeof arg === 'string') {
				logevent.message = arg;
			} else {
				Object.assign(logevent, arg);
			}
			// TODO
			console.log(logevent);
		}
};

llm.defineLoggerMethods(BaseService, llm.defaultLogLevels);
stm.defineActionMethods(BaseService, actions);

/**
 * Create a new service
 * The initial state is 'stopped'
 * @param {String} name
 * @param {Object} values used to form the service
 * @param {Service} optional base service to use
 * @return {Service} newly created service
 */
exports.createService = function (name, values, baseService) {

	const props = {
		name: {
			value: name
		}
	};

	let logLevel = llm.defaultLogLevels.info;

	for (let key in values) {
		if (key === 'logLevel') {
			logLevel = llm.defaultLogLevels[values[key]] ||  llm.defaultLogLevels.info;
		} else if (key !== 'name') {
			props[key] = {
				value: values[key]
			};
		}
	}

	const service = Object.create(baseService ? baseService : BaseService, props);

	llm.defineLogLevelProperties(service, llm.defaultLogLevels, logLevel);
	stm.defineStateTransitionProperties(service, actions, "stopped");

	return service;
};
