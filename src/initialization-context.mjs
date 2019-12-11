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
  class InitializationContext {
    outstandingServices = new Map();
    serviceFactoryPromises = new Map();
    outstandingEndpointConnections = new Map();
    serviceProvider;

    constructor(serviceProvider, logLevel) {
      this.serviceProvider = serviceProvider;
      defineLogLevelProperties(this, defaultLogLevels, defaultLogLevels[logLevel]);
    }

    /**
     * Adds service name to the log event
     * @param {string} level the log level
     * @param {Object} arg log content
     */
    log(level, ...args) {
      console.log(...args);
      /*if (this.serviceProvider) {
      this.serviceProvider.log(level, ...args);
    }
    */
    }

    ownerOfService(service) {
      return this.serviceProvider;
    }

    /**
     *
     * @param {Endpoint} endpoint
     * @param {string} connected
     * @param {Endpoint} oldEndpoint
     */
    connectEndpoint(endpoint, connected, oldEndpoint) {
      if (connected !== undefined) {
        endpoint.addConnection(isEndpoint(connected)
          ? connected
          : this.endpointForExpression(connected, endpoint));
      }

      if (connected) {
        if (!endpoint.hasConnections) {
          this.trace(
            level => `${endpoint} ${connected} (connect deffered)`
          );

          const r = new ReceiveEndpoint(`tmp-${endpoint.name}`,endpoint.owner);
          r.receive = async () => undefined;
          endpoint.addConnection(r);

          this.addOutstandingEndpointConnection(endpoint, connected);
        } else {
          this.trace(
            level =>
              `${endpoint} (connected)`
          );
        }
      }
    }

    /**
     * 
     * @param {string} expression 
     * @param {Endpoint} from 
     */
    endpointForExpression(expression, from) {
      if (this.serviceProvider) {
        const m = expression.match(/^service\(([^\)]+)\).(.*)/);
        if (m) {
          const serviceName = m[1];
          const suffixExpression = m[2];
          const service = this.serviceProvider.getService(serviceName);

          if (service) {
            return service.endpoints[suffixExpression];
          }
        }
      }

      if (from !== undefined) {
        if(expression === 'self') {
          return from;
        }

        return from.owner.endpoints[expression];
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
          this.trace(
            level => `${endpoint} (connection resolved)`
          );
        } else {
          this.error(
            level => `unable to connect ${endpoint} ${connected}`
          );
        }
      }

      this.validateEndpoints();
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
     * - if there is already a service for the given name configure it and we are done
     * - if the is already an outstanding declaration ongoing wait until it is done configure it done
     * - otherewise declare this action as a new outstanding service declaration
     * @param {Object} config 
     * @param {string} name 
     */
    async declareService(config, name) {
      const sp = this.serviceProvider;
      let service = sp.getService(name);

      if(service !== undefined) {
        await service.configure(config);
        return service;
      }

      let servicePromise = this.outstandingServices.get(name);
      if(servicePromise) {
        service = await servicePromise;
        await service.configure(config);
        return service;
      }

      servicePromise = sp.registerService(sp.createService(config, this));
      this.outstandingServices.set(name, servicePromise);
      service = await servicePromise;
      this.outstandingServices.delete(name);
      return service;
    }
  }
);
