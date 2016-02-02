/* jslint node: true, esnext: true */
"use strict";

const events = require('events'),
	util = require('util'),
	llm = require('loglevel-mixin'),
	stm = require('statetransition-mixin'),
	EndpointsMixin = require('./EndpointsMixin'),
	endpoint = require('kronos-endpoint');

const actions = stm.prepareActions({
	start: {
		stopped: {
			target: "running",
			during: "starting",
			timeout: 5000
		}
	},
	restart: {
		running: {
			target: "running",
			during: "restarting",
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


class _Service extends events {}

llm.defineLoggerMethods(_Service.prototype, llm.defaultLogLevels);
stm.defineActionMethods(_Service.prototype, actions, false);

const dummyLogReceiver = new endpoint.ReceiveEndpoint('logReceiver', {});

const resolvedPromise = Promise.resolve();
dummyLogReceiver.receive = request => {
	console.log(request);
	return resolvedPromise;
};

/**
 * Service
 * The initial state is 'stopped'
 * log out: log events
 * config in: configuration request
 */
class Service extends EndpointsMixin(stm.StateTransitionMixin(llm.LogLevelMixin(_Service, llm.defaultLogLevels,
	llm.defaultLogLevels.info), actions, 'stopped')) {

	static get name() {
		return "service";
	}
	get type() {
		return Service.name;
	}

	constructor(config) {
		super();

		if (config === undefined) {
			config = {};
		} else {
			if (config.name) {
				const name = config.name;
				Object.defineProperty(this, 'name', {
					value: name
				});
				delete config.name;
			}
		}

		Object.defineProperty(this, 'config', {
			value: config
		});

		let logLevel = llm.defaultLogLevels.info;

		if (config.logLevel) {
			logLevel = llm.defaultLogLevels[config.logLevel] || llm.defaultLogLevels.info;
		}
		llm.defineLogLevelProperties(this, llm.defaultLogLevels, logLevel);

		stm.defineStateTransitionProperties(this, actions, "stopped");

		this.addEndpoint(new endpoint.SendEndpoint('log', this)).connected = dummyLogReceiver;
		this.addEndpoint(new endpoint.ReceiveEndpoint('config', this)).receive = request => this.configure(request);
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

	_restart() {
		return this._stop().then(f => this.start());
	}

	restartIfRunning() {
		if (this.state === 'running') {
			return this.restart();
		}
		return Promise.resolve();
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

	/**
	 * use new configuration
	 */
	configure(config) {
		return Promise.resolve();
	}

	log(level, arg) {
		this.endpoints.log.receive(llm.makeLogEvent(level, arg, {
			"service": this.name,
			"service-state": this.state
		}));
	}
}

module.exports = Service;
