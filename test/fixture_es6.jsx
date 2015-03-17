/** @jsx DOM */

export default View;

function View() {
  var x = 1;
  var profile = <Component>{x = 2}</Component>

  if (x < 2) {
    return <h1>One is less than two</h1>;
  } else {
    return <div class="title"><h1>elements can be nested</h1></div>;
  }
};
