import ServiceLogger from "./service-logger.mjs";
import ServiceConfig from "./service-config.mjs";
import { InitializationContext } from "./initialization-context.mjs";

/**
 * Provide services and hold service configuration.
 * By default a service provider has two build in services
 * 'logger' and 'config'.
 *
 * @param {Class} serviceLoggerClass where the logging houtd go
 * @param {Class} serviceConfigClass where the config comes from
 */
export default function ServiceProviderMixin(
  superclass,
  serviceLoggerClass = ServiceLogger,
  serviceConfigClass = ServiceConfig
) {
  return class ServiceProvider extends superclass {
    constructor(config) {
      const ic = new InitializationContext();

      super(Array.isArray(config) ? config[0] : config, ic);

      /*
      console.log("ENDPOINTS   1", Object.values(this.endpoints).map(e => `${e}`));
      console.log("OUTSTANDING 1", [...ic.outstandingEndpointConnections.entries()].map(([e,c])=> `${e.identifier} <> ${c}`));
      */

      ic.logLevel = this.logLevel;
      ic.serviceProvider = this;

      Object.defineProperties(this, {
        serviceFactories: { value: {} },
        services: { value: {} },
        _declareServiceByNamePromises: { value: new Map() },
        _serviceFactoryPromises: { value: new Map() }
      });

      // let our own logging go into the logger service
      const loggerService = new serviceLoggerClass(undefined, ic);
      this.registerService(loggerService);

      /*
      console.log("ENDPOINTS   2", Object.values(loggerService.endpoints).map(e => `${e}`));
      console.log("OUTSTANDING 2", [...ic.outstandingEndpointConnections.entries()].map(([e,c])=> `${e.identifier} <> ${c}`));
      */

      // register config service and let it know about the initial config
      const configService = new serviceConfigClass(undefined, ic);

      this.registerService(configService);

      /*
      console.log(
        "ENDPOINTS   3",
        Object.values(configService.endpoints).map(e => `${e}`)
      );
      console.log(
        "OUTSTANDING 3",
        [...ic.outstandingEndpointConnections.entries()].map(
          ([e, c]) => `${e.identifier} <> ${c}`
        )
      );
      */

      this.registerService(this);

      ic.resolveOutstandingEndpointConnections();

      configService.configure(config);
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

    async registerServiceFactory(factory) {
      this.serviceFactories[factory.name] = factory;
      this.emit("serviceFactoryRegistered", factory);
      return factory;
    }

    async unregisterServiceFactory(factory) {
      delete this.serviceFactories[factory.name];
    }

    createService(config, ic) {
      const Clazz =
        config.type instanceof Function
          ? config.type
          : this.serviceFactories[config.type];
      return new Clazz(config, ic);
    }

    async registerService(service) {
      this.services[service.name] = service;

      if (service.autostart) {
        return service.start();
      }

      return service;
    }

    async unregisterService(serviceName) {
      const service = this.services[serviceName];

      await service.stop();
      delete this.services[serviceName];
    }

    get serviceNames() {
      return this.services === undefined
        ? []
        : Object.keys(this.services).sort();
    }

    getService(name) {
      return this.services && this.services[name];
    }

    async insertIntoDeclareByNamePromisesAndDeliver(config, name, ic) {
      const servicePromise = this.registerService(
        this.createService(config, ic)
      );
      this._declareServiceByNamePromises.set(name, servicePromise);
      const service = await servicePromise;
      this._declareServiceByNamePromises.delete(name);
      return service;
    }

    /**
     *
     * @param {string|class} type name if type
     * @param {boolean} wait until factory apears in registry
     */
    async getServiceFactory(type, wait) {
      if (type instanceof Function) {
        const factory = this.serviceFactories[type.name];
        if (factory !== undefined) {
          return factory;
        }
        return this.registerServiceFactory(type);
      }

      const factory = this.serviceFactories[type];

      if (!factory && wait) {
        const p = this._serviceFactoryPromises.get(type);
        if (p !== undefined) {
          return p;
        }

        const typePromise = new Promise((resolve, reject) => {
          const listener = factory => {
            if (factory.name === type) {
              this._serviceFactoryPromises.delete(type);
              this.removeListener("serviceFactoryRegistered", listener);
              resolve(factory);
            }
          };

          this.addListener("serviceFactoryRegistered", listener);
        });

        this._serviceFactoryPromises.set(type, typePromise);

        await typePromise;
      }

      return factory;
    }

    async declareService(config, ...args) {
      const name = config.name;
      const services = await this.declareServices({ [name]: config }, ...args);
      return services[0];
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
    async declareServices(configs, waitUntilFactoryPresent) {
      const ic = new InitializationContext(this);

      const services = [];

      for (const [name, config] of Object.entries(configs)) {
        config.name = name;
        const type = config.type;
        const service = this.services[name];

        if (
          service === undefined ||
          (type !== undefined && service.type !== type)
        ) {
          const p = this._declareServiceByNamePromises.get(name);

          if (p !== undefined) {
            services.push(p);
            continue;
          }

          if (this.services.config) {
            const pc = this.services.config.preservedConfigs.get(name);
            if (pc !== undefined) {
              Object.assign(config, pc);
            }
          }

          // service factory not present: wait until one arrives

          await this.getServiceFactory(type, waitUntilFactoryPresent);

          services.push(
            this.insertIntoDeclareByNamePromisesAndDeliver(config, name, ic)
          );
          continue;
        }

        delete config.type;

        const configPromise = service.configure(config);

        //this._declareServiceByNamePromises.set(name, configPromise.then( x => service));

        await configPromise;

        services.push(service);
      }

      ic.resolveOutstandingEndpointConnections();

      return Promise.all(services);
    }

    /**
     * start all registered services which hangin autostart set
     */
    async _start() {
      await super._start();

      return Promise.all(
        Object.values(this.services)
          .filter(service => service !== this && service.autostart)
          .map(s => s.start())
      );
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
