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

	constructor(config, owner) {
		super(config, owner);

		this.addEndpoint(new endpoint.ReceiveEndpoint('log', this)).receive = entry => {
			console.log(JSON.stringify(entry));
			Promise.resolve();
		};
	}

	get autostart() {
		return true;
	}
}

module.exports = ServiceLogger;
