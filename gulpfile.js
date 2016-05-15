var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var notify = require('gulp-notify');
var newer = require('gulp-newer');
var plumber = require('gulp-plumber');
var useref = require('gulp-useref');
var ignore = require('gulp-ignore');
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');
// var cssmin = require('gulp-minify-css');
// var htmlmin = require('gulp-minify-html');
// var uglify = require('gulp-uglify');

var glob = {
  js: 'app/js/**/*.js',
  html: 'app/*.html',
  res: 'app/res/**/*'
};
var dist = {
  js: 'dist/js',
  html: 'dist/*.html',
  res: 'dist/res'
};

var sendNotice = function (msg) {
  console.log('[task] ' + msg);
  return notify('[task] ' + msg);
};
gulp.task('notify', function () {
  return gulp.src('dist/index.html')
    .pipe(notify('completed'));
});

var onError = function (err) {
  console.log('[ERR] ' + err.toString());
};

gulp.task('clean', function () {
  return gulp.src('dist/*', { read: false })
    .pipe(clean());
});


gulp.task('clean-js', function () {
  return gulp.src(dist.js, { read: false })
    .pipe(clean());
});
gulp.task('js', function () {
  gulp.src('app/index.html')
    .pipe(useref())
    .pipe(ignore.include('*.js'))
    // don't work
    // .pipe(newer({
    //   dest: dist.js,
    //   ext: 'js'
    // }))
    .pipe(gulp.dest('dist'));
});
// create a task that ensures the `js` task is complete before
// reloading browsers
gulp.task('js-watch', ['js'], function() {
    sendNotice('js done');
    browserSync.reload();
});


gulp.task('clean-html', function () {
  return gulp.src(dist.html, { read: false })
    .pipe(clean());
});
gulp.task('html', function () {
  return gulp.src(glob.html)
    .pipe(newer({
      dest: 'dist',
      ext: 'html'
    }))
    .pipe(useref())
    .pipe(ignore.include('*.html'))
    .pipe(gulp.dest('dist'));
});
gulp.task('html-watch', ['html'], function() {
    sendNotice('html done');
    browserSync.reload();
});

gulp.task('default', ['clean'], function(cb) {
  runSequence(
    ['js', 'html', 'resource'],
    cb
  );
});

gulp.task('resource', function () {
  gulp.src(glob.res)
    .pipe(gulp.dest(dist.res));
});

// use default task to launch Browsersync and watch JS files
gulp.task('serve', ['default'], function () {

  // Serve files from the root of this project
  browserSync.init({
    server: {
      baseDir: "./dist",
      port: 3000
    }
  });

  // add browserSync.reload to the tasks array to make
  // all browsers reload after tasks are complete.
  gulp.watch(glob.js, ['js-watch']);
  gulp.watch(glob.html, ['html-watch']);
});


gulp.task('dbuild', ['html', 'js', 'resource'], function () {
  console.log('build-dev completed');
  notify('[task] build-dev completed');
});

gulp.task('release', [''], function () {
  console.log('release completed');
  notify('[task] release completed');
});