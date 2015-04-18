/** @jsx DOM */

module.exports = function () {
  var x = 1;
  var profile = Component(null, [x = 2])
  var h1 = DOM('h1', {class: "header"}, ["Hello ", firstName + " " + lastName]);

  if (x < 1) {
    return DOM('div')
  } else if (x < 2) {
    return DOM('h1', null, ["One is less than two"]);
  } else {
    return DOM('div', {class: "title"}, [DOM('h1', null, ["elements can be nested"])]);
  }
};
