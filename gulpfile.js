var path = require('path'),
  less = require('less-stream'),
  closure = require('closure-compiler-stream'),
  gulp = require('gulp'),
  rmrf = require('gulp-rimraf'),
  svgmin = require('gulp-svgmin'),
  imagemin = require('gulp-imagemin'),
  sourcemaps = require('gulp-sourcemaps'),
  karma = require('karma').server,
  exec = require('child_process').exec,

  ASSET_PREFIX = 'fatcatmap/assets/',
  DEBUG = (process.env.ENV === 'debug'),

  getExecCb = function (cb) {
    return function (e, out, err) {
      if (out)
        console.log(out);
      if (err)
        throw err;
      cb(e);
    };
  },

  merge = function (obj1, obj2) {
    for (var k in obj2) {
      if (obj2.hasOwnProperty(k)) {
        obj1[k] = obj2[k];
      }
    }
    return obj1;
  },

  inputs, outputs, config;

// Asset input globs.
inputs = {
  img: ASSET_PREFIX + 'img/**/*.{png,jpg,gif}',
  less: ASSET_PREFIX + 'less/**/*.less',
  js: {
    app: ASSET_PREFIX + 'js/src/**/*.js',
    lib: ASSET_PREFIX + 'js/lib/**/*.js',
    closure: ASSET_PREFIX + 'js/lib/closure/base.js',
    externs: ASSET_PREFIX + 'js/externs/*.js',
    test: 'fatcatmap_tests/js/spec'
  },
  themes: ASSET_PREFIX + 'less/site/home.less',
  templates: 'fatcatmap/templates/source/**/*',
};

// Asset compilation target directories.
outputs = {
  img: ASSET_PREFIX + 'img',
  css: ASSET_PREFIX + 'style',
  js: {
    app: ASSET_PREFIX + 'js/compiled/'
  },
  themes: {
    dark: ASSET_PREFIX + 'style/themes/dark/',
    light: ASSET_PREFIX + 'style/themes/light/',
    scaffold: ASSET_PREFIX + 'style/themes/scaffold/'
  },
  templates: 'fatcatmap/templates/compiled/*',
  sourcemaps: '../../../../../.develop/maps/'
};

// Build configuration.
config = {

  // Sourcemaps
  sourcemaps: {
    includeContent: false,
    sourceRoot: '/.develop/maps/' // This needs to match asset serve root for less
  },

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

  // Less
  less: {
    options: {
      compress: true,
      cleancss: true,
      ieCompat: false,
      report: 'min',
      optimization: 2,
      paths: [
        ASSET_PREFIX + "less",
        ASSET_PREFIX + "bootstrap"
      ]
    },
    themes: {
      dark: {
        modifyVars: { theme: 'dark' }
      },
      light: {
        modifyVars: { theme: 'light' }
      },
      scaffold: {
        modifyVars: { theme: 'scaffold' }
      }
    }
  },

  // Closure Compiler
  closure: {

    // Prod compile settings
    app: {
      jar: 'lib/closure/build/compiler.jar',
      js_output_file: outputs.js.app + 'app.min.js',
      debug: false,
      summary_detail_level: 3,
      warning_level: 'VERBOSE',
      language_in: 'ECMASCRIPT5',
      closure_entry_point: 'init',
      only_closure_dependencies: true,
      process_closure_primitives: true,
      use_types_for_optimization: null,
      compilation_level: 'ADVANCED_OPTIMIZATIONS',
      output_wrapper: '(function() {%output%})();'
    },

    // Debug compile settings
    debug: {
      jar: 'lib/closure/build/compiler.jar',
      js_output_file: outputs.js.app + 'app.debug.js',
      debug: true,
      summary_detail_level: 3,
      warning_level: 'VERBOSE',
      language_in: 'ECMASCRIPT5',
      formatting: 'PRETTY_PRINT',
      closure_entry_point: 'init',
      only_closure_dependencies: true,
      process_closure_primitives: true,
      use_types_for_optimization: null,
      compilation_level: 'SIMPLE_OPTIMIZATIONS',
      output_wrapper: '(function() {\n%output%\n})();'
    }
  },

  // SVG minification
  svgmin: {},

  // Test config
  karma: require('./fatcatmap_tests/js/karma.conf.js')
};

