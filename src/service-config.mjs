import Service from "./service.mjs";

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
    return "config";
  }

  constructor(config, owner) {
    super(config, owner);

    Object.defineProperties(this, {
      preservedConfigs: { value: new Map() }
    });
  }

  /**
   * 
   * @param {Array|Object} config 
   */
  async configure(config) {
    const update = async(name, c) => {
      const s = this.owner.services[name];
      if (s === undefined) {
        delete c.name;
        this.preservedConfigs.set(name, c);
      } else {
        return s.endpoints.config.receive(c);
      }
    };

    if(config === undefined) {
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
}
