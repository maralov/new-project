

const gulp      = require('gulp'),
      autoprefixer    = require('gulp-autoprefixer'),
      sass            = require('gulp-sass'),
      sourcemaps      = require('gulp-sourcemaps'),
      plumber         = require('gulp-plumber'),
      del             = require('del'),
      browserSync     = require('browser-sync').create(),
      gcmq            = require('gulp-group-css-media-queries'),
      cleanCSS        = require('gulp-clean-css'),
      fileinclude     = require('gulp-file-include'),
      concat          = require("gulp-concat"),
      rename          = require("gulp-rename"),
      gulpif          = require('gulp-if'),
      svgSprite       = require('gulp-svg-sprites'),
      svgmin          = require('gulp-svgmin'),
      cheerio         = require('gulp-cheerio'),
      replace         = require('gulp-replace'),
      browserify      = require('browserify'),
      source          = require('vinyl-source-stream'),
      buffer          = require('vinyl-buffer'),
      uglify          = require('gulp-uglify'),
      babelify        = require('babelify'),
      rigger          = require('gulp-rigger');


const isDev = process.argv.indexOf('--dev') !== -1; //develop mode
const isProd = process.argv.indexOf('--prod') !== -1;// production mode

//============================================== path ====================================================
const path = {
  src: {
    html:     'src/pages/*.html',
    sass:     'src/styles/*.scss',
    js:       'src/js/index.js',
    jsVen:    'src/js/vendor/*.js',
    svg:      'src/media-files/img/**/*.svg',
    fonts:    'src/fonts/*.+(ttf|woff|woff2|svg|eot)',
    img:      'src/media-files/img/**/*.+(jpg|jpeg|png|svg)'
  },
  build: {
    html:     'build/',
    css:      'build/assets/styles',
    js:       'build/assets/js',
    jsVen:    'build/assets/js/vendor',
    svg:      'src/media-files/img/svg-sprites',
    fonts:    'build/assets/fonts',
    img:      'build/assets/img'
  },
  watch: {
    html:       'src/**/*.html',
    sass:       'src/**/*.scss',
    js:         'src/js/**/*.js',
    svg:        'src/media-files/img/**/*.svg',
    fonts:      'src/fonts/*.+(ttf|woff|woff2|svg|eot)',
    img:        'src/media-files/img/**/*.+(jpg|jpeg|png|svg)'
  },
  clear : 'build/*'
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
.pipe(browserSync.stream())
} ;

//============================================== SASS ====================================================

const styles = () => {
return gulp
.src(path.src.sass)
.pipe(plumber())
.pipe(gulpif(isDev, sourcemaps.init()))
.pipe(sass())
.pipe(gulpif(isProd, autoprefixer({
overrideBrowserslist: ['last 5 versions'],
cascade: false
})))
.pipe(gcmq())
.pipe(gulpif(isProd, cleanCSS({
  level: {
    1: {
      all: true,
      normalizeUrls: false
    },
    2: {
      restructureRules: true
    }
  }
})))
.pipe(rename({suffix: ".min"}))
.pipe(gulpif(isDev, sourcemaps.write()))
.pipe(gulp.dest(path.build.css))
.pipe(browserSync.stream())
};

//============================================== SCRIPTS ====================================================

const jsVen = () => {
  return gulp
  .src(path.src.jsVen)
  .pipe(uglify())
  .pipe(rename({suffix: ".min"}))
  .pipe(gulp.dest(path.build.jsVen))
};

const js = () => {
  return browserify(path.src.js)
  .transform('babelify', {
  presets: ['es2015']
  })
  .bundle()
  .pipe(source('index.js'))
  .pipe(buffer())
  .pipe(gulpif(isProd, uglify()))
  .pipe(rename('index.min.js'))
  .pipe(gulp.dest(path.build.js))
  .pipe(browserSync.stream())
}

const scripts = gulp.parallel(jsVen, js)


//============================================== clear ====================================================

const clearBuild = () => {
return del(path.clear);
};


//============================================== SVG ====================================================

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
}))
.pipe(gulp.dest(path.build.svg))
};

//============================================== IMAGES ====================================================

const image = () => {
return gulp
.src(path.src.img)
.pipe(rename(function(path) {
  path.dirname = ''
}))
.pipe(gulp.dest(path.build.img))
};
//============================================== FONTS ====================================================
const fonts = () => {
return gulp
.src(path.src.fonts)
.pipe(gulp.dest(path.build.fonts))
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
gulp.watch(path.watch.img, image);
gulp.watch(path.watch.js, scripts);
gulp.watch(path.watch.fonts, fonts);
};

//============================================== TASK ====================================================
const build = gulp.series(clearBuild,
gulp.parallel(scripts, styles, svg, image, fonts, fileInclude)
);

gulp.task('default', gulp.series(build, watch));

// npm run dev - start gulp development mode
// npm run prod - start gulp production mode
