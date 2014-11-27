// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifycss = require('gulp-minify-css');

var scriptz = ['js/modernizr.custom.js', 'js/jquery-1.11.1.min.js', 'js/jquery-migrate-1.2.1.min.js', 'js/jquery.address-1.6.min.js', 'js/triple.layout.js', 'js/smoothscroll.js', 'js/nprogress/nprogress.js', 'js/fastclick.js', 'js/jquery.imagesloaded.min.js', 'js/isotope.pkgd.min.js', 'js/twitterFetcher_v12_min.js', 'js/jquery.fitvids.js', 'js/jquery.validate.min.js', 'js/jquery.uniform.min.js', 'js/jquery.fancybox-1.3.4.pack.js', 'js/jquery.debouncedresize.js', 'js/classie.js', 'js/main.2.js'];
var blogScriptz = ['js/modernizr.custom.js', 'js/jquery-1.11.1.min.js', 'js/jquery-migrate-1.2.1.min.js', 'js/smoothscroll.js', 'js/nprogress/nprogress.js', 'js/fastclick.js', 'js/jquery.fitvids.js', 'js/jquery.fancybox-1.3.4.pack.js', 'js/jquery.tooltipster.min.js', 'js/google-code-prettify/prettify.js', 'js/blog.js'];
var stylez = ['css/bootstrap.min.css', 'js/nprogress/nprogress.css', 'css/animate.min.css', 'css/font-awesome.min.css', 'css/fontello.css', 'css/jquery.fancybox-1.3.4.css', 'js/google-code-prettify/prettify.css', 'css/uniform.default.css', 'js/mediaelement/mediaelementplayer.css', 'css/tooltipster.css', 'css/main.css'];
var uglifyOptions = { mangle: true };

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src(scriptz)
        .pipe(concat('all.js'))
        .pipe(gulp.dest('js'))
        .pipe(rename('all.min.js'))
        .pipe(uglify(uglifyOptions))
        .pipe(gulp.dest('js'));
});

// Concatenate & Minify JS
gulp.task('blogScripts', function() {
    return gulp.src(blogScriptz)
        .pipe(concat('blog-all.js'))
        .pipe(rename('blog.min.js'))
        .pipe(uglify(uglifyOptions))
        .pipe(gulp.dest('js'));
});

// Concatenate & minify CSS
gulp.task('styles', function() {
    return gulp.src(stylez)
      .pipe(concat('all.css'))
      .pipe(gulp.dest('css'))
      .pipe(rename('all.min.css'))
      .pipe(minifycss())
      .pipe(gulp.dest('css'));
});

// Default Task
gulp.task('default', ['scripts', 'blogScripts', 'styles', 'watch']);

gulp.task('watch', function() {

  // Watch main.css
  gulp.watch('css/main.css', ['styles']);

  // Watch main.2.js
  gulp.watch('js/main.2.js', ['scripts']);

  // Watch blog js file
  gulp.watch('js/blog.js', ['blogScripts']);
});