/* jslint node: true, esnext: true */
"use strict";

const rgm = require('registry-mixin'),
	ServiceLogger = require('./ServiceLogger'),
	ServiceConfig = require('./ServiceConfig'),
	endpoint = require('kronos-endpoint');

/**
 * provide services and hold service configuration
 */
module.exports = (superclass) => class extends superclass {

	/**
	 * if config is an array entry 0 then entry 0 will be passed to super and all other entries
	 * are handed over as initial config to the config services
	 */
	constructor(config, owner) {
		super(Array.isArray(config) ? config[0] : config, undefined);

		// by default be our own owner
		Object.defineProperty(this, 'owner', {
			value: this
		});

		const loggerService = new ServiceLogger({}, this);
		const configService = new ServiceConfig({}, this);

		rgm.defineRegistryProperties(this, 'serviceFactory', {
			pluralName: 'serviceFactories',
			withCreateInstance: true,
			withEvents: true,
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

		// let our own logging go into the logger service
		this.registerService(loggerService);

		// TODO why do i need to recreate the log endpoint here ?
		this.addEndpoint(new endpoint.SendEndpoint('log', this)).connected = loggerService.endpoints.log;

		// register config service and let it know about the initial config
		this.registerService(configService);

		if (Array.isArray(config)) {
			config.forEach(entry => configService.registerPreservedConfig(entry));
		} else if (config !== undefined) {
			configService.registerPreservedConfig(config);
		}
	}

	/**
	 * Add a new service
	 * If a service for the name is already present then
	 * its configure() is called.
	 * Otherwise a new service will be created
	 * @param {Object} config with
	 *     name - the service name
	 *     type - the service factory name - defaults to config.name
	 * @param {boolean} waitUntilFactoryPresent waits until someone registers a matching service factory
	 * @return {Promise} resolving to the declared service
	 */
	declareService(config, waitUntilFactoryPresent) {
		const name = config.name;
		const service = this.services[name];

		if (service === undefined) {
			if (config.type === undefined) {
				config.type = name;
			}
			const type = config.type;

			if (this._declareServiceByNamePromises) {
				const p = this._declareServiceByNamePromises.get(name);

				if (p) {
					//console.log(`_declareServiceByNamePromises: -> ${name}`);
					return p;
				}
			} else {
				this._declareServiceByNamePromises = new Map();
			}

			const insertIntoDeclareByNamePromisesAndDeliver = () => {
				const p = this.registerService(this.createServiceFactoryInstanceFromConfig(config, this)).then(
					s => {
						//console.log(`_declareServiceByNamePromises: - ${name}`);
						this._declareServiceByNamePromises.delete(name);
						return Promise.resolve(s);
					});

				//console.log(`_declareServiceByNamePromises: + ${name}`);

				this._declareServiceByNamePromises.set(name, p);

				return p;
			};

			if (this.services.config) {
				const pc = this.services.config.preservedConfigs[name];
				if (pc) {
					Object.assign(config, pc);
				}
			}
			// service factory not present: wait until one arrives
			if (waitUntilFactoryPresent && !this.serviceFactories[type]) {
				if (this._declareServiceFactoryByTypePromises) {
					const p = this._declareServiceFactoryByTypePromises.get(type);
					if (p) {
						//console.log(`_declareServiceFactoryByTypePromises: -> ${type}`);
						return p;
					}
				} else {
					this._declareServiceFactoryByTypePromises = new Map();
				}

				const typePromise = new Promise((fullfill, reject) => {
					const listener = factory => {
						if (factory.name === type) {
							try {
								//console.log(`_declareServiceFactoryByTypePromises: - ${type}`);
								this._declareServiceFactoryByTypePromises.delete(type);
								this.removeListener('serviceFactoryRegistered', listener);
								return insertIntoDeclareByNamePromisesAndDeliver();
							} catch (e) {
								reject(e);
							}
						}
					};

					this.addListener('serviceFactoryRegistered', listener);
				});
				//console.log(`_declareServiceFactoryByTypePromises: + ${type}`);
				this._declareServiceFactoryByTypePromises.set(type, typePromise);
				return typePromise;
			}

			return insertIntoDeclareByNamePromisesAndDeliver();
		}

		delete config.type;

		const p = service.configure(config).then(() => Promise.resolve(service));
		this._declareServiceByNamePromises.set(name, p);

		return p;
	}

	replaceService(name, newService) {

		/*
		const oldService = this.services[name];
				if (oldService) {
					// TODO take over endpoints
				}
		*/

		return this.registerServiceAs(newService, name);
	}
};
