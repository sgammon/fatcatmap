
_ = require('underscore')

module.exports = (grunt) ->

  ## ~~ load plugins ~~ ##
  grunt.loadNpmTasks 'grunt-webp'
  grunt.loadNpmTasks 'grunt-shell'
  grunt.loadNpmTasks 'grunt-svgmin'
  grunt.loadNpmTasks 'grunt-contrib-less'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-imagemin'
  grunt.loadNpmTasks 'grunt-closure-compiler'

  ## ~~ stylesheets ~~ ##
  stylemap = {
    # - top-level stylesheets - #
    #"fatcatmap/assets/style/common.css": "fatcatmap/assets/less/core/common.less"
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
          theme: 'dark'
    light:
      files: {}
      options:
        modifyVars:
          theme: 'light'

  less_options =
    compress: false
    cleancss: false
    ieCompat: false
    report: 'min'
    optimization: 2
    paths: ["fatcatmap/assets/less", "fatcatmap/assets/bootstrap"]
    sourceMap: true
    sourceMapBasepath: ".develop/maps"
    sourceMapRootpath: "/.develop/maps/"

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
          'fatcatmap/assets/js/common.js': [
            'fatcatmap/assets/coffee/common/_base.coffee',
            'fatcatmap/assets/coffee/common/_d3.coffee',
            'fatcatmap/assets/coffee/common/receive.coffee',
            'fatcatmap/assets/coffee/common/context.coffee',
            'fatcatmap/assets/coffee/common/onload.coffee'
          ]
        options:
          bare: true
          sourceMap: true
          sourceMapDir: '.develop/maps/fatcatmap/assets/coffee/'

      # `mapper.js`
      mapper:
        files:
          'fatcatmap/assets/js/mapper.js': ['fatcatmap/assets/coffee/mapper.coffee']
        options:
          bare: true
          sourceMap: true
          sourceMapDir: '.develop/maps/fatcatmap/assets/coffee/'

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

      # `mapper.min.js`
      mapper:
        closurePath: "lib/closure"
        jsOutputFile: "fatcatmap/assets/js/mapper.min.js"
        js: [
          "fatcatmap/assets/js/common.js",
          "fatcatmap/assets/js/mapper.js"
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

      # DEBUG: `mapper.min.js`
      mapper_debug:
        closurePath: "lib/closure"
        jsOutputFile: "fatcatmap/assets/js/mapper.min.js"
        js: [
          "fatcatmap/assets/js/common.js",
          "fatcatmap/assets/js/mapper.js"
        ]
        options:
          debug: true
          summary_detail_level: 3
          language_in: 'ECMASCRIPT5'
          compilation_level: 'SIMPLE_OPTIMIZATIONS'
          create_source_map: ".develop/maps/fatcatmap/assets/js/mapper.min.js.map"
          define: [
            '"DEBUG=true"'
          ]

    watch:
      less:
        files: ['fatcatmap/assets/less/**/*.less']
        tasks: ['less']
        options:
          spawn: false
          interrupt: true

      coffee:
        files: ['fatcatmap/assets/coffee/**/*.coffee']
        tasks: ['coffee']
        options:
          spawn: false
          interrupt: true

      templates:
        files: ['fatcatmap/templates/source/**/*']
        tasks: ['shell:buildTemplates']
        options:
          spawn: false
          interrupt: true

    svgmin: {}

    shell:
      runServer:
        command: "bin/fcm run"

      buildTemplates:
        command: "bin/fcm build --templates"

      cleanTemplates:
        command: "rm -fr fatcatmap/templates/compiled/*"

  ## ~~ register tasks: `default` ~~ ##
  grunt.registerTask 'default', [
    'less',
    'coffee',
    'closure-compiler:common_debug',
    'closure-compiler:mapper_debug'
  ]

  ## ~~ register tasks: `develop` ~~ ##
  grunt.registerTask 'develop', [
    'less',
    'coffee',
    'closure-compiler:common_debug',
    'closure-compiler:mapper_debug',
    'watch',
    'shell:runServer'
  ]

  ## ~~ register tasks: `release` ~~ ##
  grunt.registerTask 'release', [
    'less',
    'coffee',
    'shell:cleanTemplates',
    'shell:buildTemplates',
    'closure-compiler:common',
    'closure-compiler:mapper'
  ]
