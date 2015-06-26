var gulp = require('gulp');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var imagemin = require('gulp-imagemin');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifycss = require('gulp-minify-css');

var bases = {
	src: 'src/',
	dist: 'public/'
};

// Order matters
var config = {
	scripts: ['js/libs/modernizr.custom.js', 'js/libs/jquery-1.11.1.min.js', 'js/libs/jquery-migrate-1.2.1.min.js', 'js/libs/jquery.address-1.6.min.js', 'js/libs/triple.layout.js', 'js/libs/smoothscroll.js', 'js/libs/nprogress/nprogress.js', 'js/libs/fastclick.js', 'js/libs/jquery.imagesloaded.min.js', 'js/libs/isotope.pkgd.min.js', 'js/libs/twitterFetcher_v12_min.js', 'js/libs/jquery.fitvids.js', 'js/libs/jquery.validate.min.js', 'js/libs/jquery.uniform.min.js', 'js/libs/jquery.fancybox-1.3.4.pack.js', 'js/libs/jquery.debouncedresize.js', 'js/libs/classie.js', 'js/main.2.js'],
	blogScripts: ['js/libs/modernizr.custom.js', 'js/libs/jquery-1.11.1.min.js', 'js/libs/jquery-migrate-1.2.1.min.js', 'js/libs/smoothscroll.js', 'js/libs/nprogress/nprogress.js', 'js/libs/fastclick.js', 'js/libs/jquery.fitvids.js', 'js/libs/jquery.fancybox-1.3.4.pack.js', 'js/libs/jquery.tooltipster.min.js', 'js/libs/google-code-prettify/prettify.js', 'js/blog.js'],
	polyfills: ['js/libs/html5shiv.min.js', 'js/libs/respond.min.js', 'js/libs/selectivizr-min.js'],
	styles: ['css/bootstrap.min.css', 'js/nprogress/nprogress.css', 'css/animate.min.css', 'css/font-awesome.min.css', 'css/fontello.css', 'css/jquery.fancybox-1.3.4.css', 'js/google-code-prettify/prettify.css', 'css/uniform.default.css', 'js/mediaelement/mediaelementplayer.css', 'css/tooltipster.css', 'css/main.css'],
	images: ['images/**/*'],
	fonts: ['css/fonts/**/*']
};

gulp.task('clean:js', function() {
	return gulp.src(bases.dist + 'js/')
		.pipe(vinylPaths(del));
});

// Concatenate & Minify JS
gulp.task('scripts', ['clean:js'], function() {
	gulp.src(config.scripts, {cwd: bases.src})
		// .pipe(jshint())
		// .pipe(jshint.reporter('default'))
		.pipe(uglify({ mangle: true }))
		.pipe(concat('all.min.js'))
		.pipe(gulp.dest(bases.dist + 'js/'));

	// Blog has its own script file
	gulp.src(config.blogScripts, {cwd: bases.src})
		.pipe(uglify({ mangle: true }))
		.pipe(concat('blog.min.js'))
		.pipe(gulp.dest(bases.dist + 'js/'));
});

gulp.task('clean:css', function() {
	return gulp.src(bases.dist + 'css/')
		.pipe(vinylPaths(del));
});

// Concatenate & minify CSS
gulp.task('styles', ['clean:css'], function() {
	gulp.src(config.styles, {cwd: bases.src})
		.pipe(minifycss())
		.pipe(concat('all.min.css'))
		.pipe(gulp.dest(bases.dist + 'css/'));

	// Copy fonts
	gulp.src(config.fonts, {cwd: bases.src})
		.pipe(gulp.dest(bases.dist + 'css/fonts/'));
});

// Copy all other files to public directly
gulp.task('copy', function() {
	// Copy images
	gulp.src(config.images, {cwd: bases.src})
		.pipe(gulp.dest(bases.dist + 'images/'));

  // Copy polyfill JS for old browsers
  gulp.src(config.polyfills, {cwd: bases.src})
    .pipe(gulp.dest(bases.dist + 'js/'));
});

gulp.task('watch', function() {
  gulp.watch('src/js/*.js', ['scripts']);
  gulp.watch('src/css/*.css', ['styles']);
});

// Default Task
gulp.task('default', ['scripts', 'styles', 'copy', 'watch']);