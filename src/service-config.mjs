import Service from "./service.mjs";
import { keyValue2Object } from "./util.mjs";

/**
 * Config providing service
 * Dispatches config requests to services
 * or preserves them until a maching service becomes avaliable
 * @property {Map<string,Object>} preservedConfigs values for services not alredy established
 */
export default class ServiceConfig extends Service {
  /**
   * @return {string} 'config'
   */
  static get name() {
    return "config";
  }

  preservedConfigs = new Map();

  /**
   * set config entry
   * @param {string} key path to the value
   * @param {any} value
   */
  async configureValue(key, value) {
    return this.configure(keyValue2Object(key, value));
  }

  /**
   *
   * @param {Array|Object} config
   */
  async configure(config) {
    const update = async (name, c) => {
      const s = this.owner.services[name];
      if (s === undefined) {
        delete c.name;
        this.preservedConfigs.set(name, c);
      } else {
        return s.configure(c);
      }
    };

    if (config === undefined) {
      return;
    }

    await Promise.all(
      Array.isArray(config)
        ? config.map(c => update(c.name, c))
        : Object.entries(config).map(([k, v]) => update(k, v))
    );
  }

  /**
   * We always start immediate
   * @return {boolean} true
   */
  get autostart() {
    return true;
  }

  get name() {
    return "config";
  }
}
