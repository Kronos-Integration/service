/* jslint node: true, esnext: true */
"use strict";

const endpoint = require('kronos-endpoint'),
	Service = require('./Service');

/**
 * Log reciving service
 */
class ServiceLogger extends Service {

	static get name() {
		return "logger";
	}

	get type() {
		return ServiceLogger.name;
	}

	constructor(config) {
		super(config);

		this.addEndpoint(new endpoint.ReceiveEndpoint('log', this)).receive = entry => {
			console.log(entry);
			Promise.resolve();
		};
	}

	get autostart() {
		return true;
	}
}

module.exports = ServiceLogger;
