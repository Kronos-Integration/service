[![npm](https://img.shields.io/npm/v/kronos-service.svg)](https://www.npmjs.com/package/kronos-service)
[![Greenkeeper](https://badges.greenkeeper.io/Kronos-Integration/kronos-service.svg)](https://greenkeeper.io/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/Kronos-Integration/kronos-service)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Build Status](https://secure.travis-ci.org/Kronos-Integration/kronos-service.png)](http://travis-ci.org/Kronos-Integration/kronos-service)
[![bithound](https://www.bithound.io/github/Kronos-Integration/kronos-service/badges/score.svg)](https://www.bithound.io/github/Kronos-Integration/kronos-service)
[![codecov.io](http://codecov.io/github/Kronos-Integration/kronos-service/coverage.svg?branch=master)](http://codecov.io/github/Kronos-Integration/kronos-service?branch=master)
[![Coverage Status](https://coveralls.io/repos/Kronos-Integration/kronos-service/badge.svg)](https://coveralls.io/r/Kronos-Integration/kronos-service)
[![Known Vulnerabilities](https://snyk.io/test/github/Kronos-Integration/kronos-service/badge.svg)](https://snyk.io/test/github/Kronos-Integration/kronos-service)
[![GitHub Issues](https://img.shields.io/github/issues/Kronos-Integration/kronos-service.svg?style=flat-square)](https://github.com/Kronos-Integration/kronos-service/issues)
[![Stories in Ready](https://badge.waffle.io/Kronos-Integration/kronos-service.svg?label=ready&title=Ready)](http://waffle.io/Kronos-Integration/kronos-service)
[![Dependency Status](https://david-dm.org/Kronos-Integration/kronos-service.svg)](https://david-dm.org/Kronos-Integration/kronos-service)
[![devDependency Status](https://david-dm.org/Kronos-Integration/kronos-service/dev-status.svg)](https://david-dm.org/Kronos-Integration/kronos-service#info=devDependencies)
[![docs](http://inch-ci.org/github/Kronos-Integration/kronos-service.svg?branch=master)](http://inch-ci.org/github/Kronos-Integration/kronos-service)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![downloads](http://img.shields.io/npm/dm/kronos-service.svg?style=flat-square)](https://npmjs.org/package/kronos-service)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

kronos-service
=====
Base service implementation

# API Reference

* <a name="EndpointsMixin"></a>

## EndpointsMixin()
Endpoint accessor mixin
Manages endpoints in a container

**Kind**: global function  

* <a name="defineServiceConsumerProperties"></a>

## defineServiceConsumerProperties()
assign services based on a configuration

**Kind**: global function  

* <a name="ServiceProviderMixin"></a>

## ServiceProviderMixin()
Provide services and hold service configuration.
By default a service provider has two build in services
'logger' and 'config'.

**Kind**: global function  

* <a name="value"></a>

## value(config) ⇒ <code>Set</code>
Takes attribute values from config parameters
and copies them over to the object.
Copying is done according to configurationAttributes
Which means we loop over all configuration attributes
and then for each attribute decide if we use the default, call a setter function
or simply assign the attribute value

**Kind**: global function  
**Returns**: <code>Set</code> - of modified attributes  

| Param | Type |
| --- | --- |
| config | <code>object</code> | 


* <a name="<anonymous>..ServiceConfig...receive"></a>

## &lt;anonymous&gt;~ServiceConfig~.receive()
requests can be an array of config entries

**Kind**: static method of <code>&lt;anonymous&gt;~ServiceConfig~</code>  

* <a name="<anonymous>.._class"></a>

## &lt;anonymous&gt;~_class()
if config is an array entry 0 then entry 0 will be passed to super and all other entries
are handed over as initial config to the config services

**Kind**: inner method of <code>&lt;anonymous&gt;</code>  

* * *

install
=======

With [npm](http://npmjs.org) do:

```shell
npm install kronos-service
```

license
=======

BSD-2-Clause
