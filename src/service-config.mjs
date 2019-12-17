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

  configFor(name, config) {
    this.trace(`configFor ${name}`);
    
    const pc = this.preservedConfigs.get(name);
    if (pc !== undefined) {
      config = config === undefined ? pc : Object.assign(config, pc);
      this.trace(`using preserved config ${name}`);
    }
    
    this.preservedConfigs.set(name, config);

    return config;
  }

  clear(name) {
    this.preservedConfigs.delete(name);
  }

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
    if (config === undefined) {
      return;
    }

    const update = async (name, c) => {
      const s = this.owner.services[name];
      if (s === undefined) {
        delete c.name;
        this.trace(`preserve config for ${name}`);
        this.preservedConfigs.set(name, c);
      } else {
        return s.configure(c);
      }
    };

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
