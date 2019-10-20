import { defineRegistryProperties } from 'registry-mixin';
import Service from './service.mjs';

/**
 * Config providing service
 * Dispatches config requests to services
 * or preserves them until a maching service becomes avaliable
 */
export default class ServiceConfig extends Service {
  /**
   * @return {string} 'config'
   */
  static get name() {
    return 'config';
  }

  constructor(config, owner) {
    super(config, owner);

    defineRegistryProperties(this, 'preservedConfig', {});

    /*
		 * requests can be an array of config entries
		 */

    this.endpoints.config.receive = request => {
      if (!Array.isArray(request)) {
        request = [request];
      }

      const responses = [];

      request.forEach(entry => {
        const service = owner.services[entry.name];
        if (service !== undefined && service !== this) {
          responses.push(service.endpoints.config.receive(entry));
        } else {
          this.registerPreservedConfig(entry);
        }
      });

      return Promise.all(responses);
    };
  }

  /**
   * We always start immediate
   * @return {boolean} true
   */
  get autostart() {
    return true;
  }
}
