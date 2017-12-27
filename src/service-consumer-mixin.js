/**
 * assign services based on a configuration
 * @param {Object} target object
 * @param {Object} config service defintion
 * @param {Object} provider service provider
 * @param {boolean} waitUntilFactoryPresent
 */
export function defineServiceConsumerProperties(
  target,
  config,
  provider,
  waitUntilFactoryPresent
) {
  return Promise.all(
    Object.keys(config).map(async name => {
      let entry = config[name];

      if (typeof entry === 'string') {
        entry = {
          name,
          type: entry
        };
      } else {
        if (entry.name === undefined) {
          entry.name = name;
        }
      }

      const service = await provider.declareService(
        entry,
        waitUntilFactoryPresent
      );

      Object.defineProperty(target, name, {
        value: service
      });
      return service.start();
    })
  );
}
