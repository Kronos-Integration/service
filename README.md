[![npm](https://img.shields.io/npm/v/kronos-service.svg)](https://www.npmjs.com/package/kronos-service)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/Kronos-Integration/kronos-service)
[![Build Status](https://secure.travis-ci.org/Kronos-Integration/kronos-service.png)](http://travis-ci.org/Kronos-Integration/kronos-service)
[![bithound](https://www.bithound.io/github/Kronos-Integration/kronos-service/badges/score.svg)](https://www.bithound.io/github/Kronos-Integration/kronos-service)
[![codecov.io](http://codecov.io/github/Kronos-Integration/kronos-service/coverage.svg?branch=master)](http://codecov.io/github/Kronos-Integration/kronos-service?branch=master)
[![Code Climate](https://codeclimate.com/github/Kronos-Integration/kronos-service/badges/gpa.svg)](https://codeclimate.com/github/Kronos-Integration/kronos-service)
[![Known Vulnerabilities](https://snyk.io/test/github/Kronos-Integration/kronos-service/badge.svg)](https://snyk.io/test/github/Kronos-Integration/kronos-service)
[![GitHub Issues](https://img.shields.io/github/issues/Kronos-Integration/kronos-service.svg?style=flat-square)](https://github.com/Kronos-Integration/kronos-service/issues)
[![Dependency Status](https://david-dm.org/Kronos-Integration/kronos-service.svg)](https://david-dm.org/Kronos-Integration/kronos-service)
[![devDependency Status](https://david-dm.org/Kronos-Integration/kronos-service/dev-status.svg)](https://david-dm.org/Kronos-Integration/kronos-service#info=devDependencies)
[![docs](http://inch-ci.org/github/Kronos-Integration/kronos-service.svg?branch=master)](http://inch-ci.org/github/Kronos-Integration/kronos-service)
[![downloads](http://img.shields.io/npm/dm/kronos-service.svg?style=flat-square)](https://npmjs.org/package/kronos-service)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

kronos-service
=====
Base service implementation

# API Reference

* <a name="addEndpoint"></a>

## addEndpoint(ep)
**Kind**: global function  

| Param | Type |
| --- | --- |
| ep | <code>Endpoint</code> | 


* <a name="endpointIdentifier"></a>

## endpointIdentifier(ep) ⇒ <code>String</code>
Deliver an identifier suitable as target name.

**Kind**: global function  
**Returns**: <code>String</code> - endpoint identifier  

| Param | Type | Description |
| --- | --- | --- |
| ep | <code>Endpoint</code> | edntpoint to be identified |


* <a name="stateChanged"></a>

## stateChanged(oldState, newState)
Called when the service state changes.
Emits a serviceStateChanged event to the owner

**Kind**: global function  

| Param | Type |
| --- | --- |
| oldState | <code>String</code> | 
| newState | <code>String</code> | 


* <a name="rejectWrongState"></a>

## rejectWrongState(action) ⇒ <code>Promise</code>
Called when state transition is not allowed

**Kind**: global function  
**Returns**: <code>Promise</code> - rejecting with an Error  

| Param | Type |
| --- | --- |
| action | <code>String</code> | 


* <a name="_restart"></a>

## _restart()
default implementation does a _stop() and a _start()

**Kind**: global function  

* <a name="restartIfRunning"></a>

## restartIfRunning() ⇒ <code>Promise</code>
Restarts if in running mode
Otherwise does nothing

**Kind**: global function  
**Returns**: <code>Promise</code> - resolves when restart is done (or immediate if no restart triggered)  

* <a name="toString"></a>

## toString() ⇒ <code>String</code>
Returns the string representation of this step

**Kind**: global function  
**Returns**: <code>String</code> - human readable name  

* <a name="toJSONWithOptions"></a>

## toJSONWithOptions(options) ⇒ <code>Object</code>
Deliver json representation

**Kind**: global function  
**Returns**: <code>Object</code> - json representation  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | with the following flags:    includeRuntimeInfo - include runtime informtion like state    includeDefaults - also include default endpoints    includeConfig - also include config attributes |


* <a name="_configure"></a>

## _configure(config) ⇒ <code>Set</code>
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
| config | <code>Object</code> | 


* <a name="configure"></a>

## configure(new) ⇒ <code>Promise</code>
Use new configuration.
Internally calls _configure(config) as the constructor does
If attribute with needsRestart are touched the restartIfRunning method
will be called

**Kind**: global function  
**Returns**: <code>Promise</code> - fillfills when config is applied  

| Param | Type | Description |
| --- | --- | --- |
| new | <code>Object</code> | config |


* <a name="log"></a>

## log()
Adds service name to the log event

**Kind**: global function  

* <a name="defineServiceConsumerProperties"></a>

## defineServiceConsumerProperties()
assign services based on a configuration

**Kind**: global function  

* <a name="declareService"></a>

## declareService(config, waitUntilFactoryPresent) ⇒ <code>Promise</code>
Add a new service based on its configuration
If a service for the name is already present and it has a matching type
then its configure() is called and then returned.
Otherwise a new service will be created eventually replacing an already existing service with the same name.

**Kind**: global function  
**Returns**: <code>Promise</code> - resolving to the declared service  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | with     name - the service name     type - the service factory name - defaults to config.name |
| waitUntilFactoryPresent | <code>boolean</code> | waits until someone registers a matching service factory |


* <a name="_stop"></a>

## _stop() ⇒ <code>Promise</code>
Stop all services

**Kind**: global function  
**Returns**: <code>Promise</code> - that fullfills when all services are stopped  

* <a name="<anonymous>...receive"></a>

## &lt;anonymous&gt;~.receive()
requests can be an array of config entries

**Kind**: static method of <code>&lt;anonymous&gt;~</code>  

* <a name="module.exports"></a>

## module.exports()
Provide services and hold service configuration.
By default a service provider has two build in services
'logger' and 'config'.

**Kind**: static method of <code>module</code>  

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
