# jsx-transform [![Build Status](http://img.shields.io/travis/alexmingoia/jsx-transform.svg?style=flat)](http://travis-ci.org/alexmingoia/jsx-transform) [![NPM version](http://img.shields.io/npm/v/jsx-transform.svg?style=flat)](https://npmjs.org/package/jsx-transform) [![Dependency Status](http://img.shields.io/david/alexmingoia/jsx-transform.svg?style=flat)](http://david-dm.org/alexmingoia/jsx-transform)

> JSX transpiler. Desugar JSX into JavaScript.

This module aims to be a standard and configurable implementation of JSX
decoupled from [React](https://github.com/facebook/react) for use with
[Mercury](https://github.com/Raynos/mercury) or other modules.

For linting files containing JSX see
[JSXHint](https://github.com/STRML/JSXHint).

## Installation

```sh
npm install jsx-transform
```

## Example

```javascript
var jsx = require('jsx-transform');

jsx.fromString('<h1>Hello World</h1>', {
  factory: 'mercury.h'
});
// => 'mercury.h("h1", null, ["Hello World"])'
```

## JSX

JSX is a JavaScript syntax for composing virtual DOM elements.
See React's [documentation][0] for an explanation.

## API
**Members**

* [jsx-transform](#module_jsx-transform)
  * [jsx-transform~fromString(str, [options])](#module_jsx-transform..fromString)
  * [jsx-transform~fromFile(path, [options])](#module_jsx-transform..fromFile)
  * [jsx-transform~browserifyTransform([options])](#module_jsx-transform..browserifyTransform)

<a name="module_jsx-transform..fromString"></a>
##jsx-transform~fromString(str, [options])
Desugar JSX and return transformed string.

**Params**

- str `String`  
- \[options\] `Object`  
  - factory `String` - Factory function name for element creation.  
  - \[passUnknownTagsToFactory\] `Boolean` - Handle unknown tags
like known tags, and pass them as an object to `options.factory`. If
true, `createElement(Component)` instead of `Component()` (default: false).  
  - \[unknownTagsAsString\] `Boolean` - Pass unknown tags as string
to `options.factory` (default: false).  
  - \[arrayChildren\] `Boolean` - Pass children as array instead of
arguments (default: true).  

**Scope**: inner function of [jsx-transform](#module_jsx-transform)  
**Returns**: `String`  
<a name="module_jsx-transform..fromFile"></a>
##jsx-transform~fromFile(path, [options])
See [module:jsx-transform.fromString](module:jsx-transform.fromString) for usage.

**Params**

- path `String`  
- \[options\] `Object`  

**Scope**: inner function of [jsx-transform](#module_jsx-transform)  
**Returns**: `String`  
<a name="module_jsx-transform..browserifyTransform"></a>
##jsx-transform~browserifyTransform([options])
Return a browserify transform.

See [module:jsx-transform.fromString](module:jsx-transform.fromString) for options.

**Params**

- \[options\] `Object`  

**Scope**: inner function of [jsx-transform](#module_jsx-transform)  
**Returns**: `function` - browserify transform  
**Example**  
```javascript
var browserify = require('browserify');
var jsxify = require('jsx-transform').browserify;

browserify()
  .transform(jsxify(options))
  .bundle()
```



## BSD Licensed

[0]: https://facebook.github.io/react/docs/jsx-in-depth.html
