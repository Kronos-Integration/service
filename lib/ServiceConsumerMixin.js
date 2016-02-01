/* jslint node: true, esnext: true */
"use strict";

const ServiceConsumerMixin = (superclass) => class extends superclass {

	constructor() {}

	useService(service) {}

	unuseService(service) {}

	get usedServices() {
		return undefined;
	}
}

module.exports = ServiceConsumerMixin;
