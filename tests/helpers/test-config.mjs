import { ServiceConfig } from "@kronos-integration/service";
import { wait } from "./util.mjs";

export class TestConfig extends ServiceConfig {
  async _start() {
    wait(1000);

    super.configure({
      service1: {
        key1: 1
      }
    });
  }
}
