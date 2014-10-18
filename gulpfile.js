var fs = require('fs'),
  path = require('path'),
  del = require('del'),
  sass = require('sass-stream'),
  closure = require('closure-compiler-stream'),
  gulp = require('gulp'),
  tap = require('gulp-tap'),
  svgmin = require('gulp-svgmin'),
  imagemin = require('gulp-imagemin'),
  sourcemaps = require('gulp-sourcemaps'),
  karma = require('karma').server,
  spawn = require('child_process').spawn,

  ASSET_PREFIX = 'fatcatmap/assets/',
  DEBUG = (process.env.ENV === 'debug'),

  getExecCb = function (cb) {
    return function (e, out, err) {
      if (out)
        process.stdout.write(out);
      if (err)
        process.stderr.write(err);
      if (cb)
        cb(e);
    };
  },

  merge = function (obj1, obj2) {
    var obj = {};
    for (var k in obj1) {
      if (obj1.hasOwnProperty(k)) {
        obj[k] = obj1[k];
      }
    }
    for (var k in obj2) {
      if (obj2.hasOwnProperty(k)) {
        obj[k] = obj2[k];
      }
    }
    return obj;
  },

  src = gulp.src.bind(gulp),
  dest = gulp.dest.bind(gulp),
  task = gulp.task.bind(gulp),
  watch = gulp.watch.bind(gulp),

  inputs, outputs, config;

// Asset input globs.
inputs = {
  img: ASSET_PREFIX + 'img/**/*.{png,jpg,gif}',
  sass: ASSET_PREFIX + 'sass/catnip.sass',
  js: {
    app: ASSET_PREFIX + 'js/src/**/*.js',
    lib: ASSET_PREFIX + 'js/lib/**/*.js',
    legacy: ASSET_PREFIX + 'js/*.js',
    closure: ASSET_PREFIX + 'js/lib/closure/base.js',
    externs: ASSET_PREFIX + 'js/externs/*.js',
    test: 'fatcatmap_tests/js/spec/unit/**/*.spec.js'
  },
  templates: {
    html: 'fatcatmap/templates/source/**/*',
    js: ASSET_PREFIX + 'js/templates'
  }
};

// Asset compilation target directories.
outputs = {
  img: ASSET_PREFIX + 'img',
  css: ASSET_PREFIX + 'style',
  js: {
    app: ASSET_PREFIX + 'js/compiled/',
    test: 'fatcatmap_tests/js/spec/compiled/'
  },
  templates: 'fatcatmap/templates/compiled',
  sourcemaps: '.develop/maps/'
};

