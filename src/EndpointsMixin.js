/* jslint node: true, esnext: true */
'use strict';

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
	 * removes a endpoint
	 * @param {String} name name of the endpoint
	 * @return {undefined}
	 */
	removeEndpoint(name) {
		delete this.endpoints[name];
	}

		/**
		 * Deliver an identifier suitable as target name.
		 * @param {Endpoint} ep endpoint to be identified
		 * @return {String} endpoint identifier
		 */
		endpointIdentifier(ep) {
			return `${this.name}${this.endpointParentSeparator}${ep.name}`;
		}
	};
}
