/*!
 * jsx-transform
 * https://github.com/alexmingoia/jsx-transform
 */

/**
 * This module aims to be a standard and configurable implementation of JSX
 * decoupled from {@link https://github.com/facebook/react|React} for use with
 * {@link https://github.com/Raynos/mercury|Mercury} or other modules.
 *
 * For linting files containing JSX see
 * {@link https://github.com/STRML/JSXHint|JSXHint}.
 *
 * @module jsx-transform
 */

'use strict';

var fs = require('fs');
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
 * @param {String} str
 * @param {Object=} options
 * @param {String} options.factory Factory function name for element creation.
 * @param {String=} options.spreadFn Name of function for use with spread
 * attributes (default: Object.assign).
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
    options.arrayChildren = true
  }

  if (typeof options.spreadFn !== 'string') {
    options.spreadFn = 'Object.assign';
  }

  var transformed = jstransform([visitNode], str, options).code;

  return trimTrailingSpaces(transformed);
}

/**
 * See {@link module:jsx-transform.fromString} for usage.
 *
 * @param {String} path
 * @param {Object=} options
 * @returns {String}
 */
function fromFile(path, options) {
  var transformed = transform(fs.readFileSync(path, 'utf8'), options);

  return trimTrailingSpaces(transformed);
}

/**
 * Return a browserify transform.
 *
 * See {@link module:jsx-transform.fromString} for options.
 *
 * @example
 *
 * ```javascript
 * var browserify = require('browserify');
 * var jsxify = require('jsx-transform').browserify;
 *
 * browserify()
 *   .transform(jsxify(options))
 *   .bundle()
 * ```
 *
 * @param {Object=} options
 * @returns {Function} browserify transform
 */
function browserifyTransform(options) {
  return function (filename) {
    return through(function (buf, enc, next) {
      try {
        this.push(transform(buf.toString('utf8'), options));
        next();
      } catch (err) {
        next(err);
      }
    });
  }
}
