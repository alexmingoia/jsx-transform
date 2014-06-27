# virtual-dom-jsx

JSX transpiler for vtrees. Desugar JSX into virtual dom nodes.

## Installation

```sh
npm install virtual-dom-jsx
```

## Example

This JSX:

```jsx
var profile = <profile>
  <avatar uid="{user.id}" />
  <span>{[user.firstName, user.lastName].join(' ')}</span>
</profile>;
```

is transformed into this JavaScript:

```javascript
var profile = virtualdom.h("profile", null, [
  virtualdom.h("avatar", { uid: user.id }),
  virtualdom.h("span", null, [[user.firstName, user.lastName].join(' ')])
]);
```

## Usage

### jsx.parse(str, options)

Parse JSX and return virtual DOM nodes.

### jsx.parseFile(path, options)

Parse file containing JSX and return virtual DOM nodes.

### Options

* `jsx`: name of virtual DOM node constructor function (default: false)

### docblock

Only files with the `/* @jsx virtualdom.h */` docblock will be parsed unless
`options.jsx` is set. The constructor name for the virtual DOM node will be
taken from the `@jsx` definition if present.

## BSD Licensed
