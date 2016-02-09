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

		// TODO: how to wait during startup until this promise has resolved ?
		// let our own logging go into the logger service
		this.registerService(loggerService).then(logger => this.log.connected = logger.endpoints.log);

		// register config service and let it know about the initial config
		this.registerService(configService).then(cs => cs.endpoints.config.receive(config));
	}

	/**
	 * add a new service
	 * If a server for the name is alredy present then
	 * its configure() is called.
	 * Otherwise a new service will be created
	 * @param config with
	 *     name - the service name
	 *     type - the service factory name
	 * @param waitUntilFactoryPresent waits until someone registers a matching service factory
	 * @return Promise resolving to the declared service
	 */
	declareService(config, waitUntilFactoryPresent) {
		const name = config.name;
		const service = this.services[name];
		let p;

		if (service === undefined) {
			if (this._declareServicePromises) {
				p = this._declareServicePromises.get(name);
				if (p) {
					this.info(`declareService: ${name} already running giving former promise`);
					return p;
				}
			} else {
				this._declareServicePromises = new Map();
			}

			const remover = f => {
				if (this._declareServicePromises.get(name)) {
					this.info(`declareService: ${name} remove promise`);
					this._declareServicePromises.delete(name);
				}
				return Promise.resolve(f);
			};

			// TODO mix with config that the config service may already have for us
			const pc = this.services.config.preservedConfigs[name];
			if (pc) {
				//TODO merge config ?
				console.log(`merge config: ${JSON.stringify(config)} + ${JSON.stringify(pc)}`);
				Object.assign(config, pc);
			}

			// service factory not present wait until one arrives
			if (waitUntilFactoryPresent && !this.serviceFactories[config.type]) {
				return new Promise((fullfill, reject) => {
					const listener = factroy => {
						if (factroy.name === config.type) {
							this.removeListener('serviceFactoryRegistered', listener);
							try {
								fullfill(this.registerService(
									this.createServiceFactoryInstanceFromConfig(config, this)).then(remover));
							} catch (e) {
								reject(e);
							}
						}
					};

					this.addListener('serviceFactoryRegistered', listener);
				});
			}

			return this.registerService(this.createServiceFactoryInstanceFromConfig(config, this)).then(remover);
		}

		delete config.type;

		p = service.configure(config).then(() => Promise.resolve(service));
		this._declareServicePromises.set(name, p);

		return p;
	}

	replaceService(name, newService) {
		const oldService = this.services[name];

		/*
				if (oldService) {
					// TODO take over endpoints
				}
		*/

		return this.registerServiceAs(newService, name);
	}
};
