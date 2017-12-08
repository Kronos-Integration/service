/**
 * assign services based on a configuration
 */

export function defineServiceConsumerProperties(
  object,
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

      Object.defineProperty(object, name, {
        value: service
      });
      return service.start();
    })
  );
}
