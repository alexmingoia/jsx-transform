var Browserify = require('browserify');
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

  var fixtureJSSpreadAttrsB = fs.readFileSync(
    path.join(__dirname, 'fixture_spread_attrs_b.js'),
    'utf8'
  );

  var fixtureJSSpreadAttrsC = fs.readFileSync(
    path.join(__dirname, 'fixture_spread_attrs_c.js'),
    'utf8'
  );

  it('desugars JSX', function() {
    var result = jsx.fromString(fixtureJSX, {
      factory: 'DOM'
    });
    expect(result).to.be.a('string');
    expect(result).to.equal(fixtureJS);
  });

  it('desugars JSX with ES6 module exports', function () {
    var result = jsx.fromString(es6FixtureJSX, {
      factory: 'DOM'
    });
    expect(result).to.be.a('string');
    expect(result).to.contain("DOM('h1");
  });

  it('fromStrings self-closing tags', function () {
    var result = jsx.fromString(selfClosingFixtureJSX, {
      factory: 'DOM'
    });
    expect(result).to.be.a('string');
    expect(result).to.contain("DOM('link");
  });

  it('renders JS expressions inside JSX tag', function () {
    var result = jsx.fromString(fixtureJSX, {
      factory: 'DOM'
    });
    expect(result).to.be.a('string');
    expect(result).to.contain("x = 2");
  });

  describe('options.factory', function() {
    it('throws error if not set', function () {
      expect(function () {
        jsx.fromString(fixtureJSX);
      }).to.throwError(/Missing options.factory function/);
    });

    it('set factory', function() {
      var result = jsx.fromString(fixtureJSX, {
        factory: "mercury.h"
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("mercury.h('h1");
    });
  });

  describe('options.passUnknownTagsToFactory', function() {
    it('passes unknown tags to options.factory', function() {
      var result = jsx.fromString(fixtureJSX, {
        factory: 'DOM',
        passUnknownTagsToFactory: true
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("DOM(Component");
    });
  });

  describe('options.unknownTagsAsString', function() {
    it('passes unknown tags to docblock ident as string', function () {
      var result = jsx.fromString(fixtureJSX, {
        factory: 'DOM',
        passUnknownTagsToFactory: true,
        unknownTagsAsString: true
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("DOM('Component'");
    });
  });

  describe('options.arrayChildren', function() {
    it('dont pass array for children', function() {
      var arrayArgsJS = fs.readFileSync(
        path.join(__dirname, 'fixture_array_args.js'),
        'utf8'
      );
      var result = jsx.fromString(fixtureJSX, {
        factory: 'DOM',
        arrayChildren: false
      });
      expect(result).to.be.a('string');
      expect(result).to.equal(arrayArgsJS);
    })
  })

  it('supports custom component patterns', function () {
      var result = jsx.fromString('<Component foo="bar" />', {
        factory: 'DOM',
        unknownTagPattern: '{tag}.render',
        arrayChildren: false
      });
      expect(result).to.be.a('string');
      expect(result).to.equal('Component.render({foo: "bar"})');
  });

  it('supports spread attributes', function () {
      var result = jsx.fromString(fixtureJSXSpreadAttrs, {
        factory: 'DOM',
        arrayChildren: false
      });
      expect(result).to.be.a('string');
      expect(result).to.equal(fixtureJSSpreadAttrs);

      result = jsx.fromString(fixtureJSXSpreadAttrs, {
        factory: 'DOM',
        passUnknownTagsToFactory: true,
        arrayChildren: false
      });
      expect(result).to.be.a('string');
      expect(result).to.equal(fixtureJSSpreadAttrsB);

      result = jsx.fromString(fixtureJSXSpreadAttrs, {
        factory: 'DOM',
        passUnknownTagsToFactory: true,
        unknownTagsAsString: true,
        arrayChildren: false
      });
      expect(result).to.be.a('string');
      expect(result).to.equal(fixtureJSSpreadAttrsC);
  });
});

describe('jsx.browserifyTransform()', function () {
  it('transforms JSX', function (done) {
    var bundler = Browserify({
      entries: [path.join(__dirname, 'fixture.jsx')]
    });

    bundler.transform(jsx.browserifyTransform, {
      factory: 'DOM'
    });

    bundler.bundle(function (err, buf) {
      done(err);
    });
  });

  it('ignores .json files', function (done) {
    var bundler = Browserify({
      entries: [path.join(__dirname, 'fixture.jsx')]
    });

    bundler.transform(jsx.browserifyTransform, {
      factory: 'DOM',
    });

    bundler.add(path.join(__dirname, '..', 'package.json'));

    bundler.bundle(function (err, buf) {
      done(err);
    });
  });
});
