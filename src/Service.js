/* jslint node: true, esnext: true */
'use strict';

const events = require('events'),
	safeStringify = require('fast-safe-stringify');

import EndpointsMixin from './EndpointsMixin';

import {
	ReceiveEndpoint, SendEndpointDefault, ReceiveEndpointDefault
}
from 'kronos-endpoint';

import {
	defaultLogLevels, defineLoggerMethods, defineLogLevelProperties, LogLevelMixin, makeLogEvent
}
from 'loglevel-mixin';

import {
	prepareActions, defineActionMethods, StateTransitionMixin, defineStateTransitionProperties
}
from 'statetransition-mixin';

import {
	createAttributes, getAttribute, setAttributes
}
from 'model-attributes';

const actions = prepareActions({
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

/**
 * Meta information for the config attributes.
 * - default optional default value of the attribute
 * - needsRestart optional modification requires a service restart
 * - setter(newValue,attrribute) optional function to be used if simple value assignment is not enough
 * The Service class only defines the logLevel attribute
 */
const _ca = createAttributes({
	logLevel: {
		description: `logging level one of: ${Object.keys(defaultLogLevels)}`,
		default: defaultLogLevels.info,
		type: 'string',
		setter(newValue) {
			if (newValue !== undefined) {
				const l = defaultLogLevels[newValue];
				if (l !== undefined) {
					this.logLevel = l;
					return true;
				}
			}
			return false;
		},
		getter() {
			return this.logLevel.name;
		}
	},
	timeout: {
		attributes: {
			start: {
				description: 'service start timeout',
				type: 'duration',
				default: 5
			}
		}
	}
});


class _Service extends events {}

defineLoggerMethods(_Service.prototype);
defineActionMethods(_Service.prototype, actions);

const dummyLogReceiver = new ReceiveEndpoint('logReceiver', {
	endpointIdentifier(ep) {
		return undefined; // prevent target;
	}
});

dummyLogReceiver.receive = entry => {
	if (entry.severity === 'error') {
		console.error(safeStringify(entry));
	} else {
		console.log(safeStringify(entry));
	}
	return Promise.resolve();
};

/**
 * Service
 * The initial state is 'stopped'
 * All services have at least two endpoints:
 * - log out: log events
 * - config in: configuration request
 */
export default class Service extends EndpointsMixin(StateTransitionMixin(LogLevelMixin(_Service), actions, 'stopped')) {

	static get name() {
		return 'service';
	}

	static get configurationAttributes() {
		return _ca;
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
			}
		}

		Object.defineProperty(this, 'config', {
			value: {}
		});

		defineLogLevelProperties(this, defaultLogLevels,
			config.logLevel !== undefined ? defaultLogLevels[config.logLevel] || defaultLogLevels.info :
			defaultLogLevels.info);

		defineStateTransitionProperties(this, actions, 'stopped');

		this.addEndpoint(new SendEndpointDefault('log', this)).connected = dummyLogReceiver;
		this.addEndpoint(new ReceiveEndpointDefault('config', this)).receive = request => this.configure(request);
		this.addEndpoint(new ReceiveEndpointDefault('command', this)).receive = request => this.execute(request);

		this._configure(config);
	}

	get configurationAttributes() {
		return this.constructor.configurationAttributes;
	}

	get type() {
		return this.constructor.name;
	}

	execute(command) {
		// TODO admin query language ?
		// for now we return the config
		const result = {
			name: this.name,
			state: this.state
		};

		const ca = this.configurationAttributes;

		for (const an in ca) {
			getAttribute(this, ca, an);
		}

		Promise.resolve(result);
	}

	/**
	 * Called when the service state changes.
	 * Emits a serviceStateChanged event to the owner
	 * @param {String} oldState
	 * @param {String} newState
	 */
	stateChanged(oldState, newState) {
		this.owner.emit('serviceStateChanged', this, oldState, newState);
		this.trace({
			message: 'transitioned',
			from: oldState,
			to: newState
		});
	}

	stateTransitionRejection(rejected, newState) {
		const p = super.stateTransitionRejection(rejected, newState);
		this.error({
			message: 'transition rejected',
			rejected: rejected,
			newState: newState
		});
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

	timeoutForTransition(transition) {
		if (transition.name.startsWith('start')) {
			return this.timeout.start * 1000;
		}

		return super.timeoutForTransition(transition);
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
			includeDefaults: false,
			includeConfig: false
		});
	}

	/**
	 * Deliver json representation
	 * @param {Object} options
	 *  with the following flags:
	 *    includeRuntimeInfo - include runtime informtion like state
	 *    includeDefaults - also include default endpoints
	 *    includeConfig - also include config attributes
	 * @return {Object} json representation
	 */
	toJSONWithOptions(options = {}) {
		const json = {
			name: this.name,
			type: this.type,
			endpoints: {}
		};

		if (options.includeRuntimeInfo) {
			json.state = this.state;
		}

		if (options.includeConfig) {
			const ca = this.configurationAttributes;
			Object.keys(ca).forEach(name => {
				json[name] = this[name];
			});
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

	/**
	 * Takes attribute values from config parameters
	 * and copies them over to the object.
	 * Copying is done according to configurationAttributes
	 * Which means we loop over all configuration attributes
	 * and then for each attribute decide if we use the default, call a setter function
	 * or simply assign the attribute value
	 * @param {Object} config
	 * @return {Set} of modified attributes
	 */
	_configure(config) {
		const modified = new Set();
		setAttributes(this, this.configurationAttributes, config, (ca, path, value) => {
			this.trace({
				message: 'config',
				attribute: path,
				value: value
			});
			modified.add(ca);
		});
		return modified;
	}

	/**
	 * Use new configuration.
	 * Internally calls _configure(config) as the constructor does
	 * If attribute with needsRestart are touched the restartIfRunning method
	 * will be called
	 * @param {Object} new config
	 * @return {Promise} fillfills when config is applied
	 */
	configure(config) {
		const modified = this._configure(config);

		for (const a of modified) {
			if (a.needsRestart) {
				return this.restartIfRunning();
			}
		}

		return Promise.resolve();
	}

	/**
	 * Adds service name to the log event
	 */
	log(level, arg) {
		this.endpoints.log.receive(makeLogEvent(level, arg, {
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
