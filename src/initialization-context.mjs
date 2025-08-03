import { LogLevelMixin } from "loglevel-mixin";
import {
  isEndpoint,
  Endpoint,
  DummyReceiveEndpoint
} from "@kronos-integration/endpoint";
import { Service } from "./service.mjs";

/**
 * Keeps track of all in flight object creations and loose ends during config initialization.
 */
export const InitializationContext = LogLevelMixin(
  /**
   * @param {ServiceProvider} serviceProvider
   * @param {Object} options
   * @param {string} options.logLevel
   *
   * @property {Map<string,Promise<Service>>} outstandingServices
   * @property {Map<string,Promise<Function>>} outstandingFactories
   * @property {Map<string,Promise<Endpoint>>} outstandingEndpointConnections
   */
  class InitializationContext {

    /** @type {Map<string,Promise<Service>>} */ outstandingServices = new Map();
    /** @type {Map<string,Promise<Function>>} */ outstandingFactories = new Map();
    /** @type {Map<string,Promise<Endpoint>>} */ outstandingEndpointConnections = new Map();

    constructor(serviceProvider, options) {
      this.serviceProvider = serviceProvider;
    }

    /**
     * Forward to the serviceProvider.
     * @param {string} level the log level
     * @param {Object} args log content
     */
    log(level, ...args) {
      if (this.serviceProvider) {
        this.serviceProvider.log(level, ...args);
      } else {
        console.log(...args);
      }
    }

    /**
     * Wait for (Service) factory to be declared when asced for a service.
     *
     * @return {boolean} true we wait until a factory is known
     */
    get waitForFactories() {
      return true;
    }

    ownerOfService(service) {
      return this.serviceProvider;
    }

    /**
     * Connects an endpoint.
     * If the other side is currently not present a dummy endpoint will be created
     * and listed as outstanding endpoint connection.
     * @param {Endpoint} endpoint
     * @param {string} connected
     */
    connectEndpoint(endpoint, connected) {
      if (connected === undefined) {
        return;
      }

      if (Array.isArray(connected)) {
        for (const c of connected) {
          this.connectEndpoint(endpoint, c);
        }
        return;
      }

      let other = connected;
      if (!isEndpoint(connected)) {
        other = this.endpointForExpression(connected, endpoint);
      }

      if (other) {
        endpoint.addConnection(other);
        this.trace(level => `${endpoint} ${connected} (connected)`);
      } else {
        this.trace(level => `${endpoint} ${connected} (deffered)`);

        endpoint.addConnection(
          new DummyReceiveEndpoint(endpoint.name, endpoint.owner)
        );

        this.addOutstandingEndpointConnection(endpoint, connected);
      }
    }

    /**
     * Find endpoint for a given expression.
     * @param {string} expression
     * @param {Endpoint} from
     */
    endpointForExpression(expression, from) {
      if (this.serviceProvider) {
        const endpoint = this.serviceProvider.endpointForExpression(
          expression,
          from
        );
        if (endpoint) {
          return endpoint;
        }
      }

      if (from !== undefined) {
        return from.owner.endpointForExpression(expression);
      }
    }

    /**
     *
     * @param {Endpoint} endpoint
     * @param {string} connected
     */
    addOutstandingEndpointConnection(endpoint, connected) {
      this.outstandingEndpointConnections.set(endpoint, connected);
    }

    /**
     * Resolve any outstanding centdpoint connections.
     */
    resolveOutstandingEndpointConnections() {
      for (const [
        endpoint,
        connected
      ] of this.outstandingEndpointConnections.entries()) {
        const c = this.endpointForExpression(connected, endpoint);
        if (c) {
          for (const pc of endpoint.connections()) {
            if (pc.isDummy) endpoint.removeConnection(pc);
          }

          endpoint.addConnection(c);

          this.outstandingEndpointConnections.delete(endpoint);
          this.trace(level => `${endpoint} (connection)`);
        } else {
          this.error(level => `Unable to connect ${endpoint} ${connected}`);
        }
      }
    }

    /**
     * Checks the service providers endpoint for beeing not connected.
     */
    validateEndpoints() {
      Object.values(this.serviceProvider.services).forEach(s => {
        for (const o of s.outEndpoints) {
          if (!o.hasConnections) {
            this.error(`${o.identifier} is not connected`);
          }
        }
      });
    }

    /**
     *
     * @param {string|(new() => type)} type name if type
     */
    async getServiceFactory(type) {
      const sp = this.serviceProvider;

      if (type instanceof Function) {
        return sp.serviceFactories[type.name] || sp.registerServiceFactory(type);
      }

      const factory = sp.serviceFactories[type];
      if (factory) {
        return factory;
      }

      const outstandingFactory = this.outstandingFactories.get(type);
      if (outstandingFactory !== undefined) {
        return outstandingFactory.promise;
      }

      if (this.waitForFactories) {
        try {
          const module = await import(type);
          if (module.default?.prototype instanceof Service) {
            sp.registerServiceFactory(type, module.default);
            return module.default;
          }
        } catch (e) {
          this.warn(e);
        }

        const outstandingFactory = {};

        outstandingFactory.promise = new Promise((resolve, reject) => {
          const listener = factory => {
            if (factory.name === type) {
              clearTimeout(outstandingFactory.timeout);
              sp.removeListener("serviceFactoryRegistered", listener);
              this.outstandingFactories.delete(type);

              resolve(factory);
            }
          };

          outstandingFactory.timeout = setTimeout(() => {
            const message = `timeout waiting for service ${type}`;
            this.warn(message);
            reject(new Error(message));
          }, 1000 * 10);

          sp.addListener("serviceFactoryRegistered", listener);
        });

        this.outstandingFactories.set(type, outstandingFactory);

        return outstandingFactory.promise;
      }
    }

    /**
     * - if there is already a service for the given name configure it and we are done
     * - if there is already an outstanding declaration ongoing wait until it is done configure it then
     * - otherwise declare this action as a new outstanding service declaration
     * @param {Object} config
     * @param {string} name service name
     * @return {Promise<Service|undefined>}
     */
    async declareService(config={}, name) {      
      const sp = this.serviceProvider;
      let service = sp.getService(name);

      if (service !== undefined) {
        await service.configure(config);
        return service;
      }

      let servicePromise = this.outstandingServices.get(name);
      if (servicePromise) {
        service = await servicePromise;
        await service.configure(config);
        return service;
      }

      /** if config belongs to the provider we represent ourselfs */
      if(config.serviceProvider) {
        if (sp.services.config) {
          config = await sp.services.config.configFor(name, config);
          sp.configure(config);
        }

        return sp;
      }

      config.name = name;

      // service factory not present? wait until one arrives
      const type = config.type || config.name;

      const clazz = await this.getServiceFactory(type);

      if (clazz) {
        if (sp.services.config) {
          config = await sp.services.config.configFor(name, config);
        }

        servicePromise = sp.registerService(new clazz(config, this));
        this.outstandingServices.set(name, servicePromise);

        service = await servicePromise;
        this.outstandingServices.delete(name);

        if (sp.services.config) {
          sp.services.config.clearPreserved(name);
        }

        this.resolveOutstandingEndpointConnections();
        return service;
      }

      //   throw new Error(`No factory for ${type}`);
    }
  }
);
