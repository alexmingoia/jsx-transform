var expect = require('expect.js');
var fs = require('fs');
var jsx = process.env.JSCOV ? require('../lib-cov/jsx') : require('../lib/jsx');
var path = require('path');

describe('jsx.transform()', function() {
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

  it('desugars JSX', function() {
    var result = jsx.transform(fixtureJSX);
    expect(result).to.be.a('string');
    expect(result).to.equal(fixtureJS);
  });

  it('desugars JSX with ES6 module exports', function () {
    var result = jsx.transform(es6FixtureJSX);
    expect(result).to.be.a('string');
    expect(result).to.contain("DOM('h1");
  });

  it('transforms self-closing tags', function () {
    var result = jsx.transform(selfClosingFixtureJSX);
    expect(result).to.be.a('string');
    expect(result).to.contain("DOM('link");
  });

  it('renders JS expressions inside JSX tag', function () {
    var result = jsx.transform(fixtureJSX);
    expect(result).to.be.a('string');
    expect(result).to.contain("x = 2");
  });

  describe('options.ignoreDocblock', function() {
    it('ignores files without jsx docblock', function() {
      var result = jsx.transform(fixtureJSX.replace('/** @jsx DOM */', ''));
      expect(result).to.be.a('string');
      expect(result).to.contain('<h1>');
    });
  });

  describe('options.jsx', function() {
    it('overrides docblock constructor', function() {
      var result = jsx.transform(fixtureJSX, {
        jsx: "virtualdom.h"
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("virtualdom.h('h1");
    });
  });

  describe('options.tagMethods', function() {
    it('uses tag method instead of argument', function() {
      var result = jsx.transform(fixtureJSX, {
        tagMethods: true
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("DOM.h1(");
    });
  });

  describe('options.docblockUnknownTags', function() {
    it('passes unknown tags to docblock ident', function() {
      var result = jsx.transform(fixtureJSX, {
        docblockUnknownTags: true
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("DOM(Component");
    });
  });

  describe('options.unknownTagsAsString', function() {
    it('passes unknown tags to docblock ident as string', function () {
      var result = jsx.transform(fixtureJSX, {
        docblockUnknownTags: true,
        unknownTagsAsString: true
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("DOM('Component'");
    });
  });

  describe('options.renameAttrs', function () {
    it('renames attributes when desugaring JSX', function () {
      var result = jsx.transform(fixtureJSX, {
        renameAttrs: {'class': 'className'}
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("className:");
      expect(result).to.not.contain("class:");
    });
  });
});
