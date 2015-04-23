/*!
 * jsx-transform
 * https://github.com/alexmingoia/jsx-transform
 */
/**
 * This module aims to be a standard and configurable implementation of JSX
 * decoupled from {@link https://github.com/facebook/react|React}.
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
  browserify: browserifyTransform,
  visitor: visitNode
};

/**
 * Desugar JSX and return transformed string.
 *
 * Known tags are passed as arguments to JSX ident (assume
 * `@jsx Element`):
 *
 *   `<div class="blue"></div>` => `Element('div', { class: 'blue' })`
 *
 * Unknown tags are assumed to be function names in scope:
 *
 *   `<FrontPage class="blue"></FrontPage>` => `FrontPage({ class: 'blue' })`
 *
 * If `options.docblockUnknownTags` is `true` unknown tags are passed to the
 * docblock ident:
 *
 *   `<FrontPage></FrontPage>` => `Element(FrontPage, ...)`
 *
 * @param {String} str
 * @param {Object=} options
 * @param {Boolean=} options.ignoreDocblock Parse files without docblock. If
 * true `options.jsx` must also be set.
 * @param {Boolean=} options.tagMethods use tag name as method of jsx ident
 * instead of argument. If true `DOM.h1()` instead of `DOM('h1')`.
 * @param {Boolean=} options.docblockUnknownTags Handle unknown tags like
 * known tags, and pass them as an object to docblock ident. If true,
 * `DOM(Component)` instead of `Component()` (default: false).
 * @param {Boolean=} options.unknownTagsAsString Pass unknown tags as string
 * instead of object when `options.docblockUnknownTags` is true.
 * @param {String} options.jsx Constructor name (default: set by docblock).
 * @param {String} options.passArray if false follows default react-tools/babel jsx behavour
 * `DOM('h1', null, "hello", firstName + " " + lastName)` instead of
 * `DOM('h1', null, ["Hello ", firstName + " " + lastName])`.
 * @returns {String}
 */
function fromString(str, options) {
  if (typeof options !== 'object') {
    options = {};
  }

  // parses the file as an ES6 module, except disabled implicit strict-mode
  if (typeof options.sourceType === 'undefined') {
    options.sourceType = 'nonStrictModule';
  }

  // defaults to true to keep existing behaviour (but inconsietent with babel and react-tools)
  if (typeof options.passArray === 'undefined') {
    options.passArray = true
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
 * See @link module:jsx-transform.fromString for options.
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
