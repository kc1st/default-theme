module.exports = function(grunt) {
  var apiVersion = "v201";
  
  function getManifestParameters(isForTesting) {
    // In production, the manifest must have "NETWORK: *" (allow anything to be fetched)
    // because, e.g., avatars are stored in many domains/URLs (facebook, etc).
    // However, in testing, it's better not to have "NETWORK: *" so we can test our appcache
    // (and make sure we didn't forget to include some JS/CSS/IMGs/etc).
    return {
        options: {
          basePath: '.',
          cache: [
            'http://ajax.googleapis.com/ajax/libs/angularjs/1.5.3/angular.min.js',
            'http://ajax.googleapis.com/ajax/libs/angularjs/1.5.3/angular-route.min.js',
            'http://www.multiplayer-gaming.com/api/loader.min.js?app=v201',
            'css/app.min.css',
            'imgs/animatedEllipse.gif',
            // For material design
            'http://fonts.googleapis.com/css?family=Roboto:400,500,700,400italic',
            'http://ajax.googleapis.com/ajax/libs/angular_material/1.1.0-rc2/angular-material.min.css',
            'http://ajax.googleapis.com/ajax/libs/angularjs/1.5.3/angular-animate.min.js',
            'http://ajax.googleapis.com/ajax/libs/angularjs/1.5.3/angular-aria.min.js',
            'http://ajax.googleapis.com/ajax/libs/angular_material/1.1.0-rc2/angular-material.min.js',
          ],
          network: !isForTesting ? ['*'] : 
            ['http://www.multiplayer-gaming.com/api/app.' + apiVersion + '.min.js',
             'js/everything.min.js'],
          timestamp: true,
          process: !isForTesting ? null : function(path) {
            var r = path.substring('app/'.length);
            console.log(r);
            return r;
          },
        },
        dest: 'app/index.appcache',
        src: isForTesting ? ['app/imgs/*.*'] : [],
      };
  }
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ts: {
      default: {
        options: {
          fast: 'never' // disable the grunt-ts fast feature
        },
        tsconfig: true
      }
    },
    postcss: {
      options: {
        map: {
          inline: false, // save all sourcemaps as separate files...
        },
        processors: [
          require('autoprefixer')(), // add vendor prefixes
          require('cssnano')() // minify the result
        ]
      },
      app: {
        src: 'app/css/app.css',
        dest: 'app/css/app.min.css',
      },
      gamedeveloper: {
        src: 'gamedeveloper/css/gameDeveloper.css',
        dest: 'gamedeveloper/css/gameDeveloper.min.css',
      },
      gameinvite: {
        src: 'gameinvite/css/index.css',
        dest: 'gameinvite/css/index.min.css',
      },
    },
    manifest: {
      forTesting: getManifestParameters(true),
      forProduction: getManifestParameters(false), 
    },
    'http-server': {
        'dev': {
            // the server root directory
            root: '.',
            port: 9000,
            host: "0.0.0.0",
            cache: 1,
            showDir : true,
            autoIndex: true,
            // server default file extension
            ext: "html",
            // run in parallel with other tasks
            runInBackground: true
        }
    },
    protractor: {
      options: {
        configFile: "protractor.conf.js", // Default config file
        keepAlive: false, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
          // Arguments passed to the command
        }
      },
      all: {}
    },
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', [
      'ts',
      'postcss',
    //   'manifest:forTesting',
    //   'http-server', 'protractor',
      'manifest:forProduction']);
  grunt.registerTask('skipProtractor', ['ts',
      'postcss',
      'manifest:forProduction']);

};
