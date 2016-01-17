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

	properties['register' + ucfirstSingularName] = {
		value: function (toBeRegistered) {
			const name = toBeRegistered.type;

			if (registry[name]) {
				if (registry[name] === toBeRegistered) {
					return;
				}
			}

			registry[name] = toBeRegistered;

			console.log(`register: ${toBeRegistered} ${name} ${registry[name]}`);
		}
	};

	Object.defineProperties(object, properties);
};

/*
manager.emit('serviceDeleted', serviceName);
*/
