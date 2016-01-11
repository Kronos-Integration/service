/* jslint node: true, esnext: true */
"use strict";

const rgm = reuire('./RegistrarMixin');

/**
 * provide services
 */

const ServiceProviderMixin = (superclass) => class extends superclass {

	constructor() {
		super();
		rgm.defineRegistrarProperties(this, 'Service', 'services');
	}


	serviceConfiguration(configs) {

	}

	/**
	 * adds a pre cosngured service
	 */
	addService(service) {
		this.services[service.name] = service;
		if (service.autostart) {
			return servise.start();
		}

		return Promise.resolve();
	}
}

module.exports = ServiceProviderMixin;
