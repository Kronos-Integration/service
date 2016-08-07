/* jslint node: true, esnext: true */

'use strict';

const util = require('util'),
	endpoint = require('kronos-endpoint'),
	Service = require('./Service');

/**
 * Log receiving service
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
			const message = util.inspect(entry).replace(/[\n\r]*/g, '');
			if (entry.severity === 'error') {
				console.error(message);
			} else {
				console.log(message);
			}
			return Promise.resolve();
		};
	}

	get autostart() {
		return true;
	}
}

module.exports = ServiceLogger;
