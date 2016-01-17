/* jslint node: true, esnext: true */
"use strict";


module.exports = (superclass) => class extends superclass {
	constructor() {
		super();

		let endpoints = {};
		Object.defineProperty(this, 'endpoints', {
			value: endpoints
		});
	}

	/**
	 * @param {Endpoint} ep
	 */
	addEndpoint(ep) {
		this.endpoints[ep.name] = ep;
		return ep;
	}
}
