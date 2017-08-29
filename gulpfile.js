var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var del = require('del');

//this is for minifying all the html templates into one
var minifyHtml = require('gulp-minify-html');
var angularTemplatecache = require('gulp-angular-templatecache');

//this is for updating the source tags in index.html between build tags
var useref = require('gulp-useref');

//this is for annotating, concatinating and uglifying angular controllers, directives and other javascript based code blocks
var ngAnnotate = require('gulp-ng-annotate');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

//this is for local http server to launch the app
//var connect = require('gulp-connect');
var browserSync = require('browser-sync').create();

//this is for sass plugin
var sass = require('gulp-sass');

//this is for beautify plugin
var prettify = require('gulp-jsbeautifier');

//this is for jasmine/karma plugin
var Server = require('karma').Server;

var config = {
	js: 'app/modules/**/*.js',
  	images: 'app/assets/images/*.*',
  	fonts: 'app/assets/fonts/*.*',
	html: 'app/modules/**/*.html',
	temp: 'temp/'
}

var dist = {
	path: 'dist/',
	images: 'app/assets/images/',
	fonts: 'app/assets/fonts/',
	styles: 'app/assets/styles/',
	js: 'app/js/'
}

// this task is for copying the images to dist folder
gulp.task('copy-images', ['clean-images'], function(){
  return gulp.src([config.images])
    .pipe(gulp.dest(dist.path + dist.images));
});

// this task is for copying the fonts to dist folder
gulp.task('copy-fonts', ['clean-fonts'], function(){
  return gulp.src([config.fonts])
    .pipe(gulp.dest(dist.path + dist.fonts));
});

// this task is for linting the code
gulp.task('vet', function(){
  return gulp.src([
    config.js
  ])
  .pipe(jshint())
  .pipe(jscs())
  .pipe(jshint.reporter('jshint-stylish'), {verbose: true})
  .pipe(jshint.reporter('fail'));
});


// this task is for merging all the templates in app into one to reduce the HTTP calls
gulp.task('templatecache', function() {
  return gulp.src(config.html)
    .pipe(minifyHtml({empty: true}))
    .pipe(angularTemplatecache(
      'templates.js', {
        module: 'todomvc',
        standAlone: false,
        root: 'app/modules/'
      }
    ))
    .pipe(gulp.dest(config.temp));
});

// this task is for making the build links in index.html updated to build ones
gulp.task('useref', ['vet', 'clean-js', 'clean-styles'], function(){
  //var assets = useref.assets();

  return gulp.src('index.html')
  .pipe(useref())
  .pipe(gulp.dest('dist'));
});

// this task is for making the build to use minified js
gulp.task('minifyjs', ['useref', 'templatecache'], function(){
  return gulp.src(['dist/app/js/scripts.js', 'temp/templates.js'])
    .pipe(concat('scripts.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(gulp.dest('dist/app/js/'));
});

// this task is for making css out of SCSS files
gulp.task('sass', function(){
  return gulp.src('app/assets/scss/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('app/assets/styles'))
	.pipe(browserSync.reload({
      stream: true
    }))
});


/*gulp.task('serve', function() {
    connect.server({
        livereload: true
    });
});*/

gulp.task('serve', function() {
  browserSync.init({
		port: 5423,
    server: {
      baseDir: './'
    },
  })
})


gulp.task('servedist', function() {
  browserSync.init({
		port: 5423,
    server: {
      baseDir: './dist/'
    },
  })
})



gulp.task('pretty', ['prettyappjs'], function() {
	  gulp.src(['app/modules/**/*.js'])
	    .pipe(prettify())
	    .pipe(gulp.dest('./app/modules'));
});

gulp.task('prettyappjs', function() {
	  gulp.src(['app/app.js'])
	    .pipe(prettify())
	    .pipe(gulp.dest('./app'));
});

gulp.task('karma', function (done) {
	  new Server({
	    configFile: __dirname + '/karma.conf.js',
	    singleRun: true
	  }, done).start();
	});


//Helper Tasks
gulp.task('clean-images', function(){
  del(dist.path + dist.images);
});

gulp.task('clean-fonts', function(){
  del(dist.path + dist.fonts)
});

gulp.task('clean-js', function(){
  del(dist.path + dist.js)
});

gulp.task('clean-styles', function(){
  del(dist.path + dist.css);
  del(dist.path + dist.styles);
});



gulp.task('watch', ['serve', 'sass'], function (){
  gulp.watch('app/assets/scss/**/*.scss', ['sass']);
  gulp.watch('./*.html', browserSync.reload);
  gulp.watch('app/modules/**/*.html', browserSync.reload);
  gulp.watch('app/modules/**/*.js', browserSync.reload);
  // Other watchers
});


//Build Tasks
gulp.task('build', ['vet', 'sass', 'copy-images', 'copy-fonts', 'templatecache' , 'useref' , 'minifyjs']);
