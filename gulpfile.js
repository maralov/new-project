const gulp            = require('gulp'),
      autoprefixer    = require('gulp-autoprefixer'),
      sass            = require('gulp-sass'),
      sourcemaps      = require('gulp-sourcemaps'),
      plumber         = require('gulp-plumber'),
      del             = require('del'),
      browserSync     = require('browser-sync').create(),
      gcmq            = require('gulp-group-css-media-queries'),
      cleanCSS        = require('gulp-clean-css'),
      rename          = require("gulp-rename");

const path = {
  build: {
    html:     'build/',
    css:      'build/assets/styles',
    js:       'build/assets/js',
    jsVen:    'build/assets/js/vendor',
    img:      ''
  },
  src: {
    html:     'src/pages/*.html',
    sass:     'src/styles/*.scss',
    js:       'src/js/*.js',
    jsVen:    'src/js/**/*.js',
    img:      ''
  },
  watch: { 
    html:       'src/pages/*.html',
    sass:       'src/**/*.scss',
    js:         'app/js/*.js',
    img:        ''
  },
  clear : {
    clear:      'build/*'
  }
};

function styles(){
  return gulp
    .src(path.src.sass)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: require('node-normalize-scss').includePaths
    }))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gcmq())
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(sourcemaps.write()) 
    .pipe(gulp.dest(path.build.css))
    .pipe(browserSync.stream());
};

function clear(){
  return del(path.clear.clear);
};

function html(){
  return gulp.src(path.src.html)
    .pipe(gulp.dest(path.build.html))
    .pipe(browserSync.stream());
};


function watch(){
  browserSync.init({
    server: {
      baseDir: "./build"
    },
    notify: false

  });
  gulp.watch(path.watch.sass, styles);
  gulp.watch(path.watch.html, html);
};


const build = gulp.series(clear, gulp.parallel(styles, html));

gulp.task('default', gulp.series(build, watch));
  