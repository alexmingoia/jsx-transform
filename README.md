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

* `constructor`: string for function calls (default: "virtualdom.h")

### docblock

Set `options.constructor` to `false` and only files with the
`/* @jsx virtualdom.h */` docblock will be parsed, and the constructor name used
will be taken from the `@jsx` definition.

## BSD Licensed
