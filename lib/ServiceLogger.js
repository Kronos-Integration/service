/* jslint node: true, esnext: true */

'use strict';

const endpoint = require('kronos-endpoint'),
	Service = require('./Service');

/**
 * Log reciving service
 */
class ServiceLogger extends Service {

	static get name() {
		return 'logger';
	}

	get type() {
		return ServiceLogger.name;
	}

	constructor(config, owner) {
		super(config, owner);

		this.addEndpoint(new endpoint.ReceiveEndpoint('log', this)).receive = entry => {
			try {
				console.log(JSON.stringify(entry));
			} catch (e) {
				console.log(`Unable to log entry with the following keys: ${Object.keys(entry)} ${e}`);
				return Promise.reject(e);
			}
			return Promise.resolve();
		};
	}

	get autostart() {
		return true;
	}
}

module.exports = ServiceLogger;
