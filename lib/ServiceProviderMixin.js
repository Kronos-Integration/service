/* jslint node: true, esnext: true */
"use strict";

const rgm = require('registry-mixin');
const ServiceLogger = require('./ServiceLogger');
const ServiceConfig = require('./ServiceConfig');
const endpoint = require('kronos-endpoint');

/**
 * provide services and hold service configuration
 */
module.exports = (superclass) => class extends superclass {

	constructor(config) {
		super(config);

		// by default be aour own owner
		Object.defineProperty(this, 'owner', {
			value: this
		});

		const loggerService = new ServiceLogger({}, this);
		const configService = new ServiceConfig({}, this);

		rgm.defineRegistryProperties(this, 'serviceFactory', {
			pluralName: 'serviceFactories',
			withCreateInstance: true,
			factoryType: 'new'
		});

		rgm.defineRegistryProperties(this, 'service', {
			hasBeenRegistered: service => {
				// connect log endpoint to logger service
				const logger = this.services.logger;
				if (service.endpoints.log.isOut && logger) {
					service.endpoints.log.connected = logger.endpoints.log;
				}

				return service.autostart ? service.start() : Promise.resolve();
			},
			willBeUnregistered: service => service.stop()
		});

		// TODO: how to wait during startup until this promise has resolved ?
		// let our own logging go into the logger service
		this.registerService(loggerService).then(logger => this.log.connected = logger.endpoints.log);
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
			return this.registerService(this.createServiceFactoryInstanceFromConfig(config, this));
		}
		return service.configure(config).then(() => Promise.resolve(service));
	}
};
