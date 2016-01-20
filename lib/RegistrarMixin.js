/* jslint node: true, esnext: true */
"use strict";

/**
 *
 * register<<Name>>
 * <<Name>>
 */
exports.defineRegistrarProperties = function (object, ucfirstSingularName, pluralLowercaseName) {
	const properties = {};

	const registry = {};

	properties[pluralLowercaseName] = {
		get: function () {
			return registry;
		}
	};

	properties['create' + ucfirstSingularName + 'Instance'] = {
		value: function (name, args) {
			const clazz = registry[name];
			return new clazz(args);
		}
	};

	properties['register' + ucfirstSingularName] = {
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
