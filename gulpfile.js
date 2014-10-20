var autoprefixer = require('gulp-autoprefixer');
var browserify = require('browserify');
//var coffeeify  = require('coffeeify');
var coffeelint = require('gulp-coffeelint');
//var concat = require('gulp-concat');
var del = require('del');
var gulp = require('gulp');
var gulpNewer = require('gulp-newer');
//var hbsfy = require('hbsfy');
var imagemin = require('gulp-imagemin');
var jshint = require('gulp-jshint');
var minifyCSS = require('gulp-minify-css');
//var stylus = require('gulp-stylus');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var _ = require('lodash');


var paths = {
  dist: './dist/',
  html: './src/**/*.html',
  scripts: './src/scripts/**/*',
  jsLint: './src/scripts/**/*.js',
  coffeeLint: './src/scripts/**/*.coffee',
  images: './src/images/**/*',
  sass: './src/styles/**/*.scss'
};


var vendorsRequire = [
  'jquery',
  'lodash',
  'backbone',
  'backbone.marionette',
  'handlebars',
  'moment'
];


var RELEASE = util.env.release;

if (RELEASE) {
  console.log('Release mod');
}


gulp.task('clean', function (cb) {
  del(['dist'], cb);
});


gulp.task('vendors', function () {
  var bundler = browserify({
    debug: true
  });

  _.each(vendorsRequire, function (file) {
    bundler.require(file);
  });

  var pipe = bundler.bundle().pipe(source('vendors.js'));

  if (RELEASE) {
    pipe = pipe.pipe(streamify(uglify()));
  }

  pipe.pipe(gulp.dest(paths.dist + 'scripts'));
});


gulp.task('jsLint', function () {
  gulp.src(paths.jsLint)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


gulp.task('coffeeLint', function () {
  gulp.src(paths.coffeeLint)
    .pipe(coffeelint())
    .pipe(coffeelint.reporter());
});


gulp.task('browserify', ['jsLint', 'coffeeLint'], function () {
  var bundler = browserify(['./src/scripts/index.coffee'], { //'./src/scripts/shim.js'
    debug: true//,
    //standalone: 'uicomponents'
  });

  _.each(vendorsRequire, function (file) {
    bundler.external(file);
  });

  var pipe = bundler.bundle().on('error', function (err) {
    console.error(err.message);
    this.end();
  }).pipe(source('index.js'));

  if (RELEASE) {
    pipe = pipe.pipe(streamify(uglify()));
  }

  pipe.pipe(gulp.dest(paths.dist + 'scripts'));
});


gulp.task('html', function () {
  gulp.src(paths.html)
    .pipe(gulp.dest(paths.dist));
});


gulp.task('images', function () {
  var imageDest = paths.dist + 'images';
  var optimizationLevel = 1;
  if (RELEASE) {
    optimizationLevel = 5;
  }
  gulp.src(paths.images)
    .pipe(gulpNewer(imageDest))
    .pipe(imagemin({optimizationLevel: optimizationLevel}))
    .pipe(gulp.dest(imageDest));
});


gulp.task('sass', function () {
  var pipe = gulp.src(paths.sass)
//    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write('./maps'));

  if (RELEASE) {
    pipe = pipe.pipe(minifyCSS());
  }

  pipe.pipe(autoprefixer({
    browsers: ['last 2 versions'],
    cascade: false
  }))
    .pipe(gulp.dest(paths.dist + 'styles'));
});


//gulp.task('stylus', function () {
//  var pipe = gulp.src('./src/styles/main.styl').pipe(stylus());
//  if (RELEASE) {
//    pipe = pipe.pipe(minifyCSS());
//  }
//  pipe.pipe(gulp.dest(paths.dist + 'styles'));
//});


gulp.task('watch', function () {
  gulp.watch(paths.html, ['html']);
  gulp.watch(paths.scripts, ['browserify']);
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.images, ['images']);
});


gulp.task('default', ['watch', 'html', 'images', 'sass', 'vendors', 'browserify']);
