/* jslint node: true, esnext: true */
"use strict";

/**
 * Register named factories
 * register<<Name>>(Factory)
 * create<<Name>>Instance(name,arg)
 * <<Name>> // lookup
 */
exports.defineRegistrarProperties = function (object, ucFirstSingularName, pluralLowercaseName) {
	const properties = {};

	const registry = {};

	properties[pluralLowercaseName] = {
		get: function () {
			return registry;
		}
	};

	properties['create' + ucFirstSingularName + 'Instance'] = {
		value: function (name, args) {
			const clazz = registry[name];
			return new clazz(args);
		}
	};

	properties['register' + ucFirstSingularName] = {
		value: function (toBeRegistered) {
			const name = toBeRegistered.name || toBeRegistered.type;

			if (registry[name]) {
				if (registry[name] === toBeRegistered) {
					return;
				}
			}

			registry[name] = toBeRegistered;
		}
	};

	Object.defineProperties(object, properties);
};

/*
manager.emit('serviceDeleted', serviceName);
*/
