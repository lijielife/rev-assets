/* A reference config file for Gulp.js (http://gulpjs.com/) */
const gulp = require('gulp');
const extend = require('extend');
const parseArgs = require('minimist');
const through = require("through2");

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

const SOURCE_PATH = 'assets';
const BUILD_PATH = 'assets/build';
const MANIFEST_FILE = BUILD_PATH + '/rev-manifest.json';


const config = extend({
   env: process.env.NODE_ENV || 'dev'
}, parseArgs(process.argv.slice(2)));

// Does nothing but can be .pipe()'d
const noop = through.obj();


gulp.task('sass', () => {
	del.sync([BUILD_PATH + '/styles/**']);
	return gulp
		.src(SOURCE_PATH + '/styles/**/*.scss', {base: SOURCE_PATH})
		.pipe(sourcemaps.init())
		.pipe(
			sass(config.env == 'prod' ? {outputStyle: 'compressed'} : {})
			.on('error', sass.logError)
		)
		.pipe(
			autoprefixer({
				browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3'],
				cascade: false,
			})
		)
		.pipe(config.env == 'prod' ? cssmin() : noop)
		.pipe(rev())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(BUILD_PATH))
		.pipe(rev.manifest(
			MANIFEST_FILE,
			{merge: true, base:BUILD_PATH}
		))
		.pipe(gulp.dest(BUILD_PATH))
		;
});

gulp.task('js', () => {
	del.sync([BUILD_PATH + '/scripts/**']);
	return gulp
		.src([
			SOURCE_PATH + '/scripts/**/*.js',
			'!**/_*.js'
		], {base: SOURCE_PATH})
		.pipe(sourcemaps.init())
		.pipe(
			babel({
				presets: ['es2015'],
			})
		)
		.pipe(config.env == 'prod' ? uglify() : noop)
		.pipe(rev())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(BUILD_PATH))
		.pipe(rev.manifest(
			MANIFEST_FILE,
			{merge: true, base:BUILD_PATH}
		))
		.pipe(gulp.dest(BUILD_PATH))
		;
});

gulp.task('images', () => {
	del.sync([BUILD_PATH + '/images/**']);
	return gulp
		.src(SOURCE_PATH + '/images/**', {base: SOURCE_PATH})
		.pipe(imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 5}),
			imagemin.svgo({plugins: [{removeViewBox: true}]})
		]))
		.pipe(rev())
		.pipe(gulp.dest(BUILD_PATH))
		.pipe(rev.manifest(
			MANIFEST_FILE,
			{merge: true, base:BUILD_PATH}
		))
		.pipe(gulp.dest(BUILD_PATH))
		;
});

gulp.task('fonts', () => {
	del.sync([BUILD_PATH + '/fonts/**']);
	return gulp
		.src(SOURCE_PATH + '/fonts/**', {base: SOURCE_PATH})
		.pipe(rev())
		.pipe(gulp.dest(BUILD_PATH))
		.pipe(rev.manifest(
			MANIFEST_FILE,
			{merge: true, base:BUILD_PATH}
		))
		.pipe(gulp.dest(BUILD_PATH))
		;
});

gulp.task('revreplace', () => {
	return gulp.src(BUILD_PATH + '/**/*.css')
		.pipe(revreplace({
			manifest: gulp.src(MANIFEST_FILE)
		}))
		.pipe(gulp.dest(BUILD_PATH));
});

gulp.task('sass:watch', () => {
	gulp.watch(
		SOURCE_PATH + '/styles/*.scss',
		() => runseq('sass', 'revreplace')
	);
});

gulp.task('js:watch', () => {
	gulp.watch(
		SOURCE_PATH + '/scripts/*.js',
		() => runseq('js', 'revreplace')
	);
});

gulp.task('images:watch', () => {
	gulp.watch(
		[SOURCE_PATH + '/images/**'],
		() => runseq('images', 'revreplace')
	);
});

gulp.task('fonts:watch', () => {
	gulp.watch(
		[SOURCE_PATH + '/fonts/**'],
		() => runseq('fonts', 'revreplace')
	);
});

gulp.task('clear', () => {
	del.sync([MANIFEST_FILE]);
});

// Development build
gulp.task('dev-build', () => runseq(
	'clear',
	['sass', 'js'],
	['images', 'fonts'],
	'revreplace'
));

// Production build
gulp.task('prod-build', () => {
	process.env.NODE_ENV = config.env = 'prod';
	runseq('dev-build');
});

gulp.task('watch', ['sass:watch', 'js:watch', 'images:watch', 'fonts:watch']);

gulp.task('default', ['dev-build']);
gulp.task('build', ['prod-build']);
