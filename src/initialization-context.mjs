import {
  defaultLogLevels,
  defineLogLevelProperties,
  LogLevelMixin
} from "loglevel-mixin";

import {
  isEndpoint,
  Endpoint,
  ReceiveEndpoint
} from "@kronos-integration/endpoint";

/**
 * keeps track of all in flight object creations and loose ends during config initialization
 */
export const InitializationContext = LogLevelMixin(
  /**
   * @param {ServiceProvider} serviceProvider
   * @param {Object} options
   * @param {boolean} options.waitForFactories wait until factory apears in registry
   */
  class InitializationContext {
    /**
     * services requested but not ready missing factories...
     */
    outstandingServices = new Map();
    outstandingFactories = new Map();
    outstandingEndpointConnections = new Map();
    serviceProvider;

    constructor(serviceProvider, options) {
      this.serviceProvider = serviceProvider;

      options = { waitForFactories: true, logLevel: "info", ...options };
      this.waitForFactories = options.waitForFactories;
      defineLogLevelProperties(
        this,
        defaultLogLevels,
        defaultLogLevels[options.logLevel]
      );
    }

    /**
     * forward to the serviceProvider
     * @param {string} level the log level
     * @param {Object} arg log content
     */
    log(level, ...args) {
      if (this.serviceProvider) {
        this.serviceProvider.log(level, ...args);
      }
      else {
        console.log(...args);
      }
    }

    ownerOfService(service) {
      return this.serviceProvider;
    }

    /**
     *
     * @param {Endpoint} endpoint
     * @param {string} connected
     */
    connectEndpoint(endpoint, connected) {
      if (connected == undefined) {
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
        this.trace(level => `${endpoint} ${connected} (connect deffered)`);

        const r = new ReceiveEndpoint(`tmp-${endpoint.name}`, endpoint.owner);
        r.receive = async () => {};
        endpoint.addConnection(r);

        this.addOutstandingEndpointConnection(endpoint, connected);
      }
    }

    /**
     *
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

    resolveOutstandingEndpointConnections() {
      for (const [
        endpoint,
        connected
      ] of this.outstandingEndpointConnections.entries()) {
        const c = this.endpointForExpression(connected, endpoint);
        if (c) {
          endpoint.addConnection(c);

          this.outstandingEndpointConnections.delete(endpoint);
          this.trace(level => `${endpoint} (connection resolved)`);
        } else {
          this.error(level => `unable to connect ${endpoint} ${connected}`);
        }
      }
    }

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
     * @param {string|class} type name if type
     */
    async getServiceFactory(type) {
      const sp = this.serviceProvider;

      if (type instanceof Function) {
        const factory = sp.serviceFactories[type.name];
        if (factory !== undefined) {
          return factory;
        }
        return sp.registerServiceFactory(type);
      }

      const factory = sp.serviceFactories[type];
      if (factory) {
        return factory;
      }

      let typePromise = this.outstandingFactories.get(type);
      if (typePromise !== undefined) {
        return typePromise;
      }

      if (!this.waitForFactories) {
        return undefined;
      }

      typePromise = new Promise((resolve, reject) => {
        const listener = factory => {
          if (factory.name === type) {
            this.outstandingFactories.delete(type);
            sp.removeListener("serviceFactoryRegistered", listener);
            resolve(factory);
          }
        };

        sp.addListener("serviceFactoryRegistered", listener);
      });

      this.outstandingFactories.set(type, typePromise);

      return typePromise;
    }

    /**
     * - if there is already a service for the given name configure it and we are done
     * - if the is already an outstanding declaration ongoing wait until it is done configure it done
     * - otherewise declare this action as a new outstanding service declaration
     * @param {Object} config
     * @param {string} name
     * @return {Service}
     */
    async declareService(config, name) {
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

      config.name = name;

      // service factory not present? wait until one arrives
      const type = config.type || config.name;
      const clazz = await this.getServiceFactory(type);
      if (clazz === undefined) {
        throw new Error(`no factory for ${type}`);
      }

      if (sp.services.config) {
        config = await sp.services.config.configFor(name,config);
      }

      servicePromise = sp.registerService(new clazz(config, this));
      this.outstandingServices.set(name, servicePromise);
      service = await servicePromise;
      this.outstandingServices.delete(name);

      if (sp.services.config) {
        sp.services.config.clear(name);
      }

      this.resolveOutstandingEndpointConnections();
      return service;
    }
  }
);
