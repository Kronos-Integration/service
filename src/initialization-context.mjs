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
    constructor(serviceProvider, logLevel) {
      Object.defineProperties(this, {
        serviceProvider: {
          get: () => serviceProvider,
          set: v => (serviceProvider = v)
        },
        declareServiceByNamePromises: { value: new Map() },
        serviceFactoryPromises: { value: new Map() },
        outstandingEndpointConnections: { value: new Map() }
      });

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
        endpoint.connected = isEndpoint(connected)
          ? connected
          : this.endpointForExpression(connected, endpoint);
      } else {
        if (oldEndpoint && oldEndpoint.connected) {
          endpoint.connected = oldEndpoint.connected;
        }
      }

      if (connected) {
        if (endpoint.connected === undefined) {
          this.trace(
            level => `${endpoint} ${connected} (connect deffered)`
          );

          const r = new ReceiveEndpoint(`tmp-${endpoint.name}`,endpoint.owner);
          r.receive = async () => undefined;
          endpoint.connected = r;

          this.addOutstandingEndpointConnection(endpoint, connected);
        } else {
          this.trace(
            level =>
              `${endpoint} (connected)`
          );
        }
      }
    }

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

      if (from) {
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
          endpoint.connected = c;

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
          if (!o.isConnected) {
            this.error(`${o.identifier} is not connected`);
          }
        }
      });
    }
  }
);
