/* A reference config file for Gulp.js (http://gulpjs.com/) */
const gulp = require('gulp');

const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const del = require('del');
const cssmin = require('gulp-cssmin');
const imagemin = require('gulp-imagemin');
const rev = require('gulp-rev');
const revreplace = require("gulp-rev-replace");
const runseq = require('run-sequence');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

const sourcePath = 'webapp/assets';
const buildPath = 'webapp/assets/build';
const manifestFile = buildPath + '/rev-manifest.json';


gulp.task('sass', () => {
	del.sync([buildPath + '/styles/**']);
	return gulp
		.src(sourcePath + '/styles/**/*.scss', {base: sourcePath})
		.pipe(sourcemaps.init())
		.pipe(
			sass({
				outputStyle: 'compressed'
			})
			.on('error', sass.logError)
		)
		.pipe(
			autoprefixer({
				browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3'],
				cascade: false,
			})
		)
		.pipe(cssmin())

		.pipe(rev())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(buildPath))
		.pipe(rev.manifest(
			manifestFile,
			{merge: true, base:buildPath}
		))
		.pipe(gulp.dest(buildPath))
		;
});

gulp.task('js', () => {
	del.sync([buildPath + '/scripts/**']);
	return gulp
		.src([
			sourcePath + '/scripts/**/*.js',
			'!**/_*.js'
		], {base: sourcePath})
		.pipe(sourcemaps.init())
		.pipe(
			babel({
				presets: ['es2015'],
			})
		)
		.pipe(uglify())

		.pipe(rev())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(buildPath))
		.pipe(rev.manifest(
			manifestFile,
			{merge: true, base:buildPath}
		))
		.pipe(gulp.dest(buildPath))
		;
});

gulp.task('images', () => {
	del.sync([buildPath + '/images/**']);
	return gulp
		.src(sourcePath + '/images/**', {base: sourcePath})
		.pipe(imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 5}),
			imagemin.svgo({plugins: [{removeViewBox: true}]})
		]))
		.pipe(rev())
		.pipe(gulp.dest(buildPath))
		.pipe(rev.manifest(
			manifestFile,
			{merge: true, base:buildPath}
		))
		.pipe(gulp.dest(buildPath))
		;
});

gulp.task('fonts', () => {
	del.sync([buildPath + '/fonts/**']);
	return gulp
		.src(sourcePath + '/fonts/**', {base: sourcePath})
		.pipe(rev())
		.pipe(gulp.dest(buildPath))
		.pipe(rev.manifest(
			manifestFile,
			{merge: true, base:buildPath}
		))
		.pipe(gulp.dest(buildPath))
		;
});

gulp.task('revreplace', () => {
	return gulp.src(buildPath + '/**/*.css')
		.pipe(revreplace({
			manifest: gulp.src(manifestFile)
		}))
		.pipe(gulp.dest(buildPath));
});

gulp.task('sass:watch', () => {
	gulp.watch(
		sourcePath + '/styles/*.scss',
		() => runseq('sass', 'revreplace')
	);
});

gulp.task('js:watch', () => {
	gulp.watch(
		sourcePath + '/scripts/*.js',
		() => runseq('js', 'revreplace')
	);
});

gulp.task('images:watch', () => {
	gulp.watch(
		[sourcePath + '/images/**'],
		() => runseq('images', 'revreplace')
	);
});

gulp.task('fonts:watch', () => {
	gulp.watch(
		[sourcePath + '/fonts/**'],
		() => runseq('fonts', 'revreplace')
	);
});

gulp.task('clear', () => {
	del.sync([manifestFile]);
});

gulp.task('build', () => runseq(
	'clear',
	['sass', 'js'],
	['images', 'fonts'],
	'revreplace'
));

gulp.task('watch', ['sass:watch', 'js:watch', 'images:watch', 'fonts:watch']);

gulp.task('default', ['build']);
