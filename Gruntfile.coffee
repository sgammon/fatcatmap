
_ = require('underscore')

module.exports = (grunt) ->

  ## ~~ load plugins ~~ ##
  grunt.loadNpmTasks 'grunt-webp'
  grunt.loadNpmTasks 'grunt-shell'
  grunt.loadNpmTasks 'grunt-svgmin'
  grunt.loadNpmTasks 'grunt-contrib-less'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-imagemin'
  grunt.loadNpmTasks 'grunt-closure-compiler'

  ## ~~ stylesheets ~~ ##
  stylemap = {
    # - top-level stylesheets - #
    "fatcatmap/assets/style/common.css": "fatcatmap/assets/less/core/common.less"
  }

  # - themed stylesheets - #
  themes =
    scaffold:
      files: {}
      options:
        modifyVars:
          theme: 'scaffold'
    dark:
      files: {}
      options:
        modifyVars:
          theme: 'scaffold'
    light:
      files: {}
      options:
        modifyVars:
          theme: 'scaffold'

  less_options =
    compress: true
    cleancss: true
    ieCompat: false
    report: 'min'
    optimization: 2
    paths: ["fatcatmap/assets/less", "fatcatmap/assets/bootstrap"]
    sourceMap: true
    sourceMapBasepath: ".develop/maps"

  for name in ['home']
    for theme in ['scaffold', 'dark', 'light']
      themes[theme].files["fatcatmap/assets/style/themes/fcm-" + theme + "/" + name + ".css"] = "fatcatmap/assets/less/site/" + name + ".less"

  ## ~~ configure stuffs ~~ ##
  grunt.initConfig

    pkg: grunt.file.readJSON('package.json')

    # - Images - #
    imagemin:
      optimizationLevel: 7
      progressive: true
      interlaced: true
      pngquant: true
      files: [
        expand: true
        src: ['**/*.{png,jpg,gif}']
        cwd: 'fatcatmap/assets/img/'
        dest: 'fatcatmap/assets/img/'
      ]

    # - LESS - #
    less:
      base:
        files: stylemap
        options: less_options

      dark:
        files: themes.dark.files
        options: _.extend less_options, themes.dark.options

      light:
        files: themes.light.files
        options: _.extend less_options, themes.dark.light

      scaffold:
        files: themes.scaffold.files
        options: _.extend less_options, themes.scaffold.options

    # - CoffeeScript - #
    coffee:

      # `common.js`
      common:
        files:
          'fatcatmap/assets/js/common.js': ['fatcatmap/assets/coffee/common/*.coffee']
        options:
          sourceMap: true
          sourceMapDir: '.develop/maps/fatcatmap/assets/coffee'

      # `home.js`
      home:
        files:
          'fatcatmap/assets/js/site/home.js': ['fatcatmap/assets/coffee/home/*.coffee']
        options:
          sourceMap: true
          sourceMapDir: '.develop/maps/fatcatmap/assets/coffee/site'

    # - Closure Compiler - #
    'closure-compiler':

      # `common.min.js`
      common:
        closurePath: "lib/closure"
        jsOutputFile: "fatcatmap/assets/js/common.min.js"
        js: "fatcatmap/assets/js/common.js"
        options:
          debug: false
          summary_detail_level: 3
          use_types_for_optimization: undefined
          language_in: 'ECMASCRIPT5'
          compilation_level: 'SIMPLE_OPTIMIZATIONS'
          define: [
            '"DEBUG=false"'
          ]

      # DEBUG: `common.min.js`
      common_debug:
        closurePath: "lib/closure"
        jsOutputFile: "fatcatmap/assets/js/common.min.js"
        js: "fatcatmap/assets/js/common.js"
        options:
          debug: true
          summary_detail_level: 3
          language_in: 'ECMASCRIPT5'
          compilation_level: 'SIMPLE_OPTIMIZATIONS'
          create_source_map: ".develop/maps/fatcatmap/assets/js/common.min.js.map"
          define: [
            '"DEBUG=true"'
          ]

      # `home.min.js`
      home:
        closurePath: "lib/closure"
        jsOutputFile: "fatcatmap/assets/js/site/home.min.js"
        js: [
          "fatcatmap/assets/js/common.js",
          "fatcatmap/assets/js/site/home.js"
        ]
        options:
          debug: false
          summary_detail_level: 3
          use_types_for_optimization: undefined
          language_in: 'ECMASCRIPT5'
          compilation_level: 'SIMPLE_OPTIMIZATIONS'
          define: [
            '"DEBUG=false"'
          ]

      # DEBUG: `home.min.js`
      home_debug:
        closurePath: "lib/closure"
        jsOutputFile: "fatcatmap/assets/js/site/home.min.js"
        js: [
          "fatcatmap/assets/js/common.js",
          "fatcatmap/assets/js/site/home.js"
        ]
        options:
          debug: true
          summary_detail_level: 3
          language_in: 'ECMASCRIPT5'
          compilation_level: 'SIMPLE_OPTIMIZATIONS'
          create_source_map: ".develop/maps/fatcatmap/assets/js/site/home.min.js.map"
          define: [
            '"DEBUG=true"'
          ]

    'svgmin': {}

    'shell':
      runServer:
        command: "bin/fcm run"

      buildTemplates:
        command: "bin/fcm build --templates"

      cleanTemplates:
        command: "bin/fcm clean --templates"

  ## ~~ register tasks: `default` ~~ ##
  grunt.registerTask 'default', [
    'less',
    'coffee',
    'closure-compiler:common_debug',
    'closure-compiler:home_debug'
  ]

  ## ~~ register tasks: `develop` ~~ ##
  grunt.registerTask 'develop', [
    'less',
    'coffee',
    'closure-compiler:common_debug',
    'closure-compiler:home_debug',
    'watch',
    'shell:runServer'
  ]

  ## ~~ register tasks: `release` ~~ ##
  grunt.registerTask 'release', [
    'less',
    'coffee',
    'closure-compiler:common',
    'closure-compiler:home'
  ]
