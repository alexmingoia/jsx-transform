var Syntax = require('esprima-fb').Syntax;
var utils = require('jstransform/src/utils');

module.exports = visitNode;

/**
 * Visit tag node and desugar JSX.
 *
 * @see {@link https://github.com/facebook/jstransform}
 * @param {Function} traverse
 * @param {Object} object
 * @param {String} path
 * @param {Object} state
 * @returns {Boolean}
 * @private
 */
function visitNode(traverse, object, path, state) {
  var options = state.g.opts;
  var factory = (options.factory);
  var arrayChildren = options.arrayChildren
  var openingEl = object.openingElement;
  var closingEl = object.closingElement;
  var nameObj = openingEl.name;
  var attributes = openingEl.attributes;
  var spreadFn = options.spreadFn;
  var unknownTagPattern = options.unknownTagPattern;

  if (!options.renameAttrs) {
    options.renameAttrs = {};
  }

  utils.catchup(openingEl.range[0], state, trimLeft);

  var tagName = nameObj.name;
  var isJSXIdentifier = nameObj.type === Syntax.JSXIdentifier;
  var knownTag = tagName[0] !== tagName[0].toUpperCase() && isJSXIdentifier;
  var hasAtLeastOneSpreadAttribute = attributes.some(function (attr) {
    return attr.type === Syntax.JSXSpreadAttribute;
  });
  var secondArg = false;

  if (knownTag) {
    utils.append(factory + "('", state); // DOM('div', ...)
  } else if (options.passUnknownTagsToFactory) {
    if (options.unknownTagsAsString) {
      utils.append(factory + "('", state);
    } else {
      utils.append(factory + '(', state);
    }
  }

  utils.move(nameObj.range[0], state);

  if (knownTag) {
    // DOM('div', ...)
    utils.catchup(nameObj.range[1], state);
    utils.append("'", state);
    secondArg = true
  } else if (options.passUnknownTagsToFactory) {
    // DOM(Component, ...)
    utils.catchup(nameObj.range[1], state);
    if (options.unknownTagsAsString) {
      utils.append("'", state);
    }
    secondArg = true
  } else {
    // Component(...)
    tagName = unknownTagPattern.replace('{tag}', nameObj.name);
    utils.append(tagName, state);
    utils.move(
      nameObj.range[1] + (tagName.length - nameObj.name.length),
      state
    );
    utils.append('(', state);
  }

  if (hasAtLeastOneSpreadAttribute) {
    if (options.passUnknownTagsToFactory || knownTag) {
      utils.append(', ' + spreadFn + '({', state);
    } else {
      utils.append(spreadFn + '({', state);
    }
  } else if (attributes.length) {
    if (secondArg) {
      utils.append(', ', state);
    }
    utils.append('{', state);
  }

  var previousWasSpread = false;

  attributes.forEach(function(attr, index) {
    var isLast = (index === (attributes.length - 1));

    if (attr.type === Syntax.JSXSpreadAttribute) {
      // close the previous or initial object
      if (!previousWasSpread) {
        utils.append('}, ', state);
      }

      // Move to the expression start, ignoring everything except parenthesis
      // and whitespace.
      utils.catchup(attr.range[0], state, stripNonParen);
      // Plus 1 to skip `{`.
      utils.move(attr.range[0] + 1, state);
      utils.catchup(attr.argument.range[0], state, stripNonParen);

      traverse(attr.argument, path, state);

      utils.catchup(attr.argument.range[1], state);

      // Move to the end, ignoring parenthesis and the closing `}`
      utils.catchup(attr.range[1] - 1, state, stripNonParen);

      if (!isLast) {
        utils.append(', ', state);
      }

      utils.move(attr.range[1], state);

      previousWasSpread = true;

      return;
    }

    // If the next attribute is a spread, we're effective last in this object
    if (!isLast) {
      isLast = attributes[index + 1].type === Syntax.JSXSpreadAttribute;
    }

    if (attr.name.namespace) {
      throw new Error(
        'Namespace attributes not supported. JSX is not XML.'
      );
    }

    var name = attr.name.name;

    utils.catchup(attr.range[0], state, trimLeft);

    if (previousWasSpread) {
      utils.append('{', state);
    }

    utils.append(quoteJSObjKey(name) + ': ', state);

    if (attr.value) {
      utils.move(attr.name.range[1], state);
      utils.catchupNewlines(attr.value.range[0], state);
      if (attr.value.type === Syntax.Literal) {
        renderJSXLiteral(attr.value, isLast, state);
      } else {
        renderJSXExpressionContainer(traverse, attr.value, isLast, path, state);
      }
    } else {
      state.g.buffer += 'true';
      state.g.position = attr.name.range[1];
      if (!isLast) {
        utils.append(', ', state);
      }
    }

    utils.catchup(attr.range[1], state, trimLeft);

    previousWasSpread = false;
  });

  if (!openingEl.selfClosing) {
    utils.catchup(openingEl.range[1] - 1, state, trimLeft);
    utils.move(openingEl.range[1], state);
  }

  if (attributes.length && !previousWasSpread) {
    utils.append('}', state);
  }

  if (hasAtLeastOneSpreadAttribute) {
    utils.append(')', state);
  }

  // filter out whitespace
  var children = object.children.filter(function(child) {
    return !(child.type === Syntax.Literal
    && typeof child.value === 'string'
    && child.value.match(/^[ \t]*[\r\n][ \t\r\n]*$/));
  });

  if (children.length) {
    if (!attributes.length) {
      if (secondArg) {
        utils.append(', ', state);
      }
      utils.append('null', state);
    }
    var lastRenderableIndex;

    children.forEach(function(child, index) {
      if (child.type !== Syntax.JSXExpressionContainer ||
        child.expression.type !== Syntax.JSXEmptyExpression) {
        lastRenderableIndex = index;
      }
    });

    if (lastRenderableIndex !== undefined) {
      utils.append(', ', state);
    }

    if (arrayChildren && children.length) {
      utils.append('[', state);
    }

    children.forEach(function(child, index) {
      utils.catchup(child.range[0], state, trimLeft);

      var isFirst = index === 0;
      var isLast = index >= lastRenderableIndex;

      if (child.type === Syntax.Literal) {
        renderJSXLiteral(child, isLast, state);
      } else if (child.type === Syntax.JSXExpressionContainer) {
        renderJSXExpressionContainer(traverse, child, isLast, path, state);
      } else {
        traverse(child, path, state);
        if (!isLast) {
          utils.append(',', state);
        }
      }

      utils.catchup(child.range[1], state, trimLeft);
    });
  }

  if (openingEl.selfClosing) {
    // everything up to />
    utils.catchup(openingEl.range[1] - 2, state, trimLeft);
    utils.move(openingEl.range[1], state);
  } else {
    // everything up to </close>
    utils.catchup(closingEl.range[0], state, trimLeft);
    utils.move(closingEl.range[1], state);
  }

  if (arrayChildren && children.length) {
    utils.append(']', state);
  }

  utils.append(')', state);

  return false;
}

