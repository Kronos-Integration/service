import Service from './service.mjs';

/**
 * Log receiving service
 */
export default class ServiceLogger extends Service {

  /**
   * @return {string} 'logger'
   */
  static get name() {
    return 'logger';
  }

  /**
   * Adds a log input endpoint to the set of Service endpoints
   * @return {Object} predefined endpoints
   */
  static get endpoints() {
    return {
      ...super.endpoints,
      log: {
        receive: 'logEntry'
      }
    };
  }

  async logEntry(entry)
  {
    if (entry.severity === 'error') {
      console.error(entry);
    } else {
      console.log(entry);
    }
  }

  /**
   * We always start immediate
   * @return {boolean} true
   */
  get autostart() {
    return true;
  }

  get name() {
    return 'logger';
  }
}
