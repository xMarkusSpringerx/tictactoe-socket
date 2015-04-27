module.exports = function(grunt){

  'use strict';

  // Force use of Unix newlines
  grunt.util.linefeed = '\n';

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    less: {
      compileCore: {
        options: {
          strictMath: true,
          noColor: true,
          outputSourceFiles: true
        },
        files: {
          'app/css/<%= pkg.name %>.css': 'app/less/bootstrap.less'
        }
      },
      minify: {
        options: {
          cleancss: true,
          report: 'min'
        },
        files: {
          'app/css/<%= pkg.name %>.min.css': 'app/css/<%= pkg.name %>.css'
        }
      }
    },

    watch: {
      less: {
        files: '**/*.less',
        tasks: ['less']
      }
    }
  });

  grunt.registerTask('buildless',  ['less']);
  grunt.registerTask('default', ['buildless']);
};
