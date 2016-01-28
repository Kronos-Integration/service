/* jslint node: true, esnext: true */
"use strict";

const rgm = require('./RegistryMixin');

/**
 * provide services and hold service configuration
 */

module.exports = (superclass) => class extends superclass {

	constructor(config) {
		super(config);
		rgm.defineFactoryRegistryProperties(this, 'service', 'new');
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

	declareService(name, derived, config) {
		const service = this.services[name];
		if (service === undefined) {
			// TODO no better way to specify name ?
			config.name = name;
			return this.addService(this.createServiceInstance(derived, config));
		}

		return service;
	}
};
