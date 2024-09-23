import { Interceptor } from "@kronos-integration/interceptor";
import { Service } from "./service.mjs";
import { ServiceLogger } from "./service-logger.mjs";
import { ServiceConfig } from "./service-config.mjs";
import { InitializationContext } from "./initialization-context.mjs";

/**
 * Provide services and hold service configuration.
 * By default a service provider has two build in services
 * 'logger' and 'config'.
 *
 * @param {new(Object,InitializationContext) => serviceLoggerClass} serviceLoggerClass where the logging houtd go
 * @param {new(Object,InitializationContext) => serviceConfigClass} serviceConfigClass where the config comes from
 */
export function ServiceProviderMixin(
  superclass,
  serviceLoggerClass = ServiceLogger,
  serviceConfigClass = ServiceConfig
) {
  return class ServiceProvider extends superclass {
    listeners = {};
    interceptorFactories = {};
    serviceFactories = {};
    services = {};

    constructor(config, ic = new InitializationContext()) {
      super(Array.isArray(config) ? config[0] : config, ic);

      this.ic = ic;

      ic.logLevel = this.logLevel;
      ic.serviceProvider = this;

      this.registerFactories([serviceConfigClass, serviceLoggerClass]);

      // let our own logging go into the logger service
      const loggerService = new serviceLoggerClass(undefined, ic);
      this.registerService(loggerService);

      // register config service and let it know about the initial config
      const configService = new serviceConfigClass(undefined, ic);
      this.registerService(configService);

      this.registerService(this);
      ic.resolveOutstandingEndpointConnections();

      configService.configure(config);
    }

    emit(name, ...args) {
      const listeners = this.listeners[name];
      if (listeners) {
        listeners.forEach(l => l(...args));
      }
    }

    addListener(name, listener) {
      const listeners = this.listeners[name];
      if (listeners) {
        listeners.push(listener);
      } else {
        this.listeners[name] = [listener];
      }
    }

    removeListener(name, listener) {
      const listeners = this.listeners[name];
      if (listeners) {
        this.listeners[name] = listeners.filter(l => l !== listener);
      }
    }

    /**
     * By default be our own owner.
     * @return this
     */
    get owner() {
      return this;
    }

    /**
     * We are the service provider.
     * @return {boolean} true
     */
    get isServiceProvider() {
      return true;
    }

    /**
     * Register service or interceptor factories.
     *
     * @param {[Function|string]} factories
     */
    async registerFactories(factories) {
      for (let factory of factories) {
        if(typeof factory === 'string') {
          const module = await import(factory);
          factory = new module.default();
        }

        const prototype = factory.prototype;
        if (prototype instanceof Interceptor) {
          this.registerInterceptorFactory(factory);
        } else if (prototype instanceof Service) {
          this.registerServiceFactory(factory);
        }
      }
    }

    /**
     * Registers a interceptor factory for later use by
     * @see {instantiateInterceptor}.
     *
     * @param {new() => factory} factory
     * @returns {new() => factory} factory
     */
    registerInterceptorFactory(factory) {
      this.interceptorFactories[factory.name] = factory;
      this.emit("interceptorFactoryRegistered", factory);
      return factory;
    }

    unregisterInterceptorFactory(factory) {
      delete this.interceptorFactories[factory.name];
    }

    /**
     * Instanciates an interceptor from its definition data.
     * @see {interceptorFactories}
     * @param {Object} definition data
     * @returns {Interceptor}
     */
    instantiateInterceptor(definition) {
      const factory = this.interceptorFactories[definition.type];

      if (factory) {
        delete definition.type;
        return new factory(definition);
      }
    }

    serviceStateChanged(service, oldState, newState) {
      this.emit("serviceStateChanged", service, oldState, newState);
    }

    async registerServiceFactory(factory) {
      this.serviceFactories[factory.name] = factory;
      this.emit("serviceFactoryRegistered", factory);
      return factory;
    }

    async unregisterServiceFactory(factory) {
      delete this.serviceFactories[factory.name];
    }

    async registerService(service) {
      this.services[service.name] = service;
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
      return this.services?.[name];
    }

    async declareService(config) {
      const name = config.name;
      const services = await this.declareServices({ [name]: config });
      return services[name];
    }

    /**
     * Add a new service based on its configuration.
     * If a service for the name is already present and it has a matching type
     * then its configure() is called and returned.
     * Otherwise a new service will be created eventually replacing an already existing service with the same name.
     * @param {object} configs with
     *     name - the service name
     *     type - the service factory name - defaults to config.name
     * @return {Promise<Object>} resolving to the declared services
     */
    async declareServices(configs) {
      const services = Promise.all(
        Object.entries(configs).map(([name, config]) =>
          this.ic.declareService(config, name)
        )
      );

      this.ic.resolveOutstandingEndpointConnections();
      this.ic.validateEndpoints();

      return Object.fromEntries(
        (await services)
          .filter(s => s !== undefined)
          .map(service => [service.name, service])
      );
    }

    /**
     * Start all registered services which hanving autostart set.
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
     * Stop all services.
     * @return {Promise} that resolves when all services are stopped
     */
    async _stop() {
      await Promise.all(
        Object.values(this.services)
          .filter(service => service !== this)
          .map(s => s.stop())
      );

      return super._stop();
    }
  };
}
