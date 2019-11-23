/**
 * keeps track of all in flight object creations and loose ends during config initialization
 */
export class InitializationContext {
  constructor(serviceProvider) {
    Object.defineProperties(this, {
      serviceProvider: { value: serviceProvider },
      declareServiceByNamePromises: { value: new Map() },
      serviceFactoryPromises: { value: new Map() },
      outstandingEndpointConnections: { value: new Map() }
    });
  }

  /**
   *
   * @param {Endpoint} endpoint
   * @param {string} target
   */
  connectEndpoint(endpoint, target) {
    this.addOutstandingEndpointConnection(endpoint, target);
  }

  /**
   *
   * @param {Endpoint} endpoint
   * @param {string} target
   */
  addOutstandingEndpointConnection(endpoint, target) {
    this.outstandingEndpointConnections.set(endpoint, target);
  }
}
