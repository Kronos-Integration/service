/**
 * keeps track of all in flight object creations and loose ends during config initialization
 */
export class InitializationContext {
  constructor() {
    Object.defineProperties(this, {
      declareServiceByNamePromises: { value: new Map() },
      serviceFactoryPromises: { value: new Map() },
      outstandingEndpointConnections: { value: new Map() }
    });
  }

  addOutstandingEndpointConnection(endpoint, connection) {
    this.outstandingEndpointConnections.set(endpoint, connection);
  }
}