// Build configuration.
config = {

  // Sourcemaps
  sourcemaps: {
    includeContent: false
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

  // Sass
  sass: {
    compileOptions: {
      outputStyle: 'compressed',
      includePaths: [ASSET_PREFIX + 'sass/'],
    },
    output: outputs.css + '/catnip.css'
  },

  // Closure Compiler
  closure: {

    // Prod compile settings
    app: {
      js_output_file: outputs.js.app + 'app.min.js',
      debug: false,
      summary_detail_level: 3,
      warning_level: 'VERBOSE',
      language_in: 'ECMASCRIPT5',
      closure_entry_point: 'init',
      only_closure_dependencies: true,
      process_closure_primitives: true,
      use_types_for_optimization: null,
      generate_exports: null,
      externs: [
        ASSET_PREFIX + 'js/lib/externs/w3c/btoa.js',
        ASSET_PREFIX + 'js/lib/externs/w3c/EventSource.js',
        ASSET_PREFIX + 'js/lib/externs/w3c/pointer-events.js',
        ASSET_PREFIX + 'js/lib/externs/jasmine/jasmine.js',
        ASSET_PREFIX + 'js/lib/externs/fcm/config.js',
        ASSET_PREFIX + 'js/lib/externs/fcm/search.js',
        ASSET_PREFIX + 'js/lib/externs/fcm/types.js',
        ASSET_PREFIX + 'js/lib/externs/fcm/graph.js',
        ASSET_PREFIX + 'js/lib/externs/fcm/data.js',
        ASSET_PREFIX + 'js/lib/externs/vue/vue.js',
        ASSET_PREFIX + 'js/lib/externs/d3/d3.js'
      ]
    },

    // Prod compile settings
    min: {
      js_output_file: outputs.js.app + 'app.min.js',
      debug: false,
      compilation_level: 'ADVANCED_OPTIMIZATIONS',
      output_wrapper: '(function() {%output%})();'
    },

    // Debug compile settings
    debug: {
      js_output_file: outputs.js.app + 'app.debug.js',
      debug: true,
      formatting: 'PRETTY_PRINT',
      compilation_level: 'ADVANCED_OPTIMIZATIONS',
      output_wrapper: '(function() {\n%output%\n})();'
    },

    // Pretty compile settings
    pretty: {
      js_output_file: outputs.js.app + 'app.js',
      formatting: 'PRETTY_PRINT',
      compilation_level: 'SIMPLE_OPTIMIZATIONS',
      output_wrapper: '(function() {\n%output%\n})();'
    },

    // Test compile settings
    test: {
      debug: false,
      compilation_level: 'SIMPLE_OPTIMIZATIONS'
    }
  },

  // SVG minification
  svgmin: {},

  // Test config
  karma: require('./fatcatmap_tests/js/karma.conf.js')
};

// Compile sass
task('sass', function (cb) {
  src(inputs.sass)
    .pipe(sass(config.sass));
  cb();
});

// Overarching style task
task('style', ['sass']);

// Clean compiled css files
task('style:clean', function (cb) {
  del([outputs.css + '/*'], cb);
});

// Compile JS with Closure Compiler in production mode
task('closure:min', function () {
  var cfg = config.sourcemaps;
  cfg.sourceRoot = '/assets/js/src';
  return src(inputs.js.app)
    .pipe(sourcemaps.init())
    .pipe(closure(merge(config.closure.app, config.closure.min)))
    .pipe(sourcemaps.write(
      path.relative(ASSET_PREFIX + 'js/src', outputs.sourcemaps + ASSET_PREFIX + 'js/'),
      cfg))
    .pipe(dest(outputs.js.app));
});

// Compile JS with Closure Compiler in debug mode
task('closure:debug', function () {
  var cfg = config.sourcemaps;
  cfg.sourceRoot = '/assets/js/src';
  return src(inputs.js.app)
    .pipe(sourcemaps.init())
    .pipe(closure(merge(config.closure.app, config.closure.debug)))
    .pipe(sourcemaps.write(
      path.relative(ASSET_PREFIX + 'js/src', outputs.sourcemaps + ASSET_PREFIX + 'js/'),
      cfg))
    .pipe(dest(outputs.js.app));
});

// Compile JS with Closure Compiler in pretty mode
task('closure:pretty', function () {
  var cfg = config.sourcemaps;
  cfg.sourceRoot = '/assets/js/src';
  return src(inputs.js.app)
    .pipe(sourcemaps.init())
    .pipe(closure(merge(config.closure.app, config.closure.pretty)))
    .pipe(sourcemaps.write(
      path.relative(ASSET_PREFIX + 'js/src', outputs.sourcemaps + ASSET_PREFIX + 'js/'),
      cfg))
    .pipe(dest(outputs.js.app));
});

// Compile JS source with tests via Closure Compiler in minified mode.
task('closure:test', function (cb) {
  var sources = [],
    tests = [],
    run = function () {
      var cfg = merge(config.closure.app, config.closure.test);

      delete cfg.closure_entry_point;
      delete cfg.only_closure_dependencies;

      cfg.module_output_path_prefix = ASSET_PREFIX + 'js/compiled/test/';
      cfg.module = [
        ['app:' + sources.length].concat(sources),
        ['test:' + tests.length + ':app'].concat(tests)
      ];

      src(inputs.js.app)
        .pipe(closure(cfg))
        .on('finish', function () {
          setTimeout(function () {
            cb()
          }, 7000);
        });
    };

  src(inputs.js.app + '/')
    .pipe(tap(function (file) {
      if (!(/js\/src\/[^\/]+\.js$/).test(file.path))
        sources.push(file.path);
    }));

  src(inputs.js.test)
    .pipe(tap(function (file) {
      tests.push(file.path);
    }));
  
  setTimeout(function () {
    run();
  }, 1000);
});

// Clean compiled JS files
task('closure:clean', function (cb) {
  del([outputs.js.app + '/*.js', ASSET_PREFIX + 'js/*.js'], cb);
});

task('closure', ['closure:debug']);
task('closure:all', ['closure:min', 'closure:debug', 'closure:pretty', 'closure:test']);

// Build templates
task('templates', function (cb) {
  var sh = spawn('bin/fcm', ['build', '--templates'], {stdio: 'inherit'})
    .on('exit', function () {
      sh = null;
    });
  process.on('exit', function () {
    if (sh)
      sh.kill();
  });
  cb();
});

// Clean templates
task('templates:clean', function (cb) {
  del([
    outputs.templates.html + '/*',
    outputs.templates.js + '/*'
  ], cb);
});

// Run dev server
task('run', function (cb) {
  var killSh = function () {
    if (sh)
      sh.kill();
  },
  sh = spawn('bin/fcm', ['run', '--simple'], {stdio: 'inherit'})
    .on('error', killSh)
    .on('exit', function () {
      sh = null;
    });
  process.on('exit', killSh)
    .on('error', killSh);
  cb();
});

// Watch assets & recompile on change
task('watch', function (cb) {
  watch(ASSET_PREFIX + 'sass/**/*.sass', ['sass']);
  watch([
    inputs.templates.html + '/**/*.html',
    inputs.templates.js + '/**/*.html'
  ], ['templates']);
  watch(inputs.js.app, ['closure']);
  cb();
});

// Run JS tests
task('test', ['test:release']);

// Run JS tests in release mode
task('test:release', ['test:clean', 'closure:test'], function (cb) {
  karma.start(merge({}, config.karma));
  cb();
});

// Clean JS test output
task('test:clean', function (cb) {
  del([
    '.develop/coverage/js/**/*',
    '.develop/test-reports/js/**/*'
  ], cb);
});

// Default task - runs with bare 'gulp'.
task('default', [
  'sass',
  'test'
]);

// Develop task
task('dev', [
  'sass',
  'templates',
  'closure',
  'watch',
  'run'
]);

// Release task
task('release', [
  'sass',
  'closure:min',
  'test:release'
]);

// Clean task
task('clean', [
  'test:clean',
  'style:clean',
  'closure:clean',
  'templates:clean'
], function (cb) {
  del([outputs.sourcemaps + '/*'], cb);
});