/**
 * Returns true if node is JSX tag.
 *
 * @param {Object} object
 * @param {String} path
 * @param {Object} state
 * @returns {Boolean}
 * @private
 */
visitNode.test = function(object, path, state) {
  return object.type === Syntax.JSXElement;
};

/**
 * Taken from {@link https://github.com/facebook/react/blob/0.10-stable/vendor/fbtransform/transforms/xjs.js}
 *
 * @param {Object} object
 * @param {Boolean} isLast
 * @param {Object} state
 * @param {Number} start
 * @param {Number} end
 * @private
 */
function renderJSXLiteral(object, isLast, state, start, end) {
  var lines = object.value.split(/\r\n|\n|\r/);

  if (start) {
    utils.append(start, state);
  }

  var lastNonEmptyLine = 0;

  lines.forEach(function (line, index) {
    if (line.match(/[^ \t]/)) {
      lastNonEmptyLine = index;
    }
  });

  lines.forEach(function (line, index) {
    var isFirstLine = index === 0;
    var isLastLine = index === lines.length - 1;
    var isLastNonEmptyLine = index === lastNonEmptyLine;

    // replace rendered whitespace tabs with spaces
    var trimmedLine = line.replace(/\t/g, ' ');

    // trim whitespace touching a newline
    if (!isFirstLine) {
      trimmedLine = trimmedLine.replace(/^[ ]+/, '');
    }
    if (!isLastLine) {
      trimmedLine = trimmedLine.replace(/[ ]+$/, '');
    }

    if (!isFirstLine) {
      utils.append(line.match(/^[ \t]*/)[0], state);
    }

    if (trimmedLine || isLastNonEmptyLine) {
      utils.append(
        JSON.stringify(trimmedLine) +
        (!isLastNonEmptyLine ? " + ' ' +" : ''),
        state);

      if (isLastNonEmptyLine) {
        if (end) {
          utils.append(end, state);
        }
        if (!isLast) {
          utils.append(', ', state);
        }
      }

      // only restore tail whitespace if line had literals
      if (trimmedLine && !isLastLine) {
        utils.append(line.match(/[ \t]*$/)[0], state);
      }
    }

    if (!isLastLine) {
      utils.append('\n', state);
    }
  });

  utils.move(object.range[1], state);
}

/**
 * Taken from {@link https://github.com/facebook/react/blob/0.10-stable/vendor/fbtransform/transforms/xjs.js}
 *
 * @param {Function} traverse
 * @param {Object} object
 * @param {Boolean} isLast
 * @param {String} path
 * @param {Object} state
 * @returns {Boolean}
 * @private
 */
function renderJSXExpressionContainer(traverse, object, isLast, path, state) {
  // Plus 1 to skip `{`.
  utils.move(object.range[0] + 1, state);
  traverse(object.expression, path, state);

  if (!isLast && object.expression.type !== Syntax.JSXEmptyExpression) {
    // If we need to append a comma, make sure to do so after the expression.
    utils.catchup(object.expression.range[1], state, trimLeft);
    utils.append(', ', state);
  }

  // Minus 1 to skip `}`.
  utils.catchup(object.range[1] - 1, state, trimLeft);
  utils.move(object.range[1], state);
  return false;
}

/**
 * Quote invalid object literal keys.
 *
 * @param {String} name
 * @returns {String}
 * @private
 */
function quoteJSObjKey(name) {
  if (!/^[a-z_$][a-z\d_$]*$/i.test(name)) {
    return "'" + name + "'";
  }
  return name;
}

/**
 * Trim whitespace left of `val`.
 *
 * @param {String} val
 * @returns {String}
 * @private
 */
function trimLeft(val) {
  return val.replace(/^ +/, '');
}

/**
 * Removes all non-parenthesis characters
 */
var reNonParen = /([^\(\)])/g;
function stripNonParen(value) {
  return value.replace(reNonParen, '');
}
