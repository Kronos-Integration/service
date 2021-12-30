import { ServiceLogger } from "@kronos-integration/service";
import { setTimeout } from "timers/promises";

export class TestLogger extends ServiceLogger {
    constructor(...args) {
      super(...args);
      this.logEntries = [];
      this.endpoints.log.receive = entry => this.logEntries.push(entry);
    }
  
    async _start() {
      return setTimeout(1000);
    }
  }
