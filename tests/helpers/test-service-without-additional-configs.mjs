import { createAttributes } from "model-attributes";
import { Service } from "@kronos-integration/service";

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
  