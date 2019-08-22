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
      rename          = require("gulp-rename"),
      gulpif          = require('gulp-if'),
      svgSprite       = require('gulp-svg-sprites'),
	    svgmin          = require('gulp-svgmin'),
	    cheerio         = require('gulp-cheerio'),
	    replace         = require('gulp-replace');

const isDev = process.argv.indexOf('--dev') !== -1;
const isProd = process.argv.indexOf('--prod') !== -1;

const path = {
  src: {
    html:     'src/pages/*.html',
    sass:     'src/styles/*.scss',
    js:       'src/js/*.js',
    jsVen:    'src/js/**/*.js',
    svg:      'src/media-files/img/svg-icons/*.svg'
  },
  build: {
    html:     'build/',
    css:      'build/assets/styles',
    js:       'build/assets/js',
    jsVen:    'build/assets/js/vendor',
    svg:      'src/media-files/img/svg-sprites',
    img:      'build/assets/img/'
   
  },
  watch: { 
    html:       'src/**/*.html',
    sass:       'src/**/*.scss',
    js:         'app/js/*.js',
    svg:        'src/media-files/img/svg-icons/*.svg',
    img:        ''
  },
  clear : {
    clean:      'build/*'
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
    .pipe(gulpif(isDev, sourcemaps.init()))
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
  return del(path.clear.clean);
};

const svg = () => {
  return gulp.src(path.src.svg)
  .pipe(svgmin({
    js2svg: {
      pretty: true
    }
  }))
  .pipe(cheerio({
    run: function ($) {
      $('[fill]').removeAttr('fill');
      $('[style]').removeAttr('style');
    },
    parserOptions: { xmlMode: true }
  }))
  .pipe(replace('&gt;', '>'))
  .pipe(svgSprite({
    mode: "symbols",
    preview: false,
    selector: "icon-%f",
    svg: {
      symbols:'svg-sprite.html'
    }
  }
  ))
    .pipe(gulp.dest(path.build.svg));
}

const watch = () => {
  browserSync.init({
    server: {
      baseDir: "./build"
    },
    notify: false
  });
  gulp.watch(path.watch.sass, styles);
  gulp.watch(path.watch.html, fileInclude);
  gulp.watch(path.watch.svg, svg);

};

const build = gulp.series(clear, gulp.parallel(styles, svg, fileInclude));

gulp.task('default', gulp.series(build, watch));
