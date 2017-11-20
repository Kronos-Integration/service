import { ReceiveEndpoint } from 'kronos-endpoint';
import Service from './service';

const safeStringify = require('fast-safe-stringify');

/**
 * Log receiving service
 */
export default class ServiceLogger extends Service {
  static get name() {
    return 'logger';
  }

  constructor(config, owner) {
    super(config, owner);

    this.addEndpoint(
      new ReceiveEndpoint('log', this)
    ).receive = async entry => {
      if (entry.severity === 'error') {
        console.error(safeStringify(entry));
      } else {
        console.log(safeStringify(entry));
      }
    };
  }

  get autostart() {
    return true;
  }
}
