var gulp = require('gulp'),
  less = require('gulp-less'),
  rmrf = require('gulp-rimraf'),
  karma = require('gulp-karma'),
  svgmin = require('gulp-svgmin'),
  imagemin = require('gulp-imagemin'),
  sourcemaps = require('gulp-sourcemaps'),
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

  merge = function (obj1, obj2) {
    for (var k in obj2) {
      if (obj2.hasOwnProperty(k)) {
        obj1[k] = obj2[k]
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
    app: [
      ASSET_PREFIX + 'js/src/core/**/*.js',   // core
      ASSET_PREFIX + 'js/src/map/**/*.js',    // mapper
    ],
    lib: ASSET_PREFIX + 'js/lib/**/*.js',
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
    app: ASSET_PREFIX + 'js/compiled'
  },
  themes: {
    dark: ASSET_PREFIX + 'style/themes/fcm-dark/home.css',
    light: ASSET_PREFIX + 'style/themes/fcm-light/home.css',
    scaffold: ASSET_PREFIX + 'style/themes/fcm-scaffold/home.css'
  },
  templates: 'fatcatmap/templates/compiled/*',
  sourcemaps: '.develop/maps'
};

// Build configuration.
config = {

  // Sourcemaps
  sourcemaps: {
    includeContent: false,
    sourceRoot: '/.develop/maps'
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
        globalVars: { theme: 'dark' }
      },
      light: {
        globalVars: { theme: 'light' }
      },
      scaffold: {
        globalVars: { theme: 'scaffold' }
      }
    }
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

// Compile less source to css
gulp.task('less', [
  'less:dark',
  // 'less:light',
  // 'less:scaffold'
]);

// Compile dark theme
gulp.task('less:dark', function () {
  var opts = merge(merge({}, config.less.options), config.less.themes.dark);
  console.log('compiling dark less with options: %j', opts);
  return gulp.src(inputs.themes)
    .pipe(sourcemaps.init())
    .pipe(less(opts))
    .pipe(sourcemaps.write(outputs.sourcemaps, config.sourcemaps))
    .pipe(gulp.dest(outputs.themes.dark));
});

// Compile light theme
gulp.task('less:light', function () {
  var opts = merge({}, config.less.options);
  return gulp.src(inputs.themes)
    .pipe(sourcemaps.init())
    .pipe(less(merge(opts, config.less.themes.light)))
    .pipe(sourcemaps.write(outputs.sourcemaps, config.sourcemaps))
    .pipe(gulp.dest(outputs.themes.light));
});

// Compile scaffold theme
gulp.task('less:scaffold', function () {
  var opts = merge({}, config.less.options);
  return gulp.src(inputs.themes)
    .pipe(sourcemaps.init())
    .pipe(less(merge(opts, config.less.themes.scaffold)))
    .pipe(sourcemaps.write(outputs.sourcemaps, config.sourcemaps))
    .pipe(gulp.dest(outputs.themes.scaffold));
});

// Clean compiled css files
gulp.task('less:clean', function () {
  return gulp.src(outputs.css + '/*')
    .pipe(rmrf());
});

// Compile JS with Closure Compiler in production mode
gulp.task('closure', function () {
  console.log('Compiling js for production with closure...');
  return gulp.src(inputs.js.app)
    .pipe(closure(config.closure.app))
    .pipe(gulp.dest(outputs.js.app));
});

// Compile JS with Closure Compiler in debug mode
gulp.task('closure:debug', function () {
  console.log('Compiling debug js with closure...');
  return gulp.src(inputs.js.app)
    .pipe(closure(config.closure.debug))
    .pipe(gulp.dest(outputs.js.app));
});

// Clean compiled JS files
gulp.task('closure:clean', function () {
  return gulp.src(outputs.js)
    .pipe(rmrf());
});

// Build templates
gulp.task('templates:build', function (cb) {
  exec('bin/fcm build --templates', getExecCb(cb));
});

// Clean templates
gulp.task('templates:clean', function () {
  return gulp.src(outputs.template)
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

// Default task - runs with bare 'gulp'.
gulp.task('default', [
  'less',
  'closure:debug'
]);

// Develop task
gulp.task('develop', [
  'less',
  'closure:debug',
  'serve',
  'watch'
]);

// Release task
gulp.task('release', [
  'less',
  'closure'
]);

// Clean task
gulp.task('clean', [
  'less:clean',
  'closure:clean',
  'template:clean'
]);