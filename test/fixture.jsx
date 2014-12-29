/** @jsx DOM */

module.exports = function() {
  if (1 < 2) {
    return <h1>One is less than two</h1>;
  } else {
    return <div class="title"><h1>elements can be nested</h1></div>;
  }
};
