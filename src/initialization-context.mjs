import {
  isEndpoint,
  ReceiveEndpoint,
  Endpoint
} from "@kronos-integration/endpoint";

const dummyReceiver = new ReceiveEndpoint("dummyReceiver", {
  endpointIdentifier(ep) {
    return undefined; // prevent target;
  }
});

dummyReceiver.receive = (...args) => {
};

/**
 * keeps track of all in flight object creations and loose ends during config initialization
 */
export class InitializationContext {
  constructor(serviceProvider) {
    Object.defineProperties(this, {
      serviceProvider: {
        get: () => serviceProvider,
        set: v => (serviceProvider = v)
      },
      declareServiceByNamePromises: { value: new Map() },
      serviceFactoryPromises: { value: new Map() },
      outstandingEndpointConnections: { value: new Map() }
    });
  }

  ownerOfService(service) {
    return this.serviceProvider;
  }

  trace(...args) {
    if (this.serviceProvider) {
      this.serviceProvider.trace(...args);
    }
  }
  error(...args) {
    if (this.serviceProvider) {
      this.serviceProvider.error(...args);
    }
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
          level => `connect ${endpoint.identifier} ${connected} (deffered)`
        );

        endpoint.connected = dummyReceiver;
        this.addOutstandingEndpointConnection(endpoint, connected);
      } else {
        this.trace(level => `connect ${endpoint.identifier} ${connected}`);
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
          level => `connect ${endpoint.identifier} ${connected} (resolved)`
        );
      } else {
        this.error(
          level => `unable to connect ${endpoint.identifier} ${connected}`
        );
      }
    }
  }
}
