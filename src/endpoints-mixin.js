/**
 * Endpoint accessor mixin
 */
export default function EndpointsMixin(superclass) {
  return class extends superclass {
    constructor() {
      super();

      Object.defineProperty(this, 'endpoints', {
        value: {}
      });
    }

    /**
		 * Add a endpoint
		 * @param {Endpoint} ep
		 * @return {Endpoint} the added endpoint
		 */
    addEndpoint(ep) {
      this.endpoints[ep.name] = ep;
      return ep;
    }

    /**
     * creates a new endpoint form a defintion
     * @param {string} name of the new endpoint
     * @param {Object} def endpoint attributes
     * @param {Object} interceptorFactory
     */
    createEndpointFromConfig(name, def, interceptorFactory) {
      let ep;

      if (def.in) {
        ep = new ReceiveEndpoint(name, this, this.endpointOptions(name, def));
      } else if (def.out) {
        ep = new SendEndpoint(name, this, this.endpointOptions(name, def));
      }

      this.addEndpoint(ep);

      if (def.interceptors !== undefined) {
        ep.interceptors = def.interceptors.map(icDef =>
          interceptorFactory.createInterceptorInstanceFromConfig(icDef, ep)
        );
      }
    }

    /**
		 * removes a endpoint
		 * @param {string} name name of the endpoint
		 * @return {undefined}
		 */
    removeEndpoint(name) {
      delete this.endpoints[name];
    }

    /**
		 * Deliver an identifier suitable as target name.
		 * @param {Endpoint} ep endpoint to be identified
		 * @return {string} endpoint identifier
		 */
    endpointIdentifier(ep) {
      return `${this.name}${this.endpointParentSeparator}${ep.name}`;
    }
  };
}
