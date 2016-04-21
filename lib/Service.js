/* jslint node: true, esnext: true */
'use strict';

const events = require('events'),
	util = require('util'),
	llm = require('loglevel-mixin'),
	stm = require('statetransition-mixin'),
	EndpointsMixin = require('./EndpointsMixin'),
	endpoint = require('kronos-endpoint');

const actions = stm.prepareActions({
	start: {
		stopped: {
			target: 'running',
			during: 'starting',
			rejected: 'failed',
			timeout: 5000
		}
	},
	restart: {
		stopped: {
			target: 'running',
			during: 'starting',
			rejected: 'failed',
			timeout: 5000
		},
		running: {
			target: 'running',
			during: 'restarting',
			timeout: 5000
		}
	},
	stop: {
		running: {
			target: 'stopped',
			during: 'stopping',
			rejected: 'failed',
			timeout: 5000
		},
		starting: {
			target: 'stopped',
			during: 'stopping',
			rejected: 'failed',
			timeout: 5000
		},
		failed: {
			target: 'stopped',
			during: 'stopping',
			rejected: 'failed',
			timeout: 1000
		}
	}
});


class _Service extends events {}

llm.defineLoggerMethods(_Service.prototype, llm.defaultLogLevels);
stm.defineActionMethods(_Service.prototype, actions, false);

const dummyLogReceiver = new endpoint.ReceiveEndpoint('logReceiver', {
	endpointIdentifier(ep) {
		return undefined; // prevent target;
	}
});

dummyLogReceiver.receive = request => {
	console.log(request);
	return Promise.resolve();
};

/**
 * Service
 * The initial state is 'stopped'
 * All services have at least two endpoints:
 * - log out: log events
 * - config in: configuration request
 */
class Service extends EndpointsMixin(stm.StateTransitionMixin(llm.LogLevelMixin(_Service, llm.defaultLogLevels,
	llm.defaultLogLevels.info), actions, 'stopped')) {

	static get name() {
		return 'service';
	}
	get type() {
		return Service.name;
	}

	constructor(config, owner) {
		super();

		if (owner !== undefined) {
			Object.defineProperty(this, 'owner', {
				value: owner
			});
		}

		if (config === undefined) {
			config = {};
		} else {
			if (config.name) {
				const name = config.name;
				Object.defineProperty(this, 'name', {
					value: name
				});
				//delete config.name;
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


		stm.defineStateTransitionProperties(this, actions, 'stopped');

		this.addEndpoint(new endpoint.SendEndpointDefault('log', this)).connected = dummyLogReceiver;
		this.addEndpoint(new endpoint.ReceiveEndpointDefault('config', this)).receive = request => this.configure(request);

		this._configure(config);
	}

	/**
	 * Called when the service state changes.
	 * Emits a serviceStateChanged event to the owner
	 * @param {String} oldState
	 * @param {String} newState
	 */
	stateChanged(oldState, newState) {
		this.owner.emit('serviceStateChanged', this, oldState, newState);
		this.trace(level => `${this.name} transitioned from ${oldState} -> ${newState}`);
	}

	stateTransitionRejection(rejected, newState) {
		const p = super.stateTransitionRejection(rejected, newState);
		this.error(`${this.name} transition rejected ${rejected}`);
		return p;
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
	 * default implementation does a _stop() and a _start()
	 */
	_restart() {
		return this._stop().then(f => this._start());
	}

	/**
	 * Restarts if in running mode
	 * Otherwise does nothing
	 * @returns {Promise} resolves when restart is done (or immediate if no restart triggered)
	 */
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
		return `${this.name}: ${this.state}`;
	}

	toJSON() {
		return this.toJSONWithOptions({
			includeRuntimeInfo: false,
			includeDefaults: false
		});
	}

	/**
	 * Deliver json representation
	 * @param {Object} options
	 *  with the following flags:
	 *    includeRuntimeInfo - include runtime informtion like state
	 * @return {Object} json representation
	 */
	toJSONWithOptions(options) {
		const json = {
			name: this.name,
			type: this.type,
			endpoints: {}
		};

		if (options.includeRuntimeInfo) {
			json.state = this.state;
			json.logLevel = this.logLevel;
		}

		for (const endpointName in this.endpoints) {
			const ep = this.endpoints[endpointName];
			if (ep.isDefault) {
				if (options.includeDefaults) {
					json.endpoints[endpointName] = ep.toJSON();
				}
			} else {
				json.endpoints[endpointName] = ep.toJSON();
			}
		}

		return json;
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

	_configure(config) {
		if (config.logLevel) {
			const l = llm.defaultLogLevels[config.logLevel];
			if (l) {
				this.logLevel = l;
			}
		}
	}

	/**
	 * Use new configuration.
	 * Internlly calls _configure(config) as the constuctor does
	 * @param {Object} new config
	 * @return {Promise} fillfills when config is applied
	 */
	configure(config) {
		this._configure(config);
		return Promise.resolve();
	}

	log(level, arg) {
		this.endpoints.log.receive(llm.makeLogEvent(level, arg, {
			service: this.name
		}));
	}

	/**
	 * @return {String} separator between service name and endpoint name
	 **/
	get endpointParentSeparator() {
		return ':';
	}
}

module.exports = Service;
