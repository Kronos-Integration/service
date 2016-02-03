/* jslint node: true, esnext: true */
"use strict";

const endpoint = require('kronos-endpoint'),
	Service = require('./Service');

class ServiceConfig extends Service {
	static get name() {
		return "config";
	}

	get type() {
		return ServiceConfig.name;
	}

	constructor(config, serviceProvider) {
		super(config);

		this.addEndpoint(new endpoint.ReceiveEndpoint('config', this)).receive = request => {
			const responses = [];

			Object.keys(request).forEach(name => {
				const service = serviceProvider.services[name];
				if (service) {
					//console.log(`send config to ${service} ${JSON.stringify(request[name])} ${service.endpoints.config}`);
					responses.push(service.endpoints.config.receive(request[name]));
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
