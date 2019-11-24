import {
  SendEndpoint,
  SendEndpointDefault,
  ReceiveEndpoint,
  ReceiveEndpointDefault
} from "@kronos-integration/endpoint";

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

      Object.defineProperty(this, "endpoints", {
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
     * @param {string} name of the endpoint
     * @param {Object} definition endpoints definition
     * @param {InitializationContext} ic
     * @return {Object} suitable to pass as options to the endpoint factory
     */
    endpointOptions(name, definition, ic) {
      const receive = definition.receive;

      if (typeof receive === "string") {
        definition.receive = (...args) => this[receive](...args);
      }

      return definition;
    }

    /**
     * Determine endpoint factory from the endpoint config
     * @param {string} name of the new endpoint
     * @param {Object} definition endpoints definition
     * @param {boolean} definition.in true will result in a ReceiveEndpoint
     * @param {boolean} definition.receive true will result in a ReceiveEndpoint
     * @param {boolean} definition.out true will result in a SendEndpoint
     * @param {boolean} definition.default true will result in a (Send|Receive)DefaultEndpoint
     * @param {InitializationContext} ic
     * @return {Object} endpoint factory
     */
    endpointFactoryFromConfig(name, definition, ic) {
      if (definition.in || definition.receive) {
        return definition.default ? ReceiveEndpointDefault : ReceiveEndpoint;
      }

      return definition.default ? SendEndpointDefault : SendEndpoint;
    }

    /**
     * Creates a new endpoint form a defintion.
     * Also creates interceptors if they are present in the definition
     * @param {string} name of the new endpoint
     * @param {Object|string} definition endpoint attributes or alias expression
     * @param {string} definition.target expression pointing to the connected endpoint
     * @param {InitializationContext} ic
     * @return {Endpoint} newly created endpoint
     */
    createEndpointFromConfig(name, definition, ic) {
      if (typeof definition === "string") {
        return this.endpointForExpression(definition);
      }

      const ep = new (this.endpointFactoryFromConfig(name, definition, ic))(
        name,
        this,
        this.endpointOptions(name, definition, ic)
      );

      ic.connectEndpoint(ep, definition.connected, this.endpoints[name]);

      this.addEndpoint(ep);

      return ep;
    }

    /**
     * Creates the endpoint objects defined as a combination from
     * implementation and definition
     * @param {Object} definition endpoints definition
     * @param {InitializationContext} ic
     */
    createEndpointsFromConfig(definition, ic) {
      for (const [name, def] of Object.entries({
        ...this.constructor.endpoints,
        ...definition
      })) {
        this.createEndpointFromConfig(name, def, ic);
      }
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

       /**
     * Find Endpoint for a given expression
     * Default implementation only supports direct named endpoints
     * @param {string} expression to identify endpoint
     * @param {boolean} wait for endpoint to become present (deliver a promise)
     * @param {Boolean} throwOnError raise exception if connection can´t be established
     * @return {Endpoint} for a given expression
     * @throws if no Endpoint can be found and throwOnError is true
     */
    endpointForExpression(expression, wait = false, throwOnError = true) {
      const endpoint = this.endpoints[expression];
      if (endpoint === undefined) {
        const m = expression.match(/^service\(([^\)]+)\).(.*)/);
        if (m) {
          const serviceName = m[1];
          const suffixExpression = m[2];
          const serviceProvider = this.owner;
          const service = serviceProvider.getService(serviceName);

          if (service === undefined) {
            if (throwOnError) {
              throw new Error(
                `Service '${serviceName}' not found in ${serviceProvider.name} (${serviceProvider.serviceNames})`
              );
            }
            return undefined;
          }

          return service.endpointForExpression(
            suffixExpression,
            wait,
            throwOnError
          );
        }

        if (throwOnError) {
          throw new Error(`Endpoint '${expression}' not found in ${this.name}`);
        }
      }

      return endpoint;
    }
  };
}
