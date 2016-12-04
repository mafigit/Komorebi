var gulp = require('gulp');
var react = require('gulp-react');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var livereload = require('gulp-livereload');

gulp.task('build', function () {
  browserify({
    entries: 'app/js/app.jsx',
    extensions: ['.js', '.jsx'],
    debug: true
  })
  .transform(babelify)
  .bundle()
  .pipe(source('main.js'))
  .pipe(gulp.dest('../server/public/javascripts/'))
  .pipe(livereload());
});
gulp.task('watch', function () {
  livereload.listen();
  gulp.watch('app/js/**/*.jsx', ['build']);
});
gulp.task('default', ['build']);
