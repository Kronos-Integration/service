import safeStringify from 'fast-safe-stringify';
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
        in: true,
        default: true,
        receive: 'logEntry'
      }
    };
  }

  async logEntry(entry)
  {
    if (entry.severity === 'error') {
      console.error(safeStringify(entry));
    } else {
      console.log(safeStringify(entry));
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
