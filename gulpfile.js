const gulp            = require('gulp'),
      autoprefixer    = require('gulp-autoprefixer'),
      sass            = require('gulp-sass'),
      sourcemaps      = require('gulp-sourcemaps'),
      plumber         = require('gulp-plumber'),
      del             = require('del'),
      browserSync     = require('browser-sync').create(),
      gcmq            = require('gulp-group-css-media-queries'),
      cleanCSS        = require('gulp-clean-css'),
      fileinclude     = require('gulp-file-include'),
      rename          = require("gulp-rename");

const path = {
  src: {
    html:     'src/pages/*.html',
    sass:     'src/styles/*.scss',
    js:       'src/js/*.js',
    jsVen:    'src/js/**/*.js',
    img:      ''
  },
  build: {
    html:     'build/',
    css:      'build/assets/styles',
    js:       'build/assets/js',
    jsVen:    'build/assets/js/vendor',
    img:      ''
  },
  watch: { 
    html:       'src/**/*.html',
    sass:       'src/**/*.scss',
    js:         'app/js/*.js',
    img:        ''
  },
  clear : {
    clear:      'build/*'
  }
};

const fileInclude = () => {
  return gulp
    .src(path.src.html)
    .pipe(plumber())
    .pipe(
      fileinclude ({
        prefix: '@@',
        basepath: "@file"
      })
    )
    .pipe(gulp.dest(path.build.html))
    .pipe(browserSync.stream());
} 

const styles = () => {
  return gulp
    .src(path.src.sass)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass(/* {includePaths: require('node-normalize-scss').includePaths} */))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gcmq())
    .pipe(cleanCSS({
        level: {
          1: {
            all: true,
            normalizeUrls: false
          },
          2: {
            restructureRules: true
          }
        }
    }))
    .pipe(rename({suffix: ".min"}))
    .pipe(sourcemaps.write()) 
    .pipe(gulp.dest(path.build.css))
    .pipe(browserSync.stream());
};

const clear = () => {
  return del(path.clear.clear);
};

const watch = () => {
  browserSync.init({
    server: {
      baseDir: "./build"
    },
    notify: false
  });
  gulp.watch(path.watch.sass, styles);
  gulp.watch(path.watch.html, browserSync.stream()); 
  gulp.watch(path.watch.html, fileInclude);
};


const build = gulp.series(clear, gulp.parallel(styles,fileInclude));

gulp.task('default', gulp.series(build, watch));
