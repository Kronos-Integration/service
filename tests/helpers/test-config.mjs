import { ServiceConfig } from "@kronos-integration/service";
import { setTimeout } from "timers/promises";

export class TestConfig extends ServiceConfig {
  async _start() {
    await setTimeout(1000);

    super.configure({
      service1: {
        key1: 1
      }
    });
  }
}
