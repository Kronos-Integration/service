/* jslint node: true, esnext: true */
"use strict";

const endpoint = require('kronos-endpoint'),
	Service = require('./Service');

class ServiceLogger extends Service {

	static get name() {
		return "logger";
	}
	get type() {
		return ServiceLogger.name;
	}

	constructor(config) {
		super(config);

		this.addEndpoint(new endpoint.ReceiveEndpoint('log', this)).receiver = entry => {
			console.log(entry);
			Promise.resolve();
		};
	}
}

module.exports = ServiceLogger;
