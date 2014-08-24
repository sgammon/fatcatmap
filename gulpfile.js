var fs = require('fs'),
  path = require('path'),
  less = require('less-stream'),
  sass = require('sass-stream'),
  closure = require('closure-compiler-stream'),
  gulp = require('gulp'),
  rmrf = require('gulp-rimraf'),
  svgmin = require('gulp-svgmin'),
  concat = require('gulp-concat'),
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
  less: ASSET_PREFIX + 'less/**/*.less',
  sass: ASSET_PREFIX + 'sass/catnip.sass',
  js: {
    app: ASSET_PREFIX + 'js/src/**/*.js',
    lib: ASSET_PREFIX + 'js/lib/**/*.js',
    legacy: ASSET_PREFIX + 'js/*.js',
    closure: ASSET_PREFIX + 'js/lib/closure/base.js',
    externs: ASSET_PREFIX + 'js/externs/*.js',
    test: 'fatcatmap_tests/js/spec/unit/**/*.spec.js'
  },
  themes: ASSET_PREFIX + 'less/site/home.less',
  templates: 'fatcatmap/templates/source/**/*',
};

// Asset compilation target directories.
outputs = {
  img: ASSET_PREFIX + 'img',
  css: ASSET_PREFIX + 'style',
  js: {
    app: ASSET_PREFIX + 'js/compiled/',
    test: 'fatcatmap_tests/js/spec/compiled/'
  },
  themes: {
    dark: ASSET_PREFIX + 'style/themes/dark/',
    light: ASSET_PREFIX + 'style/themes/light/',
    scaffold: ASSET_PREFIX + 'style/themes/scaffold/'
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

    common: {
      jar: 'lib/closure/build/compiler.jar',
      source_map_format: 'V3',
      summary_detail_level: 3,
      warning_level: 'VERBOSE',
      language_in: 'ECMASCRIPT5',
      closure_entry_point: 'init',
      only_closure_dependencies: true,
      process_closure_primitives: true,
      use_types_for_optimization: null,
      generate_exports: null,
      externs: [
        ASSET_PREFIX + 'js/lib/externs/jasmine/jasmine.js',
        ASSET_PREFIX + 'js/lib/externs/w3c/EventSource.js',
        ASSET_PREFIX + 'js/lib/externs/w3c/pointer-events.js',
        ASSET_PREFIX + 'js/lib/externs/fcm/jsconfig.js',
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
      compilation_level: 'SIMPLE_OPTIMIZATIONS',
      output_wrapper: '(function() {\n%output%\n})();'
    },

    // Pretty compile settings
    pretty: {
      js_output_file: outputs.js.app + 'app.js',
      formatting: 'PRETTY_PRINT',
      compilation_level: 'SIMPLE_OPTIMIZATIONS',
      output_wrapper: '(function() {\n%output%\n})();'
    },

    test: {
      only_closure_dependencies: false,
      externs: [
        
      ]
    }
  },

  // SVG minification
  svgmin: {},

  // Test config
  karma: require('./fatcatmap_tests/js/karma.conf.js')
};

// Compile less source to css
task('less', [
  'less:dark',
  'less:light',
  'less:scaffold'
]);

// Compile dark theme
task('less:dark', function () {
  var opts = merge(config.less.options, config.less.themes.dark),
    cfg = config.sourcemaps;
  cfg.sourceRoot = '/assets/less/site';
  return src(inputs.themes)
    .pipe(sourcemaps.init())
    .pipe(less(opts))
    .pipe(sourcemaps.write(
      path.relative(ASSET_PREFIX + 'less/site/home.css', outputs.sourcemaps + ASSET_PREFIX + 'style/themes/dark/'),
      cfg))
    .pipe(dest(outputs.themes.dark));
});

// Compile light theme
task('less:light', function () {
  var opts = merge(config.less.options, config.less.themes.light),
    cfg = config.sourcemaps;
  cfg.sourceRoot = '/assets/less/site';
  return src(inputs.themes)
    .pipe(sourcemaps.init())
    .pipe(less(opts))
    .pipe(sourcemaps.write(
      path.relative(ASSET_PREFIX + 'less/site/home.css', outputs.sourcemaps + ASSET_PREFIX + 'style/themes/light/'),
      cfg))
    .pipe(dest(outputs.themes.light));
});

// Compile scaffold theme
task('less:scaffold', function () {
  var opts = merge(config.less.options, config.less.themes.scaffold),
    cfg = config.sourcemaps;
  cfg.sourceRoot = '/assets/less/site';
  return src(inputs.themes)
    .pipe(sourcemaps.init())
    .pipe(less(opts))
    .pipe(sourcemaps.write(
      path.relative(ASSET_PREFIX + 'less/site/home.css', outputs.sourcemaps + ASSET_PREFIX + 'style/themes/scaffold/'),
      cfg))
    .pipe(dest(outputs.themes.scaffold));
});

// Compile sass
task('sass', function (cb) {
  src(inputs.sass)
    .pipe(sass(config.sass));
  cb();
});

// Overarching style task
task('style', ['less', 'sass']);

// Clean compiled css files
task('style:clean', function () {
  return src(outputs.css + '/*')
    .pipe(rmrf());
});

// Compile JS with Closure Compiler in production mode
task('closure:min', function () {
  var cfg = config.sourcemaps;
  cfg.sourceRoot = '/assets/js/src';
  return src(inputs.js.app)
    .pipe(sourcemaps.init())
    .pipe(closure(merge(config.closure.common, config.closure.min)))
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
    .pipe(closure(merge(config.closure.common, config.closure.debug)))
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
    .pipe(closure(merge(config.closure.common, config.closure.pretty)))
    .pipe(sourcemaps.write(
      path.relative(ASSET_PREFIX + 'js/src', outputs.sourcemaps + ASSET_PREFIX + 'js/'),
      cfg))
    .pipe(dest(outputs.js.app));
});

// Clean compiled JS files
task('closure:clean', function () {
  return src([outputs.js.app + '/*', ASSET_PREFIX + 'js/*.js'])
    .pipe(rmrf());
});

task('closure', ['closure:min']);
task('closure:all', ['closure:min', 'closure:debug', 'closure:pretty']);

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
task('templates:clean', function () {
  return src(outputs.templates + '/*')
    .pipe(rmrf());
});

// Run dev server
task('serve', function (cb) {
  var killSh = function () {
    if (sh)
      sh.kill();
  },
  sh = spawn('bin/fcm', ['run'], {stdio: 'inherit'})
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
  watch(inputs.less, ['less']);
  watch(inputs.sass, ['sass']);
  watch(inputs.templates, ['templates']);
  // watch(inputs.js.app, ['closure:pretty'])
  cb();
});

// Run JS tests based on environment
task('test', ['test:debug']);

// Run JS tests in dev mode
task('test:debug', ['closure:pretty'], function (cb) {
  var cfg = merge({}, config.karma);
  cfg.files = cfg._debugFiles;
  karma.start(cfg);
  cb();
});

// Run JS tests in release mode
task('test:release', ['closure:min'], function (cb) {
  setTimeout(function () {
    var cfg = merge({}, config.karma);
    cfg.files = cfg._releaseFiles;
    karma.start(cfg);
  }, 1000);
  cb();
});

// Clean JS test output
task('test:clean', function () {
  return src(['.develop/coverage/js/*', '.develop/test-reports/js/*'])
    .pipe(rmrf());
});

// Default task - runs with bare 'gulp'.
task('default', [
  'less',
  'closure:all'
]);

// Develop task
task('dev', [
  'less',
  'sass',
  'templates',
  'closure:pretty',
  'watch',
  'serve'
]);

// Release task
task('release', [
  'less',
  'sass',
  'closure:min',
  'test:release'
]);

// Clean task
task('clean', [
  'style:clean',
  'closure:clean',
  'templates:clean'
], function () {
  return src(outputs.sourcemaps)
    .pipe(rmrf());
});