import {
  SendEndpoint,
  SendEndpointDefault,
  ReceiveEndpoint,
  ReceiveEndpointDefault
} from 'kronos-endpoint';

/**
 * Endpoint accessor mixin
 * Manages endpoints in a container
 * @param {Class} superclass class to be extended
 * @return {Class} extended class
 */
export default function EndpointsMixin(superclass) {
  return class EndpointsMixin extends superclass {
    /**
     * default set of endpoints to create
     * @return {Object} {} empty set
     */
    static get endpoints() {
      return {};
    }

    constructor(...args) {
      super(...args);

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
     * @param {Object} definition endpoints definition
     * @param {Object} interceptorFactory
     * @param {function} interceptorFactory.createInterceptorInstanceFromConfig
     */
    createEndpointsFromConfig(definition, interceptorFactory) {
      const combinedDef = Object.assign(this.constructor.endpoints, definition);
      Object.keys(combinedDef).forEach(name =>
        this.createEndpointFromConfig(
          name,
          combinedDef[name],
          interceptorFactory
        )
      );
    }

    /**
     * Determine endpoint factory from the endpoint config
     * @param {Object} definition endpoints definition
     * @param {boolean} definition.in true will result in a ReceiveEndpoint
     * @param {boolean} definition.out true will result in a SendEndpoint
     * @param {boolean} definition.default true will result in a (Send|Receive)DefaultEndpoint
     * @return {Object} endpoint factory
     */
    endpointFactoryFromConfig(definition) {
      return definition.default
        ? definition.in ? ReceiveEndpointDefault : SendEndpointDefault
        : definition.in ? ReceiveEndpoint : SendEndpoint;
    }

    /**
     * Creates a new endpoint form a defintion.
     * Also creates interceptors if the are present in the definition
     * @param {string} name of the new endpoint
     * @param {Object|string} definition endpoint attributes or expression
     * @param {Object} interceptorFactory
     * @param {function} interceptorFactory.createInterceptorInstanceFromConfig
     * @return {Endpoint} newly created endpoint
     */
    createEndpointFromConfig(name, definition, interceptorFactory) {
      const ep =
        typeof definition === 'string'
          ? this.endpointForExpression(definition)
          : new (this.endpointFactoryFromConfig(definition))(
              name,
              this,
              this.endpointOptions(name, definition)
            );

      this.addEndpoint(ep);

      if (definition.interceptors !== undefined) {
        ep.interceptors = definition.interceptors.map(icDef =>
          interceptorFactory.createInterceptorInstanceFromConfig(icDef, ep)
        );
      }

      return ep;
    }

    /**
     * Removes a endpoint
     * @param {string} name name of the endpoint to be removed
     * @return {undefined}
     */
    removeEndpoint(name) {
      delete this.endpoints[name];
    }

    /**
     * Find Endpoint for a given  expression
     * Default implementation only supports direct named endpoints
     * @param {string} expression to identify endpoint
     * @return {Endpoint} for a given expression
     */
    endpointForExpression(expression) {
      return this.endpoints[expression];
    }

    /**
     * Deliver all _in_ endpoints
     * @return {Endpoint[]} of all in endpoints
     */
    get inEndpoints() {
      return Object.values(this.endpoints).filter(e => e.isIn);
    }

    /**
     * Deliver all _out_ endpoints
     * @return {Endpoint[]} of all out endpoints
     */
    get outEndpoints() {
      return Object.values(this.endpoints).filter(e => e.isOut);
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
