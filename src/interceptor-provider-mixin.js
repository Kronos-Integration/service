/**
 * Register & provide Interceptors.
 */
export function InterceptorProviderMixin(superclass) {
  return class InterceptorProviderMixin extends superclass {
    constructor(...args) {
      super(...args);

      Object.defineProperty(this, 'registeredInterceptors', { value: new Map() });
    }

    registerInterceptor(interceptor) {
      this.registeredInterceptors.set(interceptor.name, interceptor);
    }

    declareInterceptor(config, ...args) {
      const factory = this.registeredInterceptor.get(config.type);
      return new factory(config, ...args);
    }
  };
}
