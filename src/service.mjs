import events from "events";
import safeStringify from "fast-safe-stringify";

import { ReceiveEndpoint } from "@kronos-integration/endpoint";

import {
  defaultLogLevels,
  defineLogLevelProperties,
  LogLevelMixin,
  makeLogEvent
} from "loglevel-mixin";

import { prepareActions, StateTransitionMixin } from "statetransition-mixin";

import {
  createAttributes,
  getAttribute,
  setAttributes
} from "model-attributes";

import EndpointsMixin from "./endpoints-mixin.mjs";

/**
 * key of the service description
 */
const DESCRIPTION = Symbol("description");

const _ca = createAttributes({
  description: {
    type: "string",
    description: "human readable description of the step"
  },
  logLevel: {
    description: `logging level one of: ${Object.keys(defaultLogLevels)}`,
    default: defaultLogLevels.info,
    type: "string",
    setter(newValue) {
      if (newValue !== undefined) {
        const l = defaultLogLevels[newValue];
        if (l !== undefined) {
          this.logLevel = l;
          return true;
        }
      }
      return false;
    },
    getter() {
      return this.logLevel.name;
    }
  },
  timeout: {
    attributes: {
      start: {
        description: "service start timeout",
        type: "duration",
        default: 5
      }
    }
  }
});

const dummyLogReceiver = new ReceiveEndpoint("logReceiver", {
  endpointIdentifier(ep) {
    return undefined; // prevent target;
  }
});

dummyLogReceiver.receive = entry => {
  console.log(safeStringify(entry));
};

/**
 * Service
 * The initial state is 'stopped'
 * All services have at least three endpoints:
 * - log _out_: log events
 * - config _in_: configuration request
 * - command _in_: administrative actions to be executed by the step
 * @param {Object} config
 * @param {string} config.logLevel
 * @param {string} config.description
 * @param {Object} config.endpoints
 * @param {Service} owner
 */
