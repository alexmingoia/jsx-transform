module.exports = function () {
  <Component {...firstSpread} {...secondSpread}>
    <div some="prop" another="prop">Test</div>
    <Component {...firstSpread} {...secondSpread} foo="baz" />
    <Component {...state.nested} foo="bar" />
    <Component {...state[0]} foo="bar" />
    <Component {...state[0][1]} foo="bar" />
  </Component>
};
