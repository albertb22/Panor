var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	rename = require('gulp-rename'),
	notify = require('gulp-notify'),
	uglify = require('gulp-uglify'),
	csso = require('gulp-csso');


gulp.task('styles', function() {
  return gulp.src('src/scss/panor.scss')
	.pipe(sass({ style: 'expanded' }))
	.pipe(autoprefixer('safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
	//.pipe(csso())
	.pipe(rename('panor.min.css'))
	.pipe(gulp.dest('dist'))
	.pipe(notify({ message: 'Compiled scss files' }));
});

gulp.task('scripts', function() {
	return gulp.src('src/js/panor.js')
	.pipe(uglify())
	.pipe(rename('panor.min.js'))
	.pipe(gulp.dest('dist'))
	.pipe(notify({ message: 'Uglified js files' }));
});

gulp.task('dev_styles', function() {
  return gulp.src('src/scss/panor.scss')
	.pipe(sass({ style: 'expanded' }))
	.pipe(rename('panor.min.css'))
	.pipe(gulp.dest('dist'))
	.pipe(notify({ message: 'Updated dev scss files' }));
});

gulp.task('dev_scripts', function() {
	return gulp.src('src/js/panor.js')
	.pipe(rename('panor.min.js'))
	.pipe(gulp.dest('dist'))
	.pipe(notify({ message: 'Updated dev js files' }));
});

gulp.task('dev', ['dev_styles', 'dev_scripts']);


gulp.task('production', ['styles', 'scripts']);


gulp.task('watch', function() {

	gulp.watch('src/scss/**/*.scss', ['dev_styles']);

	gulp.watch('src/js/**/*.js', ['dev_scripts']);

});