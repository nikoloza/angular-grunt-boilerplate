module.exports = function(grunt) {
  function injectorJadeTransformJS(filePath) {
    filePath = filePath.replace('../', '');
    return 'script(type="text/javascript", src="app/' + filePath + '")';
  }

  function injectorJadeTransformCSS(filePath) {
    filePath = filePath.replace('../.tmp/', '');
    return 'link(rel="stylesheet", href="' + filePath + '")';
  }


  function injectorJadeTransformSASS(filePath) {
    return '@import "' + filePath + '"';
  }

  function getInjectorOptions(alias, transformer) {
    return {
      relative: true,
      addRootSlash: false,
      transform: transformer,
      starttag: '// injector:' + alias,
      endtag: '// endinjector:' + alias
    };
  }

  var toCamelCase = function(string) {
    return string.toLowerCase().replace(/-(.)/g, function(match, group1) {
      return group1.toUpperCase();
    });
  };

  var upperFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    app: {
      root: 'app',
      deploy: 'public',
      temp: '.tmp',
      tests: 'test',
      res: 'res'
    },

    ngAnnotate: {
      options: {
        singleQuotes: true,
      },
      deploy: {
        files: {
          '<%= app.deploy %>/app.js': '<%= app.root %>/**/*.js'
        },
      },
      temp: {
        files: {
          '<%= app.temp %>/app.js': '<%= app.root %>/**/*.js'
        },
      },
    },

    // take all the js files and minify them
    uglify: {
      options: {
        // compress: true
      },

      app: {
        files: {
          '<%= app.deploy %>/app.min.js': '<%= app.root %>/**/*.js'
        }
      },

      all: {
        files: {
          '<%= app.deploy %>/all.min.js': [
            '<%= app.deploy %>/lib.js',
            '<%= app.deploy %>/templates.js',
            '<%= app.deploy %>/app.js'
          ]
        }
      }
    },

    jshint: {
      all: {
        src: '<%= app.root %>/**/*.js'
      },

      options: {
        'jshintrc': true
      }
    },

    jade: {
      deploy: {
        options: {
          pretty: true,
          data: {
            debug: true,
          }
        },
        files: {
          '<%= app.deploy %>/index.html': '<%= app.root %>/index.jade'
        }
      },

      temp: {
        options: {
          pretty: true,
          data: {
            debug: true,
          }
        },

        files: {
          '<%= app.temp %>/index.html': '<%= app.root %>/index.jade'
        }
      },

      translate: {
        files: [{
          expand: true,
          cwd: '<%= app.root %>',
          src: [
            '**/*.jade'
          ],
          dest: '<%= app.res %>/<%= app.temp %>',
          ext: '.html'
        }]
      }
    },

    // make html ready for production
    processhtml: {
      dist: {
        files: {
          '<%= app.deploy %>/index.html': '<%= app.deploy %>/index.html'
        }
      }
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: '<%= app.deploy %>',
          src: '**/*.html',
          dest: '<%= app.deploy %>'
        }]
      }
    },

    html2js: {
      options: {
        jade: {
          doctype: 'html'
        },
        base: '',
        module: 'ngTemplates',
        singleModule: true,
        quoteChar: '\'',
        rename: function(moduleName) {
          return moduleName.replace('app/', '');
        }
      },
      deploy: {
        files: {
          '<%= app.deploy %>/templates.js': '<%= app.root %>/**/*.jade'
        }
      },
      temp: {
        files: {
          '<%= app.temp %>/templates.js': '<%= app.root %>/**/*.jade'
        }
      }
    },

    sass: {
      options: {
        noCache: true
      },
      deploy: {
        files: [{
          src: ['<%= app.root %>/assets/sass/app.sass'],
          dest: '<%= app.deploy %>/app.css'
        }]
      },
      temp: {
        files: [{
          src: ['<%= app.root %>/assets/sass/app.sass'],
          dest: '<%= app.temp %>/app.css'
        }]
      }
    },

    cssmin: {
      deploy: {
        files: [{
          expand: true,
          cwd: '<%= app.deploy %>',
          src: ['*.css'],
          dest: '<%= app.deploy %>',
          ext: '.min.css'
        }]
      },
      all: {
        files: {
          '<%= app.deploy %>/all.min.css': [
            '<%= app.deploy %>/lib.css',
            '<%= app.deploy %>/app.css'
          ]
        }
      }
    },

    clean: {
      deploy: {
        src: '<%= app.deploy %>'
      },
      build: {
        src: [
          '<%= app.deploy %>/*.{css,js,map}',
          '!<%= app.deploy %>/all.min.*',
        ]
      },
      temp: {
        src: '<%= app.temp %>'
      }
    },

    copy: {
      assets_deploy: {
        expand: true,
        cwd: '<%= app.root %>/assets',
        src: '**/*',
        dest: '<%= app.deploy %>/assets',
      },
      assets_temp: {
        expand: true,
        cwd: '<%= app.root %>/assets',
        src: '**/*',
        dest: '<%= app.temp %>/assets',
      }
    },

    bower: {
      install: {
        options: {
          targetDir: 'bower_components',
          cleanTargetDir: true,
          verbose: true,

          layout: 'byComponent',

          bowerOptions: {
            forceLatest: true,
            production: true
          }
        }
      }
    },

    bower_concat: {
      all: {
        dest: '<%= app.deploy %>/lib.js',
        cssDest: '<%= app.deploy %>/lib.css',
        dependencies: {
          'angular': 'jquery'
        },
        exclude: [
          /bootstrap.css/,
          // 'bootstrap-sass/assets/javascript'
        ],
        bowerOptions: {
          relative: false
        }
      }
    },

    injector: {
      sass: {
        options: getInjectorOptions('sass', injectorJadeTransformSASS),

        files: {
          '<%= app.root %>/assets/sass/app.sass': [
            '<%= app.root %>/assets/sass/*/**/*.sass',
            '<%= app.root %>/{common,partials,routes}/**/*.sass'
          ]
        }
      },

      css: {
        options: getInjectorOptions('css', injectorJadeTransformCSS),

        files: {
          '<%= app.root %>/index.jade': [
            // 'libraries/**/*.min.css',
            // 'libraries/angular/**/*.css',
            '<%= app.temp %>/app.css'
          ]
        }
      },

      app: {
        options: getInjectorOptions('app', injectorJadeTransformJS),

        files: {
          '<%= app.root %>/index.jade': [
            '<%= app.root %>/**/*.js'
          ]
        }
      }
    },

    wiredep: {
      target: {
        src: '<%= app.root %>/index.jade', // point to your HTML file.
        ignorePath: '../',
        exclude: [
          /bootstrap.css/,
          // 'bootstrap-sass/assets/javascript'
        ]
      }
    },

    // WATCH
    watch: {
      jade: {
        files: '<%= app.root %>/**/*.jade',
        tasks: ['newer:jade:temp', 'html2js:temp']
      },
      sass: {
        files: '<%= app.root %>/**/*.sass',
        tasks: ['injector:sass', 'injector:css', 'sass:temp']
      },
      js: {
        files: '<%= app.root %>/**/*.js',
        tasks: ['newer:jshint', 'injector:app'],
        options: {
          livereload: true
        }
      },
      reload: {
        files: '<%= app.temp %>/*',
        tasks: [],
        options: {
          livereload: true
        }
      }
    },

    // watch our node server for changes
    nodemon: {
      dev: {
        script: 'server.js',
        hostname: 'localhost',
        livereload: false
      }
    },

    // run watch and nodemon at the same time
    concurrent: {
      server: {
        options: {
          logConcurrentOutput: true
        },
        tasks: ['nodemon', 'watch']
      }
    },

    // open website after build
    open: {
      dev: {
        path: 'http://easymoney.ge'
      }
    },

    nggettext_extract: {
      pot: {
        files: {
          '<%= app.res %>/template.pot': ['<%= app.res %>/<%= app.temp %>/**/*.html']
        }
      }
    },

    nggettext_compile: {
      all: {
        files: {
          '<%= app.temp %>/translations.js': ['<%= app.res %>/*.po']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-angular-gettext');

  grunt.registerTask('extract-strings', [
    'jade:translate',
    'nggettext_extract'
  ]);

  grunt.registerTask('compile-strings', [
    'nggettext_compile'
  ]);

  // one time project compile
  // $ grunt
  grunt.registerTask('inject', ['injector', 'bower', 'wiredep']);

  // one time project compile
  // $ grunt
  grunt.registerTask('default', function() {
    var tasks = [
      'clean',

      'wiredep',

      'jshint'
    ];

    grunt.task.run(tasks);
  });

  // help server to make temp files
  grunt.registerTask('temp', function() {
    var tasks = [
      'sass:temp',
      'injector',

      'jade:temp',
      'html2js:temp',
      'compile-strings'
    ];

    grunt.task.run(tasks);
  });

  // run and watch server
  // $ grunt serve
  // runs from /temp folder
  grunt.registerTask('serve', function() {
    var tasks = [
      'default',

      'temp',

      'open',
      'concurrent'
    ];

    grunt.task.run(tasks);
  });

  // make solution ready for production
  // $ grunt deploy
  // builds in /public folder
  grunt.registerTask('deploy', function() {
    var tasks = [
      'default',

      'bower_concat',
      'ngAnnotate:deploy',

      'jade:deploy',
      'processhtml',

      'copy:assets_deploy',

      'html2js:deploy',
      'uglify:all',

      'sass:deploy',
      'cssmin:all',
      'htmlmin',

      'clean:build'
    ];

    grunt.task.run(tasks);
  });

  // initialize new app
  function createApp(name) {
    if (!name) name = 'ngApp';

    if (grunt.file.exists(grunt.config.data.app.root))
      return grunt.fail.fatal('App is already created'.red);

    // create directory structure
    console.log('Creating app directory structure...'.yellow);
    grunt.file.mkdir(grunt.config.data.app.root);
    grunt.file.mkdir(grunt.config.data.app.root + '/routes');
    grunt.file.mkdir(grunt.config.data.app.root + '/assets');
    grunt.file.mkdir(grunt.config.data.app.root + '/assets/img');
    grunt.file.mkdir(grunt.config.data.app.root + '/assets/sass');
    grunt.file.mkdir(grunt.config.data.app.root + '/assets/fonts');
    grunt.file.mkdir(grunt.config.data.app.root + '/assets/icons');
    grunt.file.mkdir(grunt.config.data.app.root + '/common');
    grunt.file.mkdir(grunt.config.data.app.root + '/partials');
    grunt.file.mkdir(grunt.config.data.app.tests);
    console.log('Directory structure has been created'.green);


    // create app files
    console.log('Creating app files'.yellow);

    // index.jade file
    grunt.file.write(grunt.config.data.app.root + '/index.jade', 'html(ng-app="' + name + '")\r\n\thead\r\n\t\ttitle ' + name + '\r\n\t\tbase(href="/")\r\n\r\n\t\t// build:css all.min.css\r\n\t\t// bower:css\r\n\t\t// endbower\r\n\r\n\t\t// injector:css\r\n\t\t// endinjector:css\r\n\t\t// /build\r\n\r\n\tbody\r\n\t\tdiv(ui-view="")\r\n\r\n\t\t// build:js all.min.js\r\n\t\t// bower:js\r\n\t\t// endbower\r\n\r\n\t\tscript(type="text/javascript", src="templates.js")\r\n\r\n\t\t// injector:app\r\n\t\t// endinjector:app\r\n\t\t// /build');


    // app.js file
    var dependencies = [
      'ngTemplates',
      'ngCookies',
      'ngResource',
      'ngAnimate',
      'ui.router',
      'ui.utils',
      'ui.bootstrap'
    ];
    grunt.file.write(grunt.config.data.app.root + '/app.js', '// main app configuration\nvar app = angular.module(\'' + name + '\', [\r\n\t\'' + dependencies.join('\',\r\n  \'') + '\'\r\n]).config(function ($urlRouterProvider, $locationProvider) {\r\n  $urlRouterProvider.otherwise(\'/\');\r\n  $locationProvider.html5Mode(true);\r\n}).run(function ($rootScope) {\r\n\r\n});');

    // config
    grunt.file.write(grunt.config.data.app.root + '/config.js', '// config\napp.constant(\'Config\', {\r\n\r\n});');


    // app.sass file
    grunt.file.write(grunt.config.data.app.root + '/assets/sass/app.sass', '// injector:sass\n// endinjector:sass');
    console.log('App files has been created'.green);

    // create default route
    create('route', 'index');

    // inject bower components
    grunt.task.run(['bower', 'wiredep']);
  }

  // get parent folder
  function getParentFolder(type) {
    if (type === 'route' || type === 'partial')
      return type + 's';
    else return 'common/';
  }

  // get file path
  function getPath(type, route) {
    return grunt.config.data.app.root + '/' + getParentFolder(type) + '/' + route;
  }

  // get file path
  function getSassPath(type, route) {
    return grunt.config.data.app.root + '/assets/sass/' + getParentFolder(type) + '/' + route;
  }

  // get file test path
  function getTestPath(type, route) {
    return grunt.config.data.app.tests + '/' + getParentFolder(type) + '/' + route;
  }

  // get file view path
  function getViewPath(type, route) {
    return getParentFolder(type) + '/' + route;
  }

  // create new instance
  function create(type, route) {
    // app name must be camelCase and must contain letters and numbers only
    if (type === 'app') return createApp(route.replace(/[^a-zA-Z0-9 _]/g, ''));

    // if developer misses type or name
    if (!type) return grunt.fail.fatal('Type of new instance is required');
    else if (!route) return grunt.fail.fatal('Name for new ' + type + ' is required');

    // define folder path for new instance
    var path = getPath(type, route);
    var sassPath = getSassPath(type, route);
    var testPath = getTestPath(type, route);
    var viewPath = getViewPath(type, route);

    // if it's already exists
    if (grunt.file.exists(path))
      return grunt.fail.fatal('"' + route + '" ' + type + ' already exists');

    // if everything is ok
    console.log(('Creating new ' + route + ' ' + type).green, (path).grey);


    // ------- create files ------- //
    // define filename
    var exts, name = route.split('/').pop();

    // creating recommended files
    if (type === 'route') exts = ['controller.js', 'jade', 'state.js', 'sass'];
    else if (type === 'directive') exts = ['directive.js', 'controller.js', 'jade'];
    else if (type === 'service') exts = ['service.js'];
    else if (type === 'factory') exts = ['factory.js'];
    else if (type === 'filter') exts = ['filter.js'];
    else if (type === 'partial') exts = ['controller.js', 'jade', 'sass'];
    else if (type === 'config') exts = ['conf.js'];

    // create instance files
    exts.forEach(function(ext) {
      grunt.file.write(path + '/' + name + '.' + ext, getFileTemplate(name, ext, route, type, viewPath));
    });

    // create test file
    grunt.file.write(testPath + '/' + name + '.spec.js', getFileTemplate(name, 'spec.js', route, type));
  }

  // generate new templates depend on extension
  function getFileTemplate(name, ext, route, type, viewPath) {
    // controllers
    if (ext === 'controller.js')
      return 'app.controller(\'' + upperFirstLetter(name) + 'Ctrl\', function(){\n  \n});';

    // views
    else if (ext === 'jade')
      return 'h3 I am ' + name;

    // states
    else if (ext === 'state.js')
      return 'app.config(function ($stateProvider) {\n  $stateProvider.state(\'' + route.replace(/\//g, '.') + '\', {\n    url: \'/' + (route === 'index' ? '' : name) + '\',\n    controller: \'' + upperFirstLetter(name) + 'Ctrl\',\n    templateUrl: \'' + viewPath + '/' + name + '.jade\'\n  });\n});';

    // stylesheets
    else if (ext === 'sass')
      return '.' + name;

    // directives
    else if (ext === 'directive.js')
      return 'app.directive(\'' + name + '\', function(){\n  // Runs during compile\n  return {\n    controller: \'' + upperFirstLetter(name) + 'Ctrl\',\n    restrict: \'A\', // E = Element, A = Attribute, C = Class, M = Comment\n    templateUrl: \'' + viewPath + name + '.jade\',\n    link: function(scope, element, attrs, controller) {\n\n    }\n  };\n});';

    // services
    else if (ext === 'service.js')
      return 'app.service(\'' + upperFirstLetter(name) + '\', function(){\n  \n});';

    // services
    else if (ext === 'factory.js')
      return 'app.factory(\'' + upperFirstLetter(name) + '\', function(){\n  \n});';

    // filters
    else if (ext === 'filter.js')
      return 'app.filter(\'' + name + 'Filter\', function(){\n  \n});';

    // configs
    else if (ext === 'config.js')
      return '// ' + name + 'dependent constants\napp.constant(\'' + upperFirstLetter(name) + '\', {\n  \n})\n\n// config\n.config(function(){\n  \n});';

    // tests
    else if (ext === 'spec.js')
      return 'describe(\'' + route + ' ' + type + '\', function(){\n  \n});';
  }

  /*
  Generate instance
  You can use these commands to make it crazy
  $ grunt create:<instance>:<route>

    For example
    $ grunt create:route:about
    $ grunt create:directive:avatar
    $ grunt create:service:auth
    $ grunt create:filter:path
    $ grunt create:config:network
    $ grunt create:partial:header
  */
  grunt.registerTask('create', function(type, route) {
    create(type, route);

    //inject library dependencies
    grunt.task.run('injector');

    console.log((route + ' ' + type + ' successfully created').green, (getPath(type, route)).grey);
  });

  /*
  Remove generated instance
  Working same as $ grunt create
  $ grunt delete:<instance>:<route>
  */
  grunt.registerTask('remove', function(type, route) {
    if (!type) return grunt.fail.fatal('Type of instance is required');
    else if (!route) return grunt.fail.fatal('Name for ' + type + ' is required');

    // if it's already exists
    if (!grunt.file.exists(getPath(type, route)))
      return grunt.fail.fatal('"' + route + '" ' + type + ' does not exist');

    grunt.file.delete(getPath(type, route));
    grunt.file.delete(getTestPath(type, route));

    //inject library dependencies
    grunt.task.run('injector');

    console.log((route + ' ' + type + ' successfully removed').green, (getPath(type, route)).grey);
  });
};
