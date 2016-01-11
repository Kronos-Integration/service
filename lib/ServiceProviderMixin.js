/* jslint node: true, esnext: true */
"use strict";

/**
 * provide services
 */

const ServiceProviderMixin = (superclass) => class extends superclass {

	constructor() {
		super();
		defineRegistrarProperties(this, 'Service', 'services');
	}


	serviceConfiguration(configs) {

	}

	/**
	 * adds a pre cosngured service
	 */
	addService(service) {
		this.services[service.name] = service;
		if (service.autostart) {
			return servise.start();
		}

		return Promise.resolve();
	}

	get services() {
		return this._services;
	}
}

module.exports = ServiceProviderMixin;


/**
 * Returns a service object for the given key.
 * If the service does not exists it will return undefined.
 * @param {String} serviceName The name under the service was registered.
 * @param {Function} provideIfMissing callback to deliver the missing module if it is not already present
 * @return {Service} The registered service for the given key
 */
manager.serviceGet = function (serviceName, provideIfMissing) {
	const c = services[serviceName];
	if (c === undefined && provideIfMissing) {
		this.serviceRegister(serviceName, provideIfMissing(serviceName));
		return services[serviceName];
	}
	return c;
};

/**
 * Registers an service in the service manager.
 * If there is already registered under this serviceName, it will be overwritten.
 * Services can derive from already registered services.
 * values.name then references a former registered service which is used
 * as a prototype for the new service
 * @param {String} serviceName A name used to identify the service.
 * @param values The service object to be stored.
 * @return {Service} registered service
 */
manager.serviceRegister = function (serviceOrServiceName, values) {

	if (typeof serviceOrServiceName === 'string') {
		const serviceDefaults = serviceConfigs[serviceOrServiceName];

		values = Object.assign({}, serviceDefaults, values);

		/*
					if (values && serviceDefaults) {
						values = Object.assign({}, serviceDefaults, values);
					} else if (!values) {
						values = serviceDefaults;
					}
		*/

		if (values.name) {
			const baseService = this.serviceGet(values.name);
			if (baseService === null) {
				this.error(`Unable to find base service: ${values.name}`);
			}
			serviceOrServiceName = service.createService(serviceOrServiceName, values, baseService);
		} else {
			serviceOrServiceName = service.createService(serviceOrServiceName, values);
		}
	}

	services[serviceOrServiceName.name] = serviceOrServiceName;

	manager.emit('serviceRegistered', serviceOrServiceName);

	if (serviceOrServiceName.autostart) {
		serviceOrServiceName.start();
	}

	return serviceOrServiceName;
};


/**
 * Declares (and registers) a derived service
 * @param {String} derivedFromServiceName
 * @param {String|Object} definition
 * @return {Service} declared service
 */
manager.serviceDeclare = function (derivedFromServiceName, definition) {
	const serviceName = typeof definition === 'string' ? definition : definition.name;

	let service = this.serviceGet(serviceName);

	if (!service) {
		const serviceConfig = Object.assign({}, definition, {
			name: derivedFromServiceName
		});

		service = this.serviceRegister(serviceName, serviceConfig);
	}

	return service;
};

/**
 * Deletes the service registered under the given serviceName
 * @param {String} serviceName The name identifying the service to be deleted
 */
manager.serviceDelete = function (serviceName) {
	if (services[serviceName]) {
		services[serviceName].stop().then(
			() => {
				delete services[serviceName];
				manager.emit('serviceDeleted', serviceName);
			}
		);
	}
};
