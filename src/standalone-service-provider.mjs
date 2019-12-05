import Service  from './service.mjs';
import ServiceProviderMixin from './service-provider-mixin.mjs';

/**
 * simple service manager (for examples and testing only)
 */
export default class StandaloneServiceProvider extends ServiceProviderMixin(Service) {
  /**
   * @return {string} 'standalone-provider'
   */
  static get name() {
    return 'standalone-provider';
  }
}
