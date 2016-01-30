/* jslint node: true, esnext: true */
"use strict";

const rgm = require('./RegistryMixin');

/**
 * provide services and hold service configuration
 */

module.exports = (superclass) => class extends superclass {

	constructor(config) {
		super(config);
		rgm.defineRegistryProperties(this, 'serviceTemplate', {
			withCreateInstance: true,
			factoryType: 'new'
		});

		rgm.defineRegistryProperties(this, 'service', {
			hasBeenRegistered: service =>
				service.autostart ? service.start() : Promise.resolve(),
			willBeUnregistered: service => service.stop()
		});
	}

	declareService(name, derived, config) {
		let service = this.services[name];
		if (service === undefined) {
			// TODO no better way to specify name ?
			config.type = derived;
			const service = this.createServiceTemplateInstanceFromConfig(config);
			service.name = name;
			return this.registerService(service);
		}

		return service;
	}

};
