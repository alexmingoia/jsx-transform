/** @jsx DOM */

module.exports = function () {
  Component(Object.assign({}, firstSpread, secondSpread), [
    DOM('div', {some: "prop", another: "prop"}, ["Test"]),
    Component(Object.assign({}, firstSpread, secondSpread, {foo: "baz"})),
    Component(Object.assign({}, state.nested, {foo: "bar"})),
    Component(Object.assign({}, state[0], {foo: "bar"})),
    Component(Object.assign({}, state[0][1], {foo: "bar"}))
  ])
};
