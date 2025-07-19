import { prepareAttributesDefinitions } from "pacc";
import { Service } from "@kronos-integration/service";
import { setTimeout } from "timers/promises";

export class TestService extends Service {
  static get name() {
    return "test";
  }

  static get description() {
    return "my description";
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
        receive: "testReceive"
      },
      testOut: {
        out: true,
        default: true
      }
    };
  }

  static get configurationAttributes() {
    return Object.assign(
      prepareAttributesDefinitions({
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
    delete config.endpoints;
    delete config.type;
    Object.assign(this, config);
    await setTimeout(1000);

    return this.restartIfRunning();
  }

  async testReceive(entry) {}
}

export default TestService;
