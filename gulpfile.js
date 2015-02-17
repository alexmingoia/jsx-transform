/*!
 * jsx-transform
 * https://github.com/alexmingoia/jsx-transform
 */

'use strict';

var gulp = require('gulp');
var env = process.env.NODE_ENV;
var fs = require('fs');
var instrument = require('gulp-instrument');
var jsdoc2md = require('jsdoc-to-markdown');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var stylish = require('jshint-stylish');
var spawn = require('child_process').spawn;
var source = require('vinyl-source-stream');

gulp.task('instrument', function() {
  return gulp.src('lib/**.js')
    .pipe(instrument())
    .pipe(gulp.dest('lib-cov'));
});

gulp.task('coverage', ['instrument'], function() {
  process.env.JSCOV=1;

  return spawn('node_modules/gulp-mocha/node_modules/mocha/bin/mocha', [
    'test', '--reporter', 'html-cov'
  ]).stdout
    .pipe(source('coverage.html'))
    .pipe(gulp.dest('./'));
});

gulp.task('docs', function(done) {
  jsdoc2md.render('./lib/*.js', {
    template: './lib/README.md.hbs'
  })
  .on('error', done)
  .on('end', done)
  .pipe(fs.createWriteStream('README.md'))
});

gulp.task('test', function () {
  return gulp.src('test/*.js')
    .pipe(mocha({
      timeout: 6000,
      ignoreLeaks: false,
      ui: 'bdd',
      reporter: 'spec'
    }));
});

gulp.task('jshint', function () {
  return gulp.src(['lib/**/*.js', 'test/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('watch', function () {
  return gulp.watch(['lib/*.js', 'test/*.js'], ['jshint', 'test']);
});

gulp.task('default', [env === 'production' ? 'watch' : 'test']);
