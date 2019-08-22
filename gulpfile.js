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
      replace         = require('gulp-replace'),
      tinypng         = require('gulp-tinypng');


const isDev = process.argv.indexOf('--dev') !== -1; //develop mode
const isProd = process.argv.indexOf('--prod') !== -1;// production mode

//============================================== path ====================================================
const path = {
  src: {
    html:     'src/pages/*.html',
    sass:     'src/styles/*.scss',
    js:       'src/js/*.js',
    jsVen:    'src/js/**/*.js',
    svg:      'src/media-files/img/*.svg',
    img:      'src/media-files/img/**/*.+(jpg|png)'
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
    svg:        'src/media-files/img/*.svg',
    img:        'src/media-files/img/**/*.+(jpg|png)'
  },
  clear : {
    clean:      'build/*',
    cleanImg:   'build/assets/img/'

  }
};
//============================================== fileInclude ====================================================
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
//============================================== SASS ====================================================
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
//============================================== SCRIPTS ====================================================



//============================================== clear ====================================================
const clearBuild = () => {
  return del(path.clear.clean);
};
const clearImg = () => {
  return del(path.clear.cleanImg);
};
//============================================== IMAGES ====================================================
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

const image = () => {
  return gulp
    .src(path.src.img)
      .pipe(gulpif(isProd, tinypng('vWq20TzzZr7fgWXDGFS8gGdVHd8y0VTk')))// free 500 img per month; get new API key or pay - visit https://tinypng.com
      .pipe(rename(function(path) {
        path.dirname = ''
      }))
      .pipe(gulp.dest(path.build.img));
};
//============================================== watcher ====================================================
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
  gulp.watch(path.watch.img, gulp.series(clearImg, image));
};

//============================================== TASK ====================================================
const build = gulp.series(clearBuild, 
  gulp.parallel(styles, svg, image, fileInclude));

gulp.task('default', gulp.series(build, watch));

// nmp run dev - start gulp development mode
// nmp run prod - start gulp production mode