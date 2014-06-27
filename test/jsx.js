var expect = require('expect.js');
var fs = require('fs');
var jsx = require('..');
var path = require('path');
var mockPath = path.join(__dirname, 'mock.js');

describe('jsx.parse()', function() {
  var mock = fs.readFileSync(mockPath, 'utf8');

  it('parses string and desugars JSX into virtual DOM nodes', function() {
    var result = jsx.parse(mock);
    expect(result).to.be.a('string');
    expect(result).to.contain("DOM('h1");
  });

  describe('options.ignoreDocblock', function() {
    it('ignores files without jsx docblock', function() {
      var result = jsx.parse(mock.replace('/** @jsx DOM */', ''));
      expect(result).to.be.a('string');
      expect(result).to.contain('<h1>');
    });
  });

  describe('options.jsx', function() {
    it('overrides docblock constructor', function() {
      var result = jsx.parse(mock, {
        jsx: "virtualdom.h"
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("virtualdom.h('h1");
    });
  });

  describe('options.tagMethods', function() {
    it('uses tag method instead of argument', function() {
      var result = jsx.parse(mock, {
        tagMethods: true
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("DOM.h1(");
    });
  });
});

describe('jsx.parseFile()', function() {
  it('passes arguments to jsx.parse()', function(done) {
    var parse = jsx.parse;
    jsx.parse = function(str, options) {
      jsx.parse = parse;
      expect(str).to.be.a('string');
      done();
    };
    jsx.parseFile(mockPath);
  });
});
