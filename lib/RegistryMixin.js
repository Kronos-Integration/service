/* jslint node: true, esnext: true */
"use strict";

/**
 * Register named factories
 * register<<Name>>(Factory)
 * unregister<<Name>>(Factory)
 * create<<Name>>Instance(name,arg)
 * <<Name>> // lookup
 *
 * Format of the options
 * {
 *	"factoryType" : "new"																// A key word which will call a constructor
 *                  "<functionName>"										// a function name to call
 *                  function(name, arg1, arg2, arg3){}  // A given function which will be called
 * }
 *
 */
exports.defineRegistryProperties = function (object, name, options) {
	const properties = {};

	if (options === undefined) {
		options = {};
	}

	const ucFirstName = name.charAt(0).toUpperCase() + name.slice(1);
	const pluralLowercaseName = name + "s";
	const eventNameRegistered = name + 'Registered';
	const eventNameUnRegistered = name + 'Unregistered';

	const registry = {};

	properties[pluralLowercaseName] = {
		get: function () {
			return registry;
		}
	};

	if (options.withCreateInstance) {
		properties['create' + ucFirstName + 'Instance'] = {
			// TODO use ... if node supports it
			value: options.factoryType === 'new' ? function (name, arg1, arg2, arg3) {
				const Clazz = registry[name];
				return new Clazz(arg1, arg2, arg3);
			} : function (name, arg1, arg2, arg3) {
				const factory = registry[name];
				return factory(arg1, arg2, arg3);
			}
		};
	}

	properties['register' + ucFirstName] = {
		value: function (toBeRegistered) {
			const name = toBeRegistered.type || toBeRegistered.name;

			const old = registry[name];
			if (old) {
				if (old === toBeRegistered) {
					return;
				}

				this.emit(eventNameUnRegistered, old);
			}

			registry[name] = toBeRegistered;

			this.emit(eventNameRegistered, toBeRegistered);
		}
	};

	properties['unregister' + ucFirstName] = {
		value: function (name) {
			const old = registry[name];

			if (old !== undefined) {
				delete registry[name];
				this.emit(eventNameUnRegistered, old);
			}
		}
	};

	Object.defineProperties(object, properties);
};
