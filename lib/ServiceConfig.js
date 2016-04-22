/* jslint node: true, esnext: true */
'use strict';

const endpoint = require('kronos-endpoint'),
	rgm = require('registry-mixin'),
	Service = require('./Service');

/**
 * Config providing service
 * Dispatches config requests to services
 * or preserves them for future use
 */
class ServiceConfig extends Service {
	static get name() {
		return 'config';
	}

	get type() {
		return ServiceConfig.name;
	}

	constructor(config, owner) {
		super(config, owner);

		rgm.defineRegistryProperties(this, 'preservedConfig', {});

		/**
		 * requests can be an array of config entries
		 */
		this.addEndpoint(new endpoint.ReceiveEndpoint('config', this)).receive = request => {
			if (!Array.isArray(request)) {
				request = [request];
			}

			const responses = [];

			request.forEach(entry => {
				const service = owner.services[entry.name];
				if (service && service !== this) {
					responses.push(service.endpoints.config.receive(entry));
				} else {
					this.registerPreservedConfig(entry);
				}
			});

			return Promise.all(responses);
		};
	}

	get autostart() {
		return true;
	}
}

module.exports = ServiceConfig;
