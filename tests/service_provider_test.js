/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  endpoint = require('kronos-endpoint'),
  Service = require('../lib/Service'),
  ServiceProviderMixin = require('../lib/ServiceProviderMixin');

class _ServiceProvider {}
class ServiceProvider extends ServiceProviderMixin(_ServiceProvider) {}

describe('service', () => {
  const sp = new ServiceProvider();

  describe('plain creation', () => {
    it('empty services', () => assert.deepEqual(sp.services, {}));
  });

});
