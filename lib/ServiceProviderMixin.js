/* jslint node: true, esnext: true */
"use strict";

const rgm = require('./RegistrarMixin');

/**
 * provide services and hold service configuration
 */

module.exports = (superclass) => class extends superclass {

	constructor() {
		super();
		rgm.defineRegistrarProperties(this, 'service');
	}

	/**
	 * adds a pre configured service
	 */
	addService(service) {
		this.services[service.name] = service;
		if (service.autostart) {
			service.start();
		}

		return service;
	}
};
