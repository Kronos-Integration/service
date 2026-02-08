import { Service } from "./service.mjs";

/**
 * Log receiving service.
 */
export class ServiceLogger extends Service {
  /**
   * @return {string} 'logger'
   */
  static get name() {
    return "logger";
  }

  static get description() {
    return "Log consuming service";
  }

  /**
   * Adds a log input endpoint to the set of Service endpoints.
   * @return {Object} predefined endpoints
   */
  static get endpoints() {
    const e = { ...super.endpoints };
    e.log.connected = "self";
    e.log.receive = "logEntry";
    return e;
  }

  /**
   *
   * @param {Object} entry
   * @param {string} entry.severity
   */
  async logEntry(entry) {
    switch (entry.severity) {
      case "error":
        console.error(entry);
        break;
      case "warn":
        console.warn(entry);
        break;
      case "trace":
        console.trace(entry);
        break;
      case "info":
        console.info(entry);
        break;
      case "debug":
        console.debug(entry);
        break;
      default:
        console.log(entry);
    }
  }

  /**
   * We always start immediate.
   * @return {boolean} true
   */
  get autostart() {
    return true;
  }

  get name() {
    return "logger";
  }
}
