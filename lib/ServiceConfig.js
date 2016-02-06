/* jslint node: true, esnext: true */
"use strict";

const endpoint = require('kronos-endpoint'),
	Service = require('./Service');

/*
 * Config providing service
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

		this.addEndpoint(new endpoint.ReceiveEndpoint('config', this)).receive = request => {
			const responses = [];

			Object.keys(request).forEach(name => {
				const service = owner.services[name];
				if (service && service !== this) {
					//console.log(`send config to ${service} ${JSON.stringify(request[name])} ${service.endpoints.config}`);
					responses.push(service.endpoints.config.receive(request[name]));
				} else {
					// TODO config for unknown service
					// should we store them and wait until such a service comes into place ?
					this.info({
						message: 'got config for unknown service',
						service: name
					});
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
