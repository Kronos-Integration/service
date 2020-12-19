import { ServiceLogger } from "@kronos-integration/service";
import { wait } from "./util.mjs";

export class TestLogger extends ServiceLogger {
    constructor(...args) {
      super(...args);
      this.logEntries = [];
      this.endpoints.log.receive = entry => this.logEntries.push(entry);
    }
  
    async _start() {
      return wait(1000);
    }
  }
  