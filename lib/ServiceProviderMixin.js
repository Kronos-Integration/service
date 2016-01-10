/* jslint node: true, esnext: true */
"use strict";

/**
 * provide services
 */

const ServiceProviderMixin = (superclass) => class extends superclass {

	constructor() {

	}

	addService() {

	}

	get services() {
		return undefined;
	}
}

module.exports = ServiceProviderMixin;
