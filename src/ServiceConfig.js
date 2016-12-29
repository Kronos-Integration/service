/* jslint node: true, esnext: true */
'use strict';

import {
	defineRegistryProperties
}
from 'registry-mixin';

import {
	ReceiveEndpoint
}
from 'kronos-endpoint';

import Service from './Service';

/**
 * Config providing service
 * Dispatches config requests to services
 * or preserves them for future use
 */
export default class ServiceConfig extends Service {
	static get name() {
		return 'config';
	}

	constructor(config, owner) {
		super(config, owner);

		defineRegistryProperties(this, 'preservedConfig', {});

		/**
		 * requests can be an array of config entries
		 */
		this.addEndpoint(new ReceiveEndpoint('config', this)).receive = request => {
			if (!Array.isArray(request)) {
				request = [request];
			}

			const responses = [];

			request.forEach(entry => {
				const service = owner.services[entry.name];
				if (service !== undefined && service !== this) {
					responses.push(service.endpoints.config.receive(entry));
				} else {
					this.registerPreservedConfig(entry);
				}
			});

			return Promise.all(responses);
		};
	}

	get autostart() {
		return true;
	}
}
