

/**
 * keeps track of all in flight object creations and loose ends during config initialization
 */
export class InitializationContext {

    constructor() {
        Object.defineProperties(this, {
            _declareServiceByNamePromises: { value: new Map() },
            _serviceFactoryPromises: { value: new Map() }
        });
    }
}