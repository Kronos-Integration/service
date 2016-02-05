/* jslint node: true, esnext: true */
"use strict";


/**
 * assign services based on a configuration
 */

module.exports.defineServiceConsumerProperties = function (object, config, provider) {
	const promises = [];

	Object.keys(config).forEach(name => {
		let entry = config[name];

		if (typeof entry === 'string') {
			entry = {
				name: name,
				type: name
			};
		}

		promises.push(provider.declareService(entry).then(service => {
			Object.defineProperty(name, {
				value: service
			});
		}));
	});

	return Promise.all(promises);
};
