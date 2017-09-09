/**
 * assign services based on a configuration
 */

export function defineServiceConsumerProperties(
  object,
  config,
  provider,
  waitUntilFactoryPresent
) {
  const promises = [];

  Object.keys(config).forEach(name => {
    let entry = config[name];

    if (typeof entry === 'string') {
      entry = {
        name: name,
        type: entry
      };
    } else {
      if (entry.name === undefined) {
        entry.name = name;
      }
    }

    promises.push(
      provider.declareService(entry, waitUntilFactoryPresent).then(service => {
        Object.defineProperty(object, name, {
          value: service
        });
        return service.start();
      })
    );
  });

  return Promise.all(promises);
}
