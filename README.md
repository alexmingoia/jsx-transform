# virtual-dom-jsx

[![Build Status](https://secure.travis-ci.org/alexmingoia/virtual-dom-jsx.png)](http://travis-ci.org/alexmingoia/virtual-dom-jsx) 
[![NPM version](https://badge.fury.io/js/virtual-dom-jsx.png)](http://badge.fury.io/js/virtual-dom-jsx)
[![Dependency Status](https://david-dm.org/alexmingoia/virtual-dom-jsx.png)](http://david-dm.org/alexmingoia/virtual-dom-jsx)

JSX transpiler for vtrees. Desugar JSX into [virtual-dom][0] nodes.

## Installation

```sh
npm install virtual-dom-jsx
```

## Example

This JSX:

```jsx
/** @jsx h */

var h = require('virtual-hyperscript');

var profile = <div>
  <img src="avatar.png" class="profile" />
  <h3>{[user.firstName, user.lastName].join(' ')}</h3>
</div>;
```

is transformed into this JavaScript:

```javascript
var h = require('virtual-hyperscript');

var profile = h('div', null, [
  h('img', { src: "avatar.png", class: "profile" }),
  h('h3', null, [[user.firstName, user.lastName].join(' ')])
]);
```

## Usage

### docblock

Only files with the `/** @jsx DOM */` docblock will be parsed unless
`options.ignoreDocblock` is set. The constructor name for the virtual DOM node
is taken from the `@jsx` definition.

### jsx.parse(str, options)

Desugar JSX into virtual dom nodes and return transformed string.

### jsx.parseFile(path, options)

Desugar JSX in file into virtual dom nodes and return transformed string.

### Options

* `ignoreDocblock` Parse files without docblock. If true, `options.jsx` must
   also be set (default: false).
* `tagMethods` Use tag as method instead of argument (default: false).
   If true, `DOM.h1()` instead of `DOM('h1')`.
* `jsx` name of virtual DOM node constructor (default: false).

## BSD Licensed

[0]: https://github.com/Matt-Esch/virtual-dom/
