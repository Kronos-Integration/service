/* jslint node: true, esnext: true */
"use strict";

exports.defineObjectRegistryProperties = function (object, name, type) {
	defineRegistryProperties(object, name, type, false);
};

exports.defineFactoryRegistryProperties = function (object, name, type) {
	defineRegistryProperties(object, name, type, true);
};

/**
 * Register named factories
 * register<<Name>>(Factory)
 * unregister<<Name>>(Factory)
 * create<<Name>>Instance(name,arg)
 * <<Name>> // lookup
 */
function defineRegistryProperties(object, name, type, withCreateInstance) {
	const properties = {};

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

	if (withCreateInstance) {
		properties['create' + ucFirstName + 'Instance'] = {
			// TODO use ... if node supports it
			value: type === 'new' ? function (name, arg1, arg2, arg3) {
				const clazz = registry[name];
				return new clazz(arg1, arg2, arg3);
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
}
