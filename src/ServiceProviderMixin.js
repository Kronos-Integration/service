/* jslint node: true, esnext: true */
'use strict';

import {
	defineRegistryProperties
}
from 'registry-mixin';

import ServiceLogger from './ServiceLogger';
import ServiceConfig from './ServiceConfig';

/**
 * Provide services and hold service configuration.
 * By default a service provider has two build in services
 * 'logger' and 'config'.
 */
export default function ServiceProviderMixin(superclass) {
	return class extends superclass {
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

			this.endpoints.log.connected = loggerService.endpoints.log;
			configService.endpoints.log.connected = loggerService.endpoints.log;

			defineRegistryProperties(this, 'serviceFactory', {
				pluralName: 'serviceFactories',
				withCreateInstance: true,
				withEvents: true,
				factoryType: 'new'
			});

			defineRegistryProperties(this, 'service', {
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

			// register config service and let it know about the initial config
			this.registerService(configService);

			if (Array.isArray(config)) {
				config.forEach(entry => configService.registerPreservedConfig(entry));
			} else if (config !== undefined) {
				configService.registerPreservedConfig(config);
			}

			this.registerService(this);
		}

		execute(command) {
			if (Array.isArray(command)) {
				return Promise.all(command.map(c => this.execute(c)));
			}

			if (command.action === 'list') {
				return Promise.resolve(Object.keys(this.services).map(name => this.services[name]).map(s => s.toJSONWithOptions(
					command.options)));
			}

			const service = this.services[command.service];

			if (!service) {
				return Promise.reject(new Error(`Unknown service: ${command.service}`));
			}

			switch (command.action) {
				case 'get':
					return Promise.resolve(service.toJSONWithOptions(command.options));

				case 'start':
					return service.start();

				case 'stop':
					return service.stop();

				case 'restart':
					return service.restart();

				default:
					return Promise.reject(new Error(`Unknown command: ${command.action}`));
			}
		}

		insertIntoDeclareByNamePromisesAndDeliver(config, name, type) {
			const p = this.registerService(this.createServiceFactoryInstanceFromConfig(config, this)).then(
				service => {
					this._declareServiceByNamePromises.delete(name);
					return Promise.resolve(service);
				});

			this._declareServiceByNamePromises.set(name, p);

			return p;
		}

		/**
		 * Add a new service based on its configuration
		 * If a service for the name is already present and it has a matching type
		 * then its configure() is called and then returned.
		 * Otherwise a new service will be created eventually replacing an already existing service with the same name.
		 * @param {Object} config with
		 *     name - the service name
		 *     type - the service factory name - defaults to config.name
		 * @param {boolean} waitUntilFactoryPresent waits until someone registers a matching service factory
		 * @return {Promise} resolving to the declared service
		 */
		declareService(config, waitUntilFactoryPresent) {
			const name = config.name;
			const service = this.services[name];

			/*
					if (config.type === undefined) {
						config.type = name;
					}
			*/

			const type = config.type;

			if (service === undefined || (type !== undefined && service.type !== type)) {
				if (this._declareServiceByNamePromises) {
					const p = this._declareServiceByNamePromises.get(name);

					if (p) {
						return p;
					}
				} else {
					this._declareServiceByNamePromises = new Map();
				}

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
							return p;
						}
					} else {
						this._declareServiceFactoryByTypePromises = new Map();
					}

					const typePromise = new Promise((fullfill, reject) => {
						const listener = factory => {
							if (factory.name === type) {
								this._declareServiceFactoryByTypePromises.delete(type);
								this.removeListener('serviceFactoryRegistered', listener);
								fullfill(factory);
							}
						};

						this.addListener('serviceFactoryRegistered', listener);
					});

					this._declareServiceFactoryByTypePromises.set(type, typePromise);

					return typePromise.then(() => this.insertIntoDeclareByNamePromisesAndDeliver(config, name, type));
				}

				return this.insertIntoDeclareByNamePromisesAndDeliver(config, name, type);
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

		/**
		 * Stop all services
		 * @return {Promise} that fullfills when all services are stopped
		 */
		_stop() {
			return super._stop().then(Promise.all(Object.keys(this.services).map(name => this.services[name].stop())));
		}
	};
}
