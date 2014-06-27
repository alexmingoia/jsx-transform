/**
 * Virtual DOM JSX transpiler.
 */

var fs = require('fs');
var transform = require('jstransform').transform;
var Syntax = require('jstransform/node_modules/esprima-fb').Syntax;
var utils = require('jstransform/src/utils');

module.exports = {
  parse: parse,
  parseFile: parseFile,
  renderXJSExpressionContainer: renderXJSExpressionContainer,
  renderXJSLiteral: renderXJSLiteral,
  trimLeft: trimLeft,
  visitNode: visitNode
};

/**
 * Desugar JSX into virtual dom nodes and return transformed string.
 *
 * options:
 *   - ignoreDocblock   Parse files without docblock. If true, `options.jsx`
 *                      must also be set. (default: false)
 *   - tagMethods       use tag as method instead of argument (default: false)
 *                      If true, `DOM.h1()` instead of `DOM("h1")`
 *   - jsx              name of virtual DOM node constructor (default: false)
 *
 * @see https://github.com/Matt-Esch/virtual-dom
 * @see https://github.com/Matt-Esch/vtree
 * @param {String} str
 * @param {Object} options
 * @return {String}
 * @api public
 */
function parse(str, options) {
  if (options && options.ignoreDocblock && !options.jsx) {
    throw new Error("options.jsx must be specified if ignoring docblocks");
  }
  return transform([this.visitNode], str, options).code;
};

/**
 * Desugar JSX in file into virtual dom nodes and return transformed string.
 *
 * @param {String} path
 * @param {Object} options see parse() docs
 * @return {String}
 * @api public
 */
function parseFile(path, options) {
  return this.parse(fs.readFileSync(path, 'utf8'), options);
};

// Visit JSX tag and transform into virtual DOM function call.
function visitNode(traverse, object, path, state) {
  var options = state.g.opts;
  var ident = (options.jsx || utils.getDocblock(state).jsx);
  var openingEl = object.openingElement;
  var closingEl = object.closingElement;
  var nameObj = openingEl.name;
  var attributes = openingEl.attributes;

  utils.catchup(openingEl.range[0], state, trimLeft);

  if (nameObj.type === Syntax.XJSIdentifier) {
    utils.append(ident + (options.tagMethods ? '.' : "('"), state);
  }

  utils.move(nameObj.range[0], state);
  utils.catchup(nameObj.range[1], state);

  utils.append(options.tagMethods ? '(' : "', ", state);

  if (attributes.length) {
    utils.append('{', state);
  } else {
    utils.append('null', state);
  }

  attributes.forEach(function(attr, index) {
    var isLast = (index === (attributes.length - 1));
    var name = attr.name.name;

    utils.catchup(attr.range[0], state, trimLeft);

    utils.append((function quoteAttr(name) {
      // quote invalid JS identifiers
      if (!/^[a-z_$][a-z\d_$]*$/i.test(name)) {
        return "'" + name + "'";
      }
      return name;
    })(name), state);
    utils.append(': ', state);

    if (attr.value) {
      utils.move(attr.name.range[1], state);
      utils.catchupNewlines(attr.value.range[0], state);
      if (attr.value.type === Syntax.Literal) {
      } else {
      }
    } else {
      state.g.buffer += 'true';
      state.g.position = attr.name.range[1];
      if (!isLast) {
        utils.append(', ', state);
      }
    }

    utils.catchup(attr.range[1], state, trimLeft);
  });

  if (!openingEl.selfClosing) {
    utils.catchup(openingEl.range[1] - 1, state, trimLeft);
    utils.move(openingEl.range[1], state);
  }

  if (attributes.length) {
    utils.append('}', state);
  }

  var children = object.children.filter(function(child) {
    return !(child.type === Syntax.Literal
             && typeof child.value === 'string'
             && child.value.match(/^[ \t]*[\r\n][ \t\r\n]*$/));
  });

  if (children.length) {
    var lastRenderableIndex;

    children.forEach(function(child, index) {
      if (child.type !== Syntax.XJSExpressionContainer ||
          child.expression.type !== Syntax.XJSEmptyExpression) {
        lastRenderableIndex = index;
      }
    });

    if (lastRenderableIndex !== undefined) {
      utils.append(', ', state);
    }

    children.forEach(function(child, index) {
      utils.catchup(child.range[0], state, trimLeft);

      var isFirst = index === 0;
      var isLast = index >= lastRenderableIndex;

      utils.append('[', state);

      if (child.type === Syntax.Literal) {
        renderXJSLiteral(child, isLast, state);
      } else if (child.type === Syntax.XJSExpressionContainer) {
        renderXJSExpressionContainer(traverse, child, isLast, path, state);
      } else {
        traverse(child, path, state);
        if (!isLast) {
          utils.append(', ', state);
        }
      }

      utils.catchup(child.range[1], state, trimLeft);
    });

    utils.append(']', state);
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

  utils.append(')', state);

  return false;
};

// Test if tag is JSX tag.
visitNode.test = function(object, path, state) {
  var jsx = utils.getDocblock(state).jsx || state.g.opts.ignoreDocblock;
  return object.type === Syntax.XJSElement && jsx;
};

function renderXJSLiteral(object, isLast, state, start, end) {
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

function renderXJSExpressionContainer(traverse, object, isLast, path, state) {
  // Plus 1 to skip `{`.
  utils.move(object.range[0] + 1, state);
  traverse(object.expression, path, state);

  if (!isLast && object.expression.type !== Syntax.XJSEmptyExpression) {
    // If we need to append a comma, make sure to do so after the expression.
    utils.catchup(object.expression.range[1], state, trimLeft);
    utils.append(', ', state);
  }

  // Minus 1 to skip `}`.
  utils.catchup(object.range[1] - 1, state, trimLeft);
  utils.move(object.range[1], state);
  return false;
}

function trimLeft(val) {
  return val.replace(/^ +/, '');
};
