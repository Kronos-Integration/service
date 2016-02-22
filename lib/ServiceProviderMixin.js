/* jslint node: true, esnext: true */
"use strict";

const rgm = require('registry-mixin');
const ServiceLogger = require('./ServiceLogger');
const ServiceConfig = require('./ServiceConfig');
const endpoint = require('kronos-endpoint');

//let seq = 0;

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
	 * If a service for the name is alredy present then
	 * its configure() is called.
	 * Otherwise a new service will be created
	 * @param config with
	 *     name - the service name
	 *     type - the service factory name
	 * @param waitUntilFactoryPresent waits until someone registers a matching service factory
	 * @return Promise resolving to the declared service
	 */
	declareService(config, waitUntilFactoryPresent) {
		//		seq++;

		const name = config.name;
		const service = this.services[name];

		//		console.log(`${seq} *A ${JSON.stringify(config)}`);

		if (service === undefined) {
			if (this._declareServicePromises) {
				//				console.log(`${seq} *B1 ${name}`);

				const p = this._declareServicePromises.get(name);
				if (p) {
					//					console.log(`${seq} *B2 ${name}`);

					return p;
				}
			} else {
				this._declareServicePromises = new Map();
			}
			//			console.log(`${seq} *B3 ${name}`);

			const insertIntoDeclarePromisesAndDeliver = () => {
				//				console.log(`${seq} A ${name}`);
				const p = this.registerService(this.createServiceFactoryInstanceFromConfig(config, this)).then(
					s => {
						this._declareServicePromises.delete(name);
						//						console.log(`${seq} B ${name} -> ${s}`);
						return Promise.resolve(s);
					});

				//				console.log(`${seq} C ${name}`);

				this._declareServicePromises.set(name, p);
				return p;
			};

			if (this.services.config) {
				const pc = this.services.config.preservedConfigs[name];
				if (pc) {
					Object.assign(config, pc);
				}
			}
			// service factory not present: wait until one arrives
			if (waitUntilFactoryPresent && !this.serviceFactories[config.type]) {
				return new Promise((fullfill, reject) => {
					const listener = factroy => {
						if (factroy.name === config.type) {
							try {
								this.removeListener('serviceFactoryRegistered', listener);
								return insertIntoDeclarePromisesAndDeliver();
							} catch (e) {
								reject(e);
							}
						}
					};

					this.addListener('serviceFactoryRegistered', listener);
				});
			}

			return insertIntoDeclarePromisesAndDeliver();
		}

		delete config.type;

		const p = service.configure(config).then(() => Promise.resolve(service));
		this._declareServicePromises.set(name, p);

		//		console.log(`${seq} *C ${name} -> ${service}`);

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
