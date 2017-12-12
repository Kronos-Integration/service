import {
  SendEndpoint,
  SendEndpointDefault,
  ReceiveEndpoint,
  ReceiveEndpointDefault
} from 'kronos-endpoint';

/**
 * Endpoint accessor mixin
 * Manages endpoints in a container
 */
export default function EndpointsMixin(superclass) {
  return class extends superclass {
    /**
     * default set of endpoints to create
     */
    static get endpoints() {
      return {};
    }

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
     * Deliver the endpoint options for a given endpoint definition.
     * @return {Object} suiable to pass as options to the endpoint factory
     */
    endpointOptions(name, def) {
      const options = {};

      if (def.opposite) {
        options.createOpposite = true;
      }

      return options;
    }

    /**
     * Creates the endpoint objects defined as a combination from
     * implementation and definition
     * @param {Object} def endpoints definition
     * @param {Object} interceptorFactory
     * @api protected
     */
    createEndpointsFromConfig(def, interceptorFactory) {
      const combinedDef = Object.assign(this.constructor.endpoints, def);
      Object.keys(combinedDef).forEach(name =>
        this.createEndpointFromConfig(
          name,
          combinedDef[name],
          interceptorFactory
        )
      );
    }

    /**
     * determine endpoint factory from the endpoint config
     * @param {Object} def endpoints definition
     * @return {Object} endpoint factory
     */
    endpointFactoryFromConfig(def) {
      return def.default
        ? def.in ? ReceiveEndpointDefault : SendEndpointDefault
        : def.in ? ReceiveEndpoint : SendEndpoint;
    }

    /**
     * creates a new endpoint form a defintion
     * @param {string} name of the new endpoint
     * @param {Object} def endpoint attributes
     * @param {Object} interceptorFactory
     */
    createEndpointFromConfig(name, def, interceptorFactory) {
      SendEndpointDefault;

      const ep = new (this.endpointFactoryFromConfig(def))(
        name,
        this,
        this.endpointOptions(name, def)
      );

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
