/* jslint node: true, esnext: true */
"use strict";

const rgm = require('registry-mixin');
const ServiceLogger = require('./ServiceLogger');
const ServiceConfig = require('./ServiceConfig');

/**
 * provide services and hold service configuration
 */
module.exports = (superclass) => class extends superclass {

	constructor(config) {
		super(config);

		const loggerService = new ServiceLogger();
		const configService = new ServiceConfig({}, this);

		rgm.defineRegistryProperties(this, 'serviceFactory', {
			pluralName: 'serviceFactories',
			withCreateInstance: true,
			factoryType: 'new'
		});

		rgm.defineRegistryProperties(this, 'service', {
			hasBeenRegistered: service => {

				// connect log endpoint to logger service
				if (service.endpoints.log.isOut && this.services.logger) {
					//console.log(`hasBeenRegistered ${service} -> ${this.services.logger}`);
					service.endpoints.log.connected = this.services.logger.log;
				}

				return service.autostart ? service.start() : Promise.resolve();
			},
			willBeUnregistered: service => service.stop()
		});

		this.registerService(loggerService);
		this.registerService(configService);
	}

	/**
	 * add a new service
	 * If a server for the name is alredy present then
	 * its configure() is called.
	 * Otherwise a new service will be created
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
		return service.configure(config).then(() => Promise.resolve(service));
	}
};
