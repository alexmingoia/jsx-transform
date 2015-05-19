module.exports = function () {
  DOM(Component, Object.assign({}, firstSpread, secondSpread),
    DOM('div', {some: "prop", another: "prop"}, "Test"),
    DOM('div', Object.assign({}, thirdSpread), "Test"),
    DOM(Component, Object.assign({}, firstSpread, secondSpread, {foo: "baz"})),
    DOM(Component, Object.assign({}, state.nested, {foo: "bar"})),
    DOM(Component, Object.assign({}, state[0], {foo: "bar"})),
    DOM(Component, Object.assign({}, state[0][1], {foo: "bar"}))
  )
};
