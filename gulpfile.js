var gulp = require('gulp'),
  sass = require('gulp-sass'),
  svgmin = require('gulp-svgmin'),
  imagemin = require('gulp-imagemin'),
  closure = require('gulp-closure-compiler'),
  exec = require('child_process').exec,

  ASSET_PREFIX = 'fatcatmap/assets/',

  getExecCb = function (cb) {
    return function (e, out, err) {
      if (out)
        console.log(out);
      if (err)
        console.err(err);
      cb(e);
    };
  },

  inputs, outputs, config;

// Asset input globs.
inputs = {
  img: ASSET_PREFIX + 'img/**/*.{png,jpg,gif}',
  sass: ASSET_PREFIX + 'sass/*.sass',
  js: {
    lib: ASSET_PREFIX + 'js/lib/**/*.js',
    map: ASSET_PREFIX + 'js/map/**/*.js',
    core: ASSET_PREFIX + 'js/core/**/*.js',
    externs: ASSET_PREFIX + 'js/externs/**/*.js'
  },
  templates: 'fatcatmap/templates/source/**/*',
};

// Asset compilation target directories.
outputs = {
  img: ASSET_PREFIX + 'img',
  css: ASSET_PREFIX + 'style',
  js: ASSET_PREFIX + 'js'
};

// Build configuration.
config = {

  // Images
  imagemin: {
    optimizationLevel: 7,
    progressive: true,
    interlaced: true,
    pngquant: true,
    files: [{
      expand: true,
      src: ['**/*.{png,jpg,gif}'],
      cwd: 'fatcatmap/assets/img/',
      dest: 'fatcatmap/assets/img/'
    }]
  },

  // Sass
  sass: {
    outputStyle: 'compressed',
    sourceComments: 'map',
    sourceMap: 'sass',
    errLogToConsole: true

    // TODO: Themes
  },

  // Closure Compiler
  closure: {

    // Prod compile settings
    app: {
      compilerPath: 'lib/closure/build/compiler.jar',
      fileName: outputs.js + '/app.min.js',
      compilerFlags: {
        debug: false,
        summary_detail_level: 3,
        warning_level: 'VERBOSE',
        language_in: 'ECMASCRIPT5',
        closure_entry_point: 'app.main',
        use_types_for_optimization: true,
        process_closure_primitives: true,
        compilation_level: 'ADVANCED_OPTIMIZATIONS'
      }
    },

    // Debug compile settings
    debug: {
      compilerPath: 'lib/closure/build/compiler.jar',
      fileName: outputs.js + '/app.debug.min.js',
      compilerFlags: {
        debug: true,
        summary_detail_level: 3,
        warning_level: 'VERBOSE',
        language_in: 'ECMASCRIPT5',
        formatting: 'PRETTY_PRINT',
        closure_entry_point: 'app.main',
        use_types_for_optimization: true,
        process_closure_primitives: true,
        compilation_level: 'SIMPLE_OPTIMIZATIONS'
      }
    }
  },

  // SVG minification
  svgmin: {}
};

// Compile sass source to css
gulp.task('sass', function () {
  console.log('Compiling stylesheets...');
  return gulp.src(inputs.sass)
    .pipe(sass(config.sass))
    .pipe(gulp.dest(outputs.css));
});

// Compile JS with Closure Compiler in production mode
gulp.task('closure', function () {
  console.log('Compiling js for production with closure...');
  return gulp.src([inputs.js.core, inputs.js.map])
    .pipe(closure(config.closure.app))
    .pipe(gulp.dest(outputs.js));
});

// Compile JS with Closure Compiler in debug mode
gulp.task('closure:debug', function () {
  console.log('Compiling debug js with closure...');
  return gulp.src([inputs.js.core, inputs.js.map])
    .pipe(closure(config.closure.debug))
    .pipe(gulp.dest(outputs.js));
});

// Build templates
gulp.task('templates:build', function (cb) {
  exec('bin/fcm build --templates', getExecCb(cb));
});

// Clean templates
gulp.task('templates:clean', function (cb) {
  exec('rm -rf fatcatmap/templates/compiled/*', getExecCb(cb));
});

// Run dev server
gulp.task('serve', function (cb) {
  exec('bin/fcm run', getExecCb(cb));
});

// Watch assets & recompile on change
gulp.task('watch', function (cb) {
  gulp.watch(inputs.sass, ['sass']);
  gulp.watch(inputs.templates, ['templates:build']);
  cb();
});

// Default task - runs with bare 'gulp'.
gulp.task('default', [
  'sass',
  'closure:debug'
]);

// Develop task
gulp.task('develop', [
  'sass',
  'closure:debug',
  'serve',
  'watch'
]);

// Release task
gulp.task('release', [
  'sass',
  'closure'
]);