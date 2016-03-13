module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    concat: {
		options: {
		  separator: ';\n',
		  stripBanners: {
			block: true,
			inline: true
		  }
		},
		dist: {
		  src: ['src/*.js'],
		  dest: 'build/<%= pkg.name %>.js',
		},
	 },
	 comments: {
		your_target: {
		  options: {
			  singleline: true,
			  multiline: true
		  },
		  src: ['build/<%= pkg.name %>.js']
		},
	  },
  });
  
  // Load the plugins
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-stripcomments');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['concat','comments','uglify']);

};
