/* jslint node: true, esnext: true */
"use strict";

/**
 * provide services
 */

const ServiceProviderMixin = (superclass) => class extends superclass {

	constructor() {

		this._services = {};
	}


	serviceConfiguration(configs) {

	}

	registerService(factory) {

	}

	/**
	 * adds a pre cosngured service
	 */
	addService(service) {
		this._services[service.name] = service;
		if (service.autostart) {
			return servise.start();
		}

		return Promise.resolve();
	}

	get services() {
		return this._services;
	}
}

module.exports = ServiceProviderMixin;
