/*!
 * jsx-transform
 * https://github.com/alexmingoia/jsx-transform
 */

/**
 * This module aims to be a standard and configurable implementation of JSX
 * decoupled from {@link https://github.com/facebook/react|React} for use with
 * {@link https://github.com/Raynos/mercury|Mercury} or other modules.
 *
 * JSX is a JavaScript syntax for composing virtual DOM elements.
 * See React's [documentation][0] for an explanation.
 *
 * For linting files containing JSX see
 * {@link https://github.com/STRML/JSXHint|JSXHint}.
 *
 * @module jsx-transform
 */

'use strict';

var fs = require('fs');
var getExtension = require('path').extname;
var jstransform = require('jstransform').transform;
var visitNode = require('./visitor');
var trimTrailingSpaces = require('./trimTrailingSpaces');
var through = require('through2');

module.exports = {
  fromString: fromString,
  fromFile: fromFile,
  browserifyTransform: browserifyTransform,
  visitor: visitNode
};

/**
 * Desugar JSX and return transformed string.
 *
 * @example
 *
 * ```javascript
 * var jsx = require('jsx-transform');
 *
 * jsx.fromString('<h1>Hello World</h1>', {
 *   factory: 'mercury.h'
 * });
 * // => 'mercury.h("h1", null, ["Hello World"])'
 * ```
 *
 * @param {String} str
 * @param {Object=} options
 * @param {String} options.factory Factory function name for element creation.
 * @param {String=} options.spreadFn Name of function for use with spread
 * attributes (default: Object.assign).
 * @param {String=} options.unknownTagPattern uses given pattern for unknown
 * tags where `{tag}` is replaced by the tag name. Useful for rending mercury
 * components as `Component.render()` instead of `Component()`.
 * @param {Boolean=} options.passUnknownTagsToFactory Handle unknown tags
 * like known tags, and pass them as an object to `options.factory`. If
 * true, `createElement(Component)` instead of `Component()` (default: false).
 * @param {Boolean=} options.unknownTagsAsString Pass unknown tags as string
 * to `options.factory` (default: false).
 * @param {Boolean=} options.arrayChildren Pass children as array instead of
 * arguments (default: true).
 * @returns {String}
 */
function fromString(str, options) {
  options = processOptions(options);

  var transformed = jstransform([visitNode], str, options).code;

  return trimTrailingSpaces(transformed);
}

/**
 * @param {String} path
 * @param {Object=} options
 * @returns {String}
 */
function fromFile(path, options) {
  options = processOptions(options);
  var transformed = jstransform([visitNode], fs.readFileSync(path, 'utf8'), options).code;
  return trimTrailingSpaces(transformed);
}

function processOptions(options){
  if (typeof options !== 'object') {
    options = {};
  }

  if (typeof options.factory !== 'string') {
    throw new Error('Missing options.factory function name.');
  }

  // parses the file as an ES6 module, except disabled implicit strict-mode
  if (typeof options.sourceType === 'undefined') {
    options.sourceType = 'nonStrictModule';
  }

  // defaults to true to keep existing behaviour (but inconsietent with babel and react-tools)
  if (typeof options.arrayChildren === 'undefined') {
    options.arrayChildren = true;
  }

  if (typeof options.spreadFn !== 'string') {
    options.spreadFn = 'Object.assign';
  }

  if (typeof options.unknownTagPattern !== 'string') {
    options.unknownTagPattern = '{tag}';
  }

  return options;
}

/**
 * Make a browserify transform.
 *
 * @example
 *
 * ```javascript
 * var browserify = require('browserify');
 * var jsxify = require('jsx-transform').browserifyTransform;
 *
 * browserify()
 *   .transform(jsxify, options)
 *   .bundle()
 * ```
 *
 * Use `.configure(options)` to return a configured transform:
 *
 * ```javascript
 * var browserify = require('browserify');
 * var jsxify = require('jsx-transform').browserifyTransform;
 *
 * browserify({
 *   transforms: [jsxify.configure(options)]
 * }).bundle()
 * ```
 *
 * Use in `package.json`:
 *
 * ```json
 * "browserify": {
 *   "transform": [
 *     ["jsx-transform/browserify", { "factory": "h" }]
 *   ]
 * }
 * ```
 *
 * @param {String=} filename
 * @param {Object=} options
 * @param {String=} options.extensions Array of file extensions to run
 * browserify transform on (default: `['.js', '.jsx', '.es', '.es6']`).
 * @returns {Function} browserify transform
 */
function browserifyTransform(filename, options) {
  return browserifyTransform.configure(options)(filename);
}

browserifyTransform.configure = function (options) {
  if (typeof options.extensions === 'undefined') {
    options.extensions = ['.js', '.jsx', '.es', '.es6'];
  }

  return function (filename) {
    return through(function (buf, enc, next) {
      try {
        if (~options.extensions.indexOf(getExtension(filename))) {
          this.push(fromString(buf.toString('utf8'), options));
        } else {
          this.push(buf.toString());
        }
        next();
      } catch (err) {
        next(err);
      }
    });
  };
}
