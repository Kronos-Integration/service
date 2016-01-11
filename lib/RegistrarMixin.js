/* jslint node: true, esnext: true */
"use strict";

exports.defineRegistrarProperties = function (object, ucfirstSingularName, pluralLowercaseName) {
	const properties = {};


	const registery = {};

	properties[pluralLowercaseName] = {
		get: function () {
			return registery;
		}
	};

	properties['register' + ucfirstSingularName] = {
		value: function (toBeRegistered) {
			const name = toBeRegistered.type;

			if (registery[name]) {
				if (registery[name] === toBeRegistered) {
					return;
				}
			}

			registery[name] = toBeRegistered;
		}
	};


	Object.defineProperties(object, properties);
};

//defineRegistrarProperties(object, 'Interceptor', 'interceptors');