// Compile less source to css
gulp.task('less', [
  'less:dark',
  'less:light',
  'less:scaffold'
]);

// Compile dark theme
gulp.task('less:dark', function () {
  var opts = merge(merge({}, config.less.options), config.less.themes.dark);
  return gulp.src(inputs.themes)
    .pipe(sourcemaps.init())
    .pipe(less(opts))
    .pipe(sourcemaps.write(
      outputs.sourcemaps + ASSET_PREFIX + 'style/themes/dark/',
      config.sourcemaps))
    .pipe(gulp.dest(outputs.themes.dark));
});

// Compile light theme
gulp.task('less:light', function () {
  var opts = merge(merge({}, config.less.options), config.less.themes.light);
  return gulp.src(inputs.themes)
    .pipe(sourcemaps.init())
    .pipe(less(opts))
    .pipe(sourcemaps.write(
      outputs.sourcemaps + ASSET_PREFIX + 'style/themes/light/',
      config.sourcemaps))
    .pipe(gulp.dest(outputs.themes.light));
});

// Compile scaffold theme
gulp.task('less:scaffold', function () {
  var opts = merge(merge({}, config.less.options), config.less.themes.scaffold);
  return gulp.src(inputs.themes)
    .pipe(sourcemaps.init())
    .pipe(less(opts))
    .pipe(sourcemaps.write(
      outputs.sourcemaps + ASSET_PREFIX + 'style/themes/scaffold/',
      config.sourcemaps))
    .pipe(gulp.dest(outputs.themes.scaffold));
});

// Clean compiled css files
gulp.task('less:clean', function () {
  return gulp.src(outputs.css + '/*')
    .pipe(rmrf());
});

// Compile JS with Closure Compiler in production mode
gulp.task('closure', function () {
  return gulp.src(inputs.js.app)
    .pipe(closure(config.closure.app));
});

// Compile JS with Closure Compiler in debug mode
gulp.task('closure:debug', function () {
  return gulp.src(inputs.js.app)
    .pipe(closure(config.closure.debug));
});

// Clean compiled JS files
gulp.task('closure:clean', function () {
  return gulp.src(outputs.js.app + '/*')
    .pipe(rmrf());
});

// Build templates
gulp.task('templates:build', function (cb) {
  exec('bin/fcm build --templates', getExecCb(cb));
});

// Clean templates
gulp.task('templates:clean', function () {
  return gulp.src(outputs.templates)
    .pipe(rmrf());
});

// Run dev server
gulp.task('serve', function (cb) {
  exec('bin/fcm run', getExecCb(cb));
});

// Watch assets & recompile on change
gulp.task('watch', function (cb) {
  gulp.watch(inputs.less, ['less']);
  gulp.watch(inputs.templates, ['templates:build']);
  cb();
});

// Run JS tests based on environment
gulp.task('test', [DEBUG ? 'test:debug' : 'test:release']);

// Run JS tests in dev mode
gulp.task('test:debug', ['closure:debug'], function (cb) {
  var cfg = merge({}, config.karma);
  cfg.files = cfg._debugFiles;
  karma.start(cfg);
  cb();
});

// Run JS tests in release mode
gulp.task('test:release', ['closure'], function (cb) {
  var cfg = merge({}, config.karma);
  cfg.files = cfg._releaseFiles;
  karma.start(cfg);
  cb();
});

// Clean JS test output
gulp.task('test:clean', function () {
  return gulp.src(['.develop/coverage/js/*', '.develop/test-reports/js/*'])
    .pipe(rmrf());
});

// Default task - runs with bare 'gulp'.
gulp.task('default', [
  'less',
  'test:debug',
]);

// Develop task
gulp.task('develop', [
  'less',
  'test:debug',
  'serve',
  'watch'
]);

// Release task
gulp.task('release', [
  'less',
  'closure',
  'test:release'
]);

// Clean task
gulp.task('clean', [
  'less:clean',
  'closure:clean',
  'templates:clean'
]);