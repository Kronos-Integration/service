import Service from "../src/service.mjs";

export async function wait(msecs=1000) {
  return new Promise((resolve, reject) => setTimeout(() => resolve(), msecs));
}

export class TestService extends Service {
  static get name() {
    return "test";
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
