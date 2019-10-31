import { defineRegistryProperties } from "registry-mixin";
import ServiceLogger from "./service-logger.mjs";
import ServiceConfig from "./service-config.mjs";

/**
 * Provide services and hold service configuration.
 * By default a service provider has two build in services
 * 'logger' and 'config'.
 *
 * @param serviceLoggerClass
 * @param serviceConfigClass
 */
export default function ServiceProviderMixin(
  superclass,
  serviceLoggerClass = ServiceLogger,
  serviceConfigClass = ServiceConfig
) {
  return class ServiceProvider extends superclass {
    constructor(config) {
      super(Array.isArray(config) ? config[0] : config, undefined);

      /*
      Object.defineProperties(this, {
        services: { value: {} }
      });
*/
      const loggerService = new serviceLoggerClass({}, this);
      const configService = new serviceConfigClass({}, this);

      this.endpoints.log.connected = loggerService.endpoints.log;
      configService.endpoints.log.connected = loggerService.endpoints.log;

      defineRegistryProperties(this, "serviceFactory", {
        pluralName: "serviceFactories",
        withCreateInstance: true,
        withEvents: true,
        factoryType: "new"
      });

      defineRegistryProperties(this, "service", {
        hasBeenRegistered: async service => {
          // connect log endpoint to logger service
          const logger = this.services.logger;
          if (service.endpoints.log.isOut && logger) {
            service.endpoints.log.connected = logger.endpoints.log;
          }
          if(service.autostart) { return service.start(); }
        },
        willBeUnregistered: service => service.stop()
      });

      // let our own logging go into the logger service
      this.registerService(loggerService);

      // register config service and let it know about the initial config
      this.registerService(configService);
      
      configService.configure(config);

      this.registerService(this);
    }

    async execute(command) {
      if (Array.isArray(command)) {
        return Promise.all(command.map(c => this.execute(c)));
      }

      if (command.action === "list") {
        return Object.keys(this.services)
          .map(name => this.services[name])
          .map(s =>
            command.options ? s.toJSONWithOptions(command.options) : s.toJSON()
          );
      }

      const service = this.services[command.service];

      if (service === undefined) {
        throw new Error(`Unknown service: ${command.service}`);
      }

      switch (command.action) {
        case "get":
          return service.toJSONWithOptions(command.options);

        case "start":
          return service.start();

        case "stop":
          return service.stop();

        case "restart":
          return service.restart();

        default:
          throw new Error(`Unknown command: ${command.action}`);
      }
    }

    /** be default be our own owner */
    get owner() {
      return this;
    }

    /*
    async registerService(service) {
      this.services[service.name] = service;
      // connect log endpoint to logger service
      const logger = this.services.logger;
      if (service.endpoints.log.isOut && logger) {
        service.endpoints.log.connected = logger.endpoints.log;
      }

      if (service.autostart) {
        return service.start();
      }
    }

    async unregisterService(service) {
      delete this.services[service.name];
      await service.stop();
    }
*/

    async insertIntoDeclareByNamePromisesAndDeliver(config, name, type) {
      const p = this.registerService(
        this.createServiceFactoryInstanceFromConfig(config, this)
      ).then(service => {
        this._declareServiceByNamePromises.delete(name);
        return Promise.resolve(service);
      });

      this._declareServiceByNamePromises.set(name, p);

      return p;
    }

    /**
     * Add a new service based on its configuration
     * If a service for the name is already present and it has a matching type
     * then its configure() is called and returned.
     * Otherwise a new service will be created eventually replacing an already existing service with the same name.
     * @param {object} config with
     *     name - the service name
     *     type - the service factory name - defaults to config.name
     * @param {boolean} waitUntilFactoryPresent waits until someone registers a matching service factory
     * @return {Promise} resolving to the declared service
     */
    async declareService(config, waitUntilFactoryPresent) {
      const name = config.name;
      const service = this.services[name];

      /*
					if (config.type === undefined) {
						config.type = name;
					}
			*/

      const type = config.type;

      if (
        service === undefined ||
        (type !== undefined && service.type !== type)
      ) {
        if (this._declareServiceByNamePromises) {
          const p = this._declareServiceByNamePromises.get(name);

          if (p !== undefined) {
            return p;
          }
        } else {
          this._declareServiceByNamePromises = new Map();
        }

        if (this.services.config) {
          const pc = this.services.config.preservedConfigs.get(name);
          if (pc !== undefined) {
            Object.assign(config, pc);
          }
        }

        // service factory not present: wait until one arrives
        if (waitUntilFactoryPresent && !this.serviceFactories[type]) {
          if (this._declareServiceFactoryByTypePromises) {
            const p = this._declareServiceFactoryByTypePromises.get(type);
            if (p !== undefined) {
              return p;
            }
          } else {
            this._declareServiceFactoryByTypePromises = new Map();
          }

          const typePromise = new Promise((resolve, reject) => {
            const listener = factory => {
              if (factory.name === type) {
                this._declareServiceFactoryByTypePromises.delete(type);
                this.removeListener("serviceFactoryRegistered", listener);
                resolve(factory);
              }
            };

            this.addListener("serviceFactoryRegistered", listener);
          });

          this._declareServiceFactoryByTypePromises.set(type, typePromise);

          await typePromise;
        }

        return this.insertIntoDeclareByNamePromisesAndDeliver(
          config,
          name,
          type
        );
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
     * @return {Promise} that resolves when all services are stopped
     */
    async _stop() {
      await super._stop();

      return Promise.all(
        Object.values(this.services)
          .filter(service => service !== this)
          .map(s => s.stop())
      );
    }
  };
}
