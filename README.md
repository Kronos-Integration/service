[![npm](https://img.shields.io/npm/v/@kronos-integration/service.svg)](https://www.npmjs.com/package/@kronos-integration/service)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![Open Bundle](https://bundlejs.com/badge-light.svg)](https://bundlejs.com/?q=@kronos-integration/service)
[![downloads](http://img.shields.io/npm/dm/@kronos-integration/service.svg?style=flat-square)](https://npmjs.org/package/@kronos-integration/service)
[![GitHub Issues](https://img.shields.io/github/issues/Kronos-Integration/service.svg?style=flat-square)](https://github.com/Kronos-Integration/service/issues)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2FKronos-Integration%2Fservice%2Fbadge\&style=flat)](https://actions-badge.atrox.dev/Kronos-Integration/service/goto)
[![Styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/Kronos-Integration/service/badge.svg)](https://snyk.io/test/github/Kronos-Integration/service)
[![Coverage Status](https://coveralls.io/repos/Kronos-Integration/service/badge.svg)](https://coveralls.io/github/Kronos-Integration/service)

# @kronos-integration/service

Base service implementation

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

*   [EndpointsMixin](#endpointsmixin)
    *   [Parameters](#parameters)
*   [endpoints](#endpoints)
*   [InitializationContext](#initializationcontext)
*   [InitializationContext](#initializationcontext-1)
    *   [Parameters](#parameters-1)
    *   [Properties](#properties)
*   [serviceProvider](#serviceprovider)
*   [ServiceConfig](#serviceconfig)
    *   [Parameters](#parameters-2)
    *   [Properties](#properties-1)
    *   [configFor](#configfor)
        *   [Parameters](#parameters-3)
    *   [clearPreserved](#clearpreserved)
        *   [Parameters](#parameters-4)
    *   [configureValue](#configurevalue)
        *   [Parameters](#parameters-5)
    *   [configure](#configure)
        *   [Parameters](#parameters-6)
    *   [autostart](#autostart)
    *   [name](#name)
*   [merge](#merge)
    *   [Parameters](#parameters-7)
*   [defineServiceConsumerProperties](#defineserviceconsumerproperties)
    *   [Parameters](#parameters-8)
*   [ServiceLogger](#servicelogger)
    *   [autostart](#autostart-1)
    *   [name](#name-1)
    *   [endpoints](#endpoints-1)
*   [ServiceProviderMixin](#serviceprovidermixin)
    *   [Parameters](#parameters-9)
*   [DESCRIPTION](#description)
*   [Service](#service)
    *   [Parameters](#parameters-10)
    *   [extendetName](#extendetname)
    *   [stateChanged](#statechanged)
        *   [Parameters](#parameters-11)
    *   [rejectWrongState](#rejectwrongstate)
        *   [Parameters](#parameters-12)
    *   [timeoutForTransition](#timeoutfortransition)
        *   [Parameters](#parameters-13)
    *   [\_start](#\_start)
    *   [\_stop](#\_stop)
    *   [\_restart](#\_restart)
    *   [restartIfRunning](#restartifrunning)
    *   [toStringAttributes](#tostringattributes)
    *   [isServiceProvider](#isserviceprovider)
    *   [toString](#tostring)
    *   [toJSONWithOptions](#tojsonwithoptions)
        *   [Parameters](#parameters-14)
    *   [name](#name-2)
    *   [autostart](#autostart-2)
    *   [\_configure](#\_configure)
        *   [Parameters](#parameters-15)
    *   [configure](#configure-1)
        *   [Parameters](#parameters-16)
    *   [log](#log)
        *   [Parameters](#parameters-17)
    *   [configurationAttributes](#configurationattributes)
    *   [endpoints](#endpoints-2)
*   [StandaloneServiceProvider](#standaloneserviceprovider)
    *   [name](#name-3)

## EndpointsMixin

Endpoint accessor mixin.
Manages endpoints in a container.

### Parameters

*   `superclass` **Class** class to be extended

Returns **Class** extended class

## endpoints

Default set of endpoints to create.

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** {} empty set

## InitializationContext

Keeps track of all in flight object creations and loose ends during config initialization.

## InitializationContext

### Parameters

*   `serviceProvider` **ServiceProvider** 
*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

    *   `options.logLevel` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### Properties

*   `outstandingServices` **[Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Service](#service)>>** 
*   `outstandingFactories` **[Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)>>** 
*   `outstandingEndpointConnections` **[Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<Endpoint>>** 

## serviceProvider

if config belongs to the provider we represent ourselfs

## ServiceConfig

**Extends Service**

Config providing service.
Dispatches config requests to services;
or preserves them until a maching service becomes avaliable.

### Parameters

*   `config`  
*   `ic`  

### Properties

*   `preservedConfigs` **[Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** values for services not already established

### configFor

Deliver configuration for a given service.

#### Parameters

*   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** service name
*   `config` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

### clearPreserved

Forget about preserved config of a service.

#### Parameters

*   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** service name

### configureValue

Set config entry.

#### Parameters

*   `key` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** path to the value
*   `value` **any** 

### configure

#### Parameters

*   `config` **([Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object))** 

### autostart

We always start immediate.

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true

### name

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 'config'

## merge

Merge from b into a.
When *a* and *b* are arrays of values only the none duplicates are appendend to *a*.

### Parameters

*   `a` **any** 
*   `b` **any** 

Returns **any** merged b into a

## defineServiceConsumerProperties

Assign services based on a configuration.

### Parameters

*   `target` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** object
*   `config` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** service defintion
*   `provider` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** service provider
*   `waitUntilFactoryPresent` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

## ServiceLogger

**Extends Service**

Log receiving service.

### autostart

We always start immediate.

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true

### name

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 'logger'

### endpoints

Adds a log input endpoint to the set of Service endpoints.

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** predefined endpoints

## ServiceProviderMixin

Provide services and hold service configuration.
By default a service provider has two build in services
'logger' and 'config'.

### Parameters

*   `superclass`  
*   `serviceLoggerClass` **Class** where the logging houtd go (optional, default `ServiceLogger`)
*   `serviceConfigClass` **Class** where the config comes from (optional, default `ServiceConfig`)

## DESCRIPTION

Key of the service description.

## Service

**Extends EndpointsMixin(StateTransitionMixin(LogLevelMixin(class {}), prepareActions({
  start: {
    stopped: rsfDefault
  },
  restart: {
    stopped: rsfDefault,
    running: {
      target: "running",
      during: "restarting",
      timeout
    }
  },
  stop: {
    running: ssfDefault,
    starting: ssfDefault,
    failed: ssfDefault
  }
}), "stopped"))**

Service
The initial state is 'stopped'.
All services have at least three endpoints:

*   log *out*: log events
*   config *in*: configuration request
*   command *in*: administrative actions to be executed by the step

### Parameters

*   `config` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

    *   `config.name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    *   `config.logLevel` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    *   `config.autostart` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** defaults to false
    *   `config.description` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** human readable description
    *   `config.endpoints` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** will be merged with the build in ones
*   `ic` **[InitializationContext](#initializationcontext)** 

### extendetName

Used in human readable state messages.
Besides the actual service name it may contain additional short hints.

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### stateChanged

Called when the service state changes.
Emits a serviceStateChanged event to the owner.

#### Parameters

*   `oldState` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
*   `newState` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### rejectWrongState

Called when state transition is not allowed.

#### Parameters

*   `action` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** originating action name

<!---->

*   Throws **any** always

### timeoutForTransition

Deliver transition timeout.

#### Parameters

*   `transition` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** milliseconds before throwing for a long running transition

### \_start

Opens all endpoint connections.

### \_stop

Closes all endpoint connections.

### \_restart

Restart action.
default implementation does a \_stop() and a \_start()

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)** fulfills after start

### restartIfRunning

Restarts if in running mode.
Otherwise does nothing.

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)** resolves when restart is done (or immediate if no restart triggered)

### toStringAttributes

Mapping of properties used in toString.

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

### isServiceProvider

Base service is not a provider.

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** false

### toString

Returns the string representation of this service.

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** human readable name

### toJSONWithOptions

Deliver json representation.

#### Parameters

*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

    *   `options.includeRuntimeInfo` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** include runtime informtion like state
    *   `options.includeDefaults` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** include default endpoints
    *   `options.includeName` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** include name of the service
    *   `options.includeConfig` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** include config attributes
    *   `options.includePrivate` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** include private config attributes

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** json representation

### name

Defaults to the type.

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** type

### autostart

Should we start when beeing registered.

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** false

### \_configure

Takes attribute values from config parameters
and copies them over to the object.
Copying is done according to configurationAttributes.
Which means we loop over all configuration attributes.
and then for each attribute decide if we use the default, call a setter function
or simply assign the attribute value.

#### Parameters

*   `config` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set)** of modified attributes

### configure

Use new configuration.
Internally calls \_configure(config) as the constructor does.
If attribute with needsRestart are touched the restartIfRunning method
will be called.

#### Parameters

*   `config` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)** fillfills when config is applied

### log

Adds service name to the log event.

#### Parameters

*   `level` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the log level
*   `arg` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** log content

### configurationAttributes

Meta information for the config attributes.

*   default optional default value of the attribute
*   needsRestart optional modification requires a service restart
*   setter(newValue,attribute) optional function to be used if simple value assignment is not enough

The Service class only defines the logLevel, and start/stop/restart timeout attribute

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

### endpoints

Definition of the predefined endpoints.

*   log *out*
*   config *in*

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** predefined endpoints

## StandaloneServiceProvider

**Extends ServiceProviderMixin(Service)**

Simple service manager (for examples and testing only).

### name

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 'standalone-provider'

# install

With [npm](http://npmjs.org) do:

```shell
npm install @kronos-integration/service
```

# license

BSD-2-Clause
