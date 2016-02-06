/* jslint node: true, esnext: true */
"use strict";

const endpoint = require('kronos-endpoint'),
	rgm = require('registry-mixin'),
	Service = require('./Service');

/*
 * Config providing service
 * dispatches config requests to services
 * or preserves them for future use 
 */
class ServiceConfig extends Service {
	static get name() {
		return "config";
	}

	get type() {
		return ServiceConfig.name;
	}

	constructor(config, owner) {
		super(config, owner);

		rgm.defineRegistryProperties(this, 'preservedConfig', {});

		this.addEndpoint(new endpoint.ReceiveEndpoint('config', this)).receive = request => {
			const responses = [];

			Object.keys(request).forEach(name => {
				const service = owner.services[name];
				if (service && service !== this) {
					//console.log(`send config to ${service} ${JSON.stringify(request[name])} ${service.endpoints.config}`);
					responses.push(service.endpoints.config.receive(request[name]));
				} else {
					this.trace({
						message: 'got config for unknown service',
						entry: name
					});

					this.registerPreservedConfig(config);
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
