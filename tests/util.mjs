import { createAttributes } from 'model-attributes';
import Service from "../src/service.mjs";
import ServiceLogger from "../src/service-logger.mjs";

export async function wait(msecs=1000) {
  return new Promise((resolve, reject) => setTimeout(() => resolve(), msecs));
}

export class TestLogger extends ServiceLogger {
  constructor(config, owner) {
    super(config, owner);

    this.logEntries = [];
    this.endpoints.log.receive = entry => {
      this.logEntries.push(entry);
    };
  }

  async _start() {
    return wait(1000);
  }
}

export class TestService extends Service {
  static get name() {
    return "test";
  }

  static get description() {
    return 'my description';
  }

  static get configurationAttributes() {
    return Object.assign(
      createAttributes({
        key3: {
          needsRestart: true
        },
        key4: {}
      }),
      Service.configurationAttributes
    );
  }

  get autostart() {
    return true;
  }

  async configure(config) {
    delete config.name;
    Object.assign(this, config);
    wait(1000);

    return this.restartIfRunning();
  }
}
