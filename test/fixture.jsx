/** @jsx DOM */

module.exports = function () {
  var x = 1;
  var profile = <Component>{x = 2}</Component>
  var h1 = <h1 class="header">Hello {firstName + " " + lastName}</h1>;

  if (x < 1) {
    return <div></div>
  } else if (x < 2) {
    return <h1>One is less than two</h1>;
  } else {
    return <div class="title"><h1>elements can be nested</h1></div>;
  }
};
