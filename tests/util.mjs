import { createAttributes } from 'model-attributes';
import Service from "../src/service.mjs";
import ServiceLogger from "../src/service-logger.mjs";
import ServiceProviderMixin from "../src/service-provider-mixin.mjs";

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

export class TestServiceWithoutAdditionalEndpoints extends Service {
  static get name() {
    return "test-without-additional-endpoints";
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
}


export class TestService extends Service {
  static get name() {
    return "test";
  }

  static get description() {
    return 'my description';
  }

  /**
   * Adds a log input endpoint to the set of Service endpoints
   * @return {Object} predefined endpoints
   */
  static get endpoints() {
    return {
      ...super.endpoints,
      testIn: {
        in: true,
        default: true,
        receive: 'testReceive'
      },
      testOut: {
        out: true,
        default: true,
    //    target: 'service(logger).log'
      }
    };
  }

  static get configurationAttributes() {
    return Object.assign(
      createAttributes({
        key3: {
          needsRestart: true,
          private: true
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

  async testReceive(entry)
  {

  }
}

export class ServiceProvider extends ServiceProviderMixin(Service, TestLogger) {
  static get name() {
    return "service-provider";
  }
}

export async function makeServices(logLevel = "info") {
  const sp = new ServiceProvider({ logLevel });

  await sp.start();

  await sp.registerService(new TestService({ logLevel }, sp));
  await sp.registerService(new TestService({ logLevel, name: "t2" }, sp));

  return sp;
}
