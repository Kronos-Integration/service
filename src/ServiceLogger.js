/* jslint node: true, esnext: true */

'use strict';

const safeStringify = require('fast-safe-stringify');

import {
	ReceiveEndpoint
}
from 'kronos-endpoint';

import {
	Service
}
from './Service';

/**
 * Log receiving service
 */
class ServiceLogger extends Service {

	static get name() {
		return 'logger';
	}

	constructor(config, owner) {
		super(config, owner);

		this.addEndpoint(new ReceiveEndpoint('log', this)).receive = entry => {
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

export {
	ServiceLogger
};
