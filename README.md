# jsx-transform [![Build Status](http://img.shields.io/travis/alexmingoia/jsx-transform.svg?style=flat)](http://travis-ci.org/alexmingoia/jsx-transform) [![NPM version](http://img.shields.io/npm/v/jsx-transform.svg?style=flat)](https://npmjs.org/package/jsx-transform) [![Dependency Status](http://img.shields.io/david/alexmingoia/jsx-transform.svg?style=flat)](http://david-dm.org/alexmingoia/jsx-transform)

> JSX transpiler. Desugar JSX into JavaScript.

This module aims to be a standard and configurable implementation of JSX
decoupled from [React](https://github.com/facebook/react) for use with
[Mercury](https://github.com/Raynos/mercury) or other modules.

JSX is a JavaScript syntax for composing virtual DOM elements.
See React's [documentation][0] for an explanation.

For linting files containing JSX see
[JSXHint](https://github.com/STRML/JSXHint).

## Installation

```sh
npm install jsx-transform
```

## API
<a name="module_jsx-transform"></a>
## jsx-transform
This module aims to be a standard and configurable implementation of JSX
decoupled from [React](https://github.com/facebook/react) for use with
[Mercury](https://github.com/Raynos/mercury) or other modules.

JSX is a JavaScript syntax for composing virtual DOM elements.
See React's [documentation][0] for an explanation.

For linting files containing JSX see
[JSXHint](https://github.com/STRML/JSXHint).


* [jsx-transform](#module_jsx-transform)
  * [~fromString(str, [options])](#module_jsx-transform..fromString) ⇒ <code>String</code>
  * [~fromFile(path, [options])](#module_jsx-transform..fromFile) ⇒ <code>String</code>
  * [~browserifyTransform([filename], [options])](#module_jsx-transform..browserifyTransform) ⇒ <code>function</code>

<a name="module_jsx-transform..fromString"></a>
### jsx-transform~fromString(str, [options]) ⇒ <code>String</code>
Desugar JSX and return transformed string.

**Kind**: inner method of <code>[jsx-transform](#module_jsx-transform)</code>  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>String</code> |  |
| [options] | <code>Object</code> |  |
| options.factory | <code>String</code> | Factory function name for element creation. |
| [options.spreadFn] | <code>String</code> | Name of function for use with spread attributes (default: Object.assign). |
| [options.unknownTagPattern] | <code>String</code> | uses given pattern for unknown tags where `{tag}` is replaced by the tag name. Useful for rending mercury components as `Component.render()` instead of `Component()`. |
| [options.passUnknownTagsToFactory] | <code>Boolean</code> | Handle unknown tags like known tags, and pass them as an object to `options.factory`. If true, `createElement(Component)` instead of `Component()` (default: false). |
| [options.unknownTagsAsString] | <code>Boolean</code> | Pass unknown tags as string to `options.factory` (default: false). |
| [options.arrayChildren] | <code>Boolean</code> | Pass children as array instead of arguments (default: true). |

**Example**  
```javascript
var jsx = require('jsx-transform');

jsx.fromString('<h1>Hello World</h1>', {
  factory: 'mercury.h'
});
// => 'mercury.h("h1", null, ["Hello World"])'
```
<a name="module_jsx-transform..fromFile"></a>
### jsx-transform~fromFile(path, [options]) ⇒ <code>String</code>
**Kind**: inner method of <code>[jsx-transform](#module_jsx-transform)</code>  

| Param | Type |
| --- | --- |
| path | <code>String</code> | 
| [options] | <code>Object</code> | 

<a name="module_jsx-transform..browserifyTransform"></a>
### jsx-transform~browserifyTransform([filename], [options]) ⇒ <code>function</code>
Make a browserify transform.

**Kind**: inner method of <code>[jsx-transform](#module_jsx-transform)</code>  
**Returns**: <code>function</code> - browserify transform  

| Param | Type | Description |
| --- | --- | --- |
| [filename] | <code>String</code> |  |
| [options] | <code>Object</code> |  |
| [options.extensions] | <code>String</code> | Array of file extensions to run browserify transform on (default: `['.js', '.jsx', '.es', '.es6']`). |

**Example**  
```javascript
var browserify = require('browserify');
var jsxify = require('jsx-transform').browserifyTransform;

browserify()
  .transform(jsxify, options)
  .bundle()
```

Use `.configure(options)` to return a configured transform:

```javascript
var browserify = require('browserify');
var jsxify = require('jsx-transform').browserifyTransform;

browserify({
  transforms: [jsxify.configure(options)]
}).bundle()
```

Use in `package.json`:

```json
"browserify": {
  "transform": [
    ["jsx-transform/browserify", { "factory": "h" }]
  ]
}
```


## BSD Licensed

[0]: https://facebook.github.io/react/docs/jsx-in-depth.html
