var expect = require('expect.js');
var fs = require('fs');
var jsx = require('..');
var path = require('path');
var fixturePath = path.join(__dirname, 'fixture.jsx');

describe('jsx.transform()', function() {
  var fixture = fs.readFileSync(fixturePath, 'utf8');

  it('desugars JSX', function() {
    var result = jsx.transform(fixture);
    expect(result).to.be.a('string');
    expect(result).to.contain("DOM('h1");
  });

  describe('options.ignoreDocblock', function() {
    it('ignores files without jsx docblock', function() {
      var result = jsx.transform(fixture.replace('/** @jsx DOM */', ''));
      expect(result).to.be.a('string');
      expect(result).to.contain('<h1>');
    });
  });

  describe('options.jsx', function() {
    it('overrides docblock constructor', function() {
      var result = jsx.transform(fixture, {
        jsx: "virtualdom.h"
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("virtualdom.h('h1");
    });
  });

  describe('options.tagMethods', function() {
    it('uses tag method instead of argument', function() {
      var result = jsx.transform(fixture, {
        tagMethods: true
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("DOM.h1(");
    });
  });

  describe('options.docblockUnknownTags', function() {
    it('passes unknown tags to docblock ident', function() {
      var result = jsx.transform(fixture, {
        docblockUnknownTags: true
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("DOM(Component");
    });
  });

  describe('options.tags', function () {
    it('uses tags argument instead of default tag list', function () {
      var result = jsx.transform(fixture, {
        tags: ['div']
      });
      expect(result).to.be.a('string');
      expect(result).to.not.contain("DOM('h1'");
      expect(result).to.contain("DOM('div'");
    });

    it('defaults to the internal list', function () {
      var result = jsx.transform(fixture, {
        tags: null
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("DOM('h1'");
      expect(result).to.contain("DOM('div'");
    });

    it('knows no tags when passed an empty list', function () {
      var result = jsx.transform(fixture, {
        tags: []
      });
      expect(result).to.be.a('string');
      expect(result).to.not.contain("DOM('h1'");
      expect(result).to.not.contain("DOM('div'");
    });
  });

  describe('options.renameAttrs', function () {
    it('renames attributes when desugaring JSX', function () {
      var result = jsx.transform(fixture, {
        renameAttrs: {'class': 'className'}
      });
      expect(result).to.be.a('string');
      expect(result).to.contain("className:");
      expect(result).to.not.contain("class:");
    });
  });
});
