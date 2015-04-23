var expect = require('expect.js');
var fs = require('fs');
var jsx = process.env.JSCOV ? require('../lib-cov/jsx') : require('../lib/jsx');
var path = require('path');

describe('jsx.fromString()', function() {
  var fixtureJSX = fs.readFileSync(path.join(__dirname, 'fixture.jsx'), 'utf8');
  var fixtureJS = fs.readFileSync(path.join(__dirname, 'fixture.js'), 'utf8');

  var selfClosingFixtureJSX = fs.readFileSync(
    path.join(__dirname, 'fixture_selfclosing.jsx'),
    'utf8'
  );
  var es6FixtureJSX = fs.readFileSync(
    path.join(__dirname, 'fixture_es6.jsx'),
    'utf8'
  );

  var fixtureJSXSpreadAttrs = fs.readFileSync(
    path.join(__dirname, 'fixture_spread_attrs.jsx'),
    'utf8'
  );

  var fixtureJSSpreadAttrs = fs.readFileSync(
    path.join(__dirname, 'fixture_spread_attrs.js'),
    'utf8'
  );

  it('desugars JSX', function() {
    var result = jsx.fromString(fixtureJSX);
    expect(result).to.be.a('string');
    expect(result).to.equal(fixtureJS);
  });

  it('desugars JSX with ES6 module exports', function () {
    var result = jsx.fromString(es6FixtureJSX);
    expect(result).to.be.a('string');
    expect(result).to.contain("DOM('h1");
  });

  it('fromStrings self-closing tags', function () {
    var result = jsx.fromString(selfClosingFixtureJSX);
    expect(result).to.be.a('string');
    expect(result).to.contain("DOM('link");
  });

  it('renders JS expressions inside JSX tag', function () {
    var result = jsx.fromString(fixtureJSX);
    expect(result).to.be.a('string');
    expect(result).to.contain("x = 2");
  });

  describe('options.ignoreDocblock', function() {
    it('ignores files without jsx docblock', function() {
      var result = jsx.fromString(fixtureJSX.replace('/** @jsx DOM */', ''));
      expect(result).to.be.a('string');
      expect(result).to.contain('<h1>');
    });
  });

  describe('options.jsx', function() {
    it('overrides docblock constructor', function() {
      var result = jsx.fromString(fixtureJSX, {
        jsx: "virtualdom.h"
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("virtualdom.h('h1");
    });
  });

  describe('options.tagMethods', function() {
    it('uses tag method instead of argument', function() {
      var result = jsx.fromString(fixtureJSX, {
        tagMethods: true
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("DOM.h1(");
    });
  });

  describe('options.docblockUnknownTags', function() {
    it('passes unknown tags to docblock ident', function() {
      var result = jsx.fromString(fixtureJSX, {
        docblockUnknownTags: true
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("DOM(Component");
    });
  });

  describe('options.unknownTagsAsString', function() {
    it('passes unknown tags to docblock ident as string', function () {
      var result = jsx.fromString(fixtureJSX, {
        docblockUnknownTags: true,
        unknownTagsAsString: true
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("DOM('Component'");
    });
  });

  describe('options.passArray', function() {
    it('dont pass array for children', function() {
      var arrayArgsJS = fs.readFileSync(
        path.join(__dirname, 'fixture_arrayArgs.js'),
        'utf8'
      );
      var result = jsx.fromString(fixtureJSX, {
        passArray: false
      });
      expect(result).to.be.a('string');
      expect(result).to.equal(arrayArgsJS);
    })
  })

  it('supports spread attributes', function () {
      var result = jsx.fromString(fixtureJSXSpreadAttrs);
      expect(result).to.be.a('string');
      expect(result).to.equal(fixtureJSSpreadAttrs);
  });
});
