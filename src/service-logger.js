import { ReceiveEndpoint } from 'kronos-endpoint';
import Service from './service';
import safeStringify from 'fast-safe-stringify';

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
    return Object.assign({}, Service.endpoints, {
      log: {
        in: true,
        default: true
      }
    });
  }

  constructor(config, owner) {
    super(config, owner);

    this.endpoints.log.receive = async entry => {
      if (entry.severity === 'error') {
        console.error(safeStringify(entry));
      } else {
        console.log(safeStringify(entry));
      }
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