export default class Service extends EndpointsMixin(
  StateTransitionMixin(
    LogLevelMixin(events),
    prepareActions({
      start: {
        stopped: {
          target: "running",
          during: "starting",
          rejected: "failed",
          timeout: 5000
        }
      },
      restart: {
        stopped: {
          target: "running",
          during: "starting",
          rejected: "failed",
          timeout: 5000
        },
        running: {
          target: "running",
          during: "restarting",
          timeout: 5000
        }
      },
      stop: {
        running: {
          target: "stopped",
          during: "stopping",
          rejected: "failed",
          timeout: 5000
        },
        starting: {
          target: "stopped",
          during: "stopping",
          rejected: "failed",
          timeout: 5000
        },
        failed: {
          target: "stopped",
          during: "stopping",
          rejected: "failed",
          timeout: 1000
        }
      }
    }),
    "stopped"
  )
) {
  static get description() {
    return "This service is the base class for service implementations";
  }

  static get name() {
    return "service";
  }

  /**
   * Meta information for the config attributes.
   * - default optional default value of the attribute
   * - needsRestart optional modification requires a service restart
   * - setter(newValue,attrribute) optional function to be used if simple value assignment is not enough
   * The Service class only defines the logLevel, ans start timeout attribute
   * @return {Object}
   */
  static get configurationAttributes() {
    return _ca;
  }

  /**
   * Definition of the predefined endpoints
   * - log _out_
   * - config _in_
   * - command _in_
   * @return {Object} predefined endpoints
   */
  static get endpoints() {
    return {
      log: {
        out: true,
        default: true,
        // connected: 'service(logger).log'
        connected: dummyLogReceiver
      },
      config: {
        default: true,
        receive: "configure"
      },
      command: {
        default: true,
        receive: "execute"
      }
    };
  }

  constructor(config, owner) {
    super();

    if (owner !== undefined) {
      Object.defineProperty(this, "owner", {
        value: owner
      });
    }

    if (config === undefined) {
      config = {};
    } else {
      if (config.name !== undefined) {
        Object.defineProperty(this, "name", {
          value: config.name
        });
      }
    }

    const logLevel = process.env.LOGLEVEL
      ? process.env.LOGLEVEL
      : process.env.DEBUG
      ? "debug"
      : config.logLevel;

    defineLogLevelProperties(
      this,
      defaultLogLevels,
      logLevel !== undefined
        ? defaultLogLevels[logLevel] || defaultLogLevels.info
        : defaultLogLevels.info
    );

    this.createEndpointsFromConfig(config.endpoints, this.owner);
    this._configure(config);
  }

  get configurationAttributes() {
    return this.constructor.configurationAttributes;
  }

  get type() {
    return this.constructor.name;
  }

  get description() {
    return this[DESCRIPTION] || this.constructor.description;
  }

  set description(desc) {
    this[DESCRIPTION] = desc;
  }

  async execute(command) {
    // TODO admin query language ?
    // for now we return the config

    const ca = this.configurationAttributes;

    for (const an in ca) {
      getAttribute(this, ca, an);
    }

    return {
      name: this.name,
      state: this.state
    };
  }

  /**
   * Called when the service state changes.
   * Emits a serviceStateChanged event to the owner
   * @param {string} oldState
   * @param {string} newState
   */
  stateChanged(oldState, newState) {
    this.owner.emit("serviceStateChanged", this, oldState, newState);
    this.trace({
      message: `${this.name} transitioned from ${oldState} to ${newState}`,
      from: oldState,
      state: newState
    });
  }

  stateTransitionRejection(rejected, newState) {
    const p = super.stateTransitionRejection(rejected, newState);
    this.error({
      message: "transition rejected",
      rejected,
      newState
    });
    return p;
  }

  /**
   * Called when state transition is not allowed
   * @param {string} action originating action name
   * @throws always
   */
  async rejectWrongState(action) {
    throw new Error(`Can't ${action} ${this} in ${this.state} state`);
  }

  /**
   * Deliver transtion timeout
   * @param {Object} transition
   * @return {number} milliseconds before throwing for a logn running transition
   */
  timeoutForTransition(transition) {
    if (transition.name.startsWith("start")) {
      return this.timeout.start * 1000;
    }

    return super.timeoutForTransition(transition);
  }

  /**
   * Restart action
   * default implementation does a _stop() and a _start()
   * @return {Promise} fulfills after start
   */
  async _restart() {
    await this._stop();
    return this._start();
  }

  /**
   * Restarts if in running mode
   * Otherwise does nothing
   * @returns {Promise} resolves when restart is done (or immediate if no restart triggered)
   */
  async restartIfRunning() {
    if (this.state === "running") {
      return this.restart();
    }
  }

  /**
   * mapping of properties used in toString
   * @return {Object}
   */
  get toStringAttributes() {
    return { state: "state" };
  }

  /**
   * Returns the string representation of this step
   * @return {string} human readable name
   */
  toString() {
    return `${this.name}(${Object.entries(this.toStringAttributes)
      .map(([name, prop]) => `${name}=${this[prop]}`)
      .join(",")})`;
  }

  toJSON() {
    return this.toJSONWithOptions({
      includeRuntimeInfo: false,
      includeDefaults: false,
      includeName: true,
      includeConfig: false
    });
  }

  /**
   * Deliver json representation
   * @param {Object} options
   * @param {boolean} options.includeRuntimeInfo include runtime informtion like state
   * @param {boolean} options.includeDefaults  include default endpoints
   * @param {boolean} options.includeName include name of the service
   * @param {boolean} options.includeConfig  include config attributes
   * @return {Object} json representation
   */
  toJSONWithOptions(options = {}) {
    const json = {
      type: this.type
    };

    if (options.includeName) {
      json.name = this.name;
    }

    if (options.includeRuntimeInfo) {
      json.state = this.state;
      json.logLevel = this.logLevel;
    }

    if (options.includeConfig) {
      const ca = this.configurationAttributes;
      Object.keys(ca).forEach(name => (json[name] = this[name]));
    }

    for (const endpointName in this.endpoints) {
      const ep = this.endpoints[endpointName];

      function add(ep) {
        if (json.endpoints === undefined) {
          json.endpoints = {};
        }
        json.endpoints[endpointName] = ep.toJSON();
      }

      if (ep.isDefault) {
        if (options.includeDefaults) {
          add(ep);
        }
      } else {
        add(ep);
      }
    }

    return json;
  }

  /**
   * defaults to the type
   * @return {string} type
   */
  get name() {
    return this.type;
  }

  /**
   * Should we start when beeing registered
   * @return {boolean} false
   */
  get autostart() {
    return false;
  }

  /**
   * Takes attribute values from config parameters
   * and copies them over to the object.
   * Copying is done according to configurationAttributes
   * Which means we loop over all configuration attributes
   * and then for each attribute decide if we use the default, call a setter function
   * or simply assign the attribute value
   * @param {Object} config
   * @return {Set} of modified attributes
   */
  _configure(config) {
    const modified = new Set();
    setAttributes(
      this,
      this.configurationAttributes,
      config,
      (ca, path, value) => {
        this.trace( level => { return {
          message: `config ${path}: ${value}`,
          attribute: path,
          value: value
        }});
        modified.add(ca);
      }
    );
    return modified;
  }

  /**
   * Use new configuration.
   * Internally calls _configure(config) as the constructor does
   * If attribute with needsRestart are touched the restartIfRunning method
   * will be called
   * @param {Object} config
   * @return {Promise} fillfills when config is applied
   */
  async configure(config) {
    const modified = this._configure(config);

    for (const a of modified) {
      if (a.needsRestart) {
        return this.restartIfRunning();
      }
    }
  }

  /**
   * Adds service name to the log event
   * @param {string} level the log level
   * @param {Object} arg log content
   */
  log(level, arg) {
    this.endpoints.log.receive(
      makeLogEvent(level, arg, {
        service: this.name
      })
    );
  }

  /**
   * @return {string} separator between service name and endpoint name
   **/
  get endpointParentSeparator() {
    return ":";
  }
}
