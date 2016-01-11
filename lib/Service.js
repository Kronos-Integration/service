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

class _Service {}

llm.defineLoggerMethods(_Service.prototype, llm.defaultLogLevels);
stm.defineActionMethods(_Service.prototype, actions, false);

/**
 * Create a new service
 * The initial state is 'stopped'
 * @param {String} name
 * @param {Object} values used to form the service
 * @param {Service} optional base service to use
 * @return {Service} newly created service
 */
class Service extends stm.StateTransitionMixin(llm.LogLevelMixin(_Service, llm.defaultLogLevels,
	llm.defaultLogLevels.info), actions, 'stopped') {

	static get type() {
		return "service";
	}
	get type() {
		return Service.type;
	}

	constructor(config) {
		super();

		let logLevel = llm.defaultLogLevels.info;

		if (config.logLevel) {
			logLevel = llm.defaultLogLevels[config.logLevel] || llm.defaultLogLevels.info;
		}
		llm.defineLogLevelProperties(this, llm.defaultLogLevels, logLevel);

		stm.defineStateTransitionProperties(this, actions, "stopped");
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

	/**
	 * Called when state transition is not allowed
	 * @param {String} action
	 * @return {Promise} rejecting with an Error
	 */
	rejectWrongState(action) {
		return Promise.reject(new Error(`Can't ${action} ${this} in ${this.state} state`));
	}

	/**
	 * Returns the string representation of this step
	 * @return {String} human readable name
	 */
	toString() {
		return this.name;
	}

	/**
	 * defaults to the type
	 */
	get name() {
		return this.type;
	}

	/**
	 * Should we start when beeing registered
	 * defaults to false
	 */
	get autostart() {
		return false;
	}

	reconfigure(config) {
		return Promise.resolve();
	}

	log(level, arg) {
		const logevent = llm.makeLogEvent(level, arg, {
			"service": this.name,
			"stervice-state": this.state
		});
		// TODO who to forward
		console.log(logevent);
	}
}

module.exports = Service;
