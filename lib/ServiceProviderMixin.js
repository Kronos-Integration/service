/* jslint node: true, esnext: true */
"use strict";

const rgm = require('registry-mixin');

/**
 * provide services and hold service configuration
 */

module.exports = (superclass) => class extends superclass {

	constructor(config) {
		super(config);
		rgm.defineRegistryProperties(this, 'serviceFactory', {
			pluralName: 'serviceFactories',
			withCreateInstance: true,
			factoryType: 'new'
		});

		rgm.defineRegistryProperties(this, 'service', {
			hasBeenRegistered: service => service.autostart ? service.start() : Promise.resolve(),
			willBeUnregistered: service => service.stop()
		});
	}

	/**
	 * add a new service
	 * If a server for the name is alredy present then
	 * its reconfigure() is called. Otherwise a new service will
	 * be created
	 * @param config with
	 *     name - the service name
	 *     type - the service factory name
	 * @return Promise resolving to the declared service
	 */
	declareService(config) {
		const service = this.services[config.name];
		if (service === undefined) {
			return this.registerService(this.createServiceFactoryInstanceFromConfig(config));
		}
		return service.reconfigure(config).then(() => Promise.resolve(service));
	}
};
