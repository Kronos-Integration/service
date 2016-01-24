/* jslint node: true, esnext: true */
"use strict";

/**
 * Register named factories
 * register<<Name>>(Factory)
 * create<<Name>>Instance(name,arg)
 * <<Name>> // lookup
 */
exports.defineRegistrarProperties = function (object, name) {
	const properties = {};

	const ucFirstName = name.charAt(0).toUpperCase() + name.slice(1);
	const pluralLowercaseName = name + "s";
	const eventNameRegistered = pluralLowercaseName + 'Registered';

	const registry = {};

	properties[pluralLowercaseName] = {
		get: function () {
			return registry;
		}
	};

	properties['create' + ucFirstName + 'Instance'] = {
		// TODO use ... if node supports it
		value: function (name, arg1, arg2, arg3) {
			const clazz = registry[name];
			return new clazz(arg1, arg2, arg3);
		}
	};

	properties['register' + ucFirstName] = {
		value: function (toBeRegistered) {
			const name = toBeRegistered.name || toBeRegistered.type;

			if (registry[name]) {
				if (registry[name] === toBeRegistered) {
					return;
				}
			}

			registry[name] = toBeRegistered;
			this.emit(eventNameRegistered, toBeRegistered);
		}
	};

	Object.defineProperties(object, properties);
};

/*
manager.emit('serviceDeleted', serviceName);
*/
