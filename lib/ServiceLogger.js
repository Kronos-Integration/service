/* jslint node: true, esnext: true */

'use strict';

const safeStringify = require('fast-safe-stringify'),
	endpoint = require('kronos-endpoint'),
	Service = require('./Service');

/**
 * Log receiving service
 */
class ServiceLogger extends Service {

	static get name() {
		return 'logger';
	}

	constructor(config, owner) {
		super(config, owner);

		this.addEndpoint(new endpoint.ReceiveEndpoint('log', this)).receive = entry => {
			if (entry.severity === 'error') {
				console.error(safeStringify(entry));
			} else {
				console.log(safeStringify(entry));
			}
			return Promise.resolve();
		};
	}

	get autostart() {
		return true;
	}
}

module.exports = ServiceLogger;
