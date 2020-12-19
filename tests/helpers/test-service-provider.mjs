import {
  Service,
  ServiceProviderMixin,
  InitializationContext
} from "@kronos-integration/service";

import { TestService } from "./test-service.mjs";
import { TestLogger } from "./test-logger.mjs";
import { TestConfig } from "./test-config.mjs";

export class TestServiceProvider extends ServiceProviderMixin(
  Service,
  TestLogger,
  TestConfig
) {
  static get name() {
    return "service-provider";
  }
}

export async function makeServices(options) {
  const sp = new TestServiceProvider(options);
  const ic = new InitializationContext(sp, options);

  await sp.registerService(
    new TestService(
      {
        logLevel: sp.logLevel,
        name: "t2",
        endpoints: { testOut: { connected: "service(logger).log" } }
      },
      ic
    )
  );

  ic.resolveOutstandingEndpointConnections();

  await sp.start();

  return sp;
}
