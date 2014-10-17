// include gulp
var gulp = require('gulp'); 
 
// include plug-ins
// var jshint = require('gulp-jshint');
var concat  = require('gulp-concat');
var uglify  = require('gulp-uglify');
var rename  = require('gulp-rename');
var rimraf  = require('gulp-rimraf');
var shell   = require('gulp-shell');
var newer   = require('gulp-newer');
var through = require('through');
 
var srcDir = '../src/';
var destDir = './';
var yuidocDestDir  = '../docs/api-docs/';
var yuidocThemeDir = '../docs/api-docs-theme/';

var baseFileNames = [ '_head.jsfrag', 'a??_*.js', '_tail.jsfrag'];
var fileNames     = [ '_head.jsfrag', 'a??_*.js', 'b??_*.js', '_tail.jsfrag'];

buildMinify('', fileNames);
buildMinify('.base', baseFileNames);

gulp.task('copyBreezeExtns', function() {
	gulp.src( mapPath(srcDir, [ 'breeze.*.*.js' ]))
      // .pipe(newer(destDir))
      .pipe(gulp.dest(destDir))
});

gulp.task('copyForTests', ['minify'], function() {
	testDir = '../test/breeze'
	gulp.src( mapPath(destDir, [ 'breeze.*']))
      .pipe(gulp.dest(testDir))
});

// gulp.task('copyForNpm', function() {
//    var npmDir = 
// 	  gulp.src(destDir)
// 		.pipe(changed(npmDir))
// 		.pipe(gulp.dest(npmDir));
// }); 

gulp.task('yuidoc-full', ['yuidoc-clean'], function() {
  return gulp.src( mapPath(srcDir, fileNames))
      .pipe(concat('foo'))  // just needed a method that would get n -> 1 would like something smaller.
      .pipe(shell(['yuidoc --themedir ' + yuidocThemeDir + ' --outdir ' + yuidocDestDir + ' ' + srcDir]));    
});

gulp.task('yuidoc-clean', function() {
  return gulp.src(yuidocDestDir, { read: false }) // much faster
    // .pipe(ignore('node_modules/**'))
    .pipe(rimraf( { force: true} ));
});

// for the time being we don't make yuidoc do a clean first - because then we lose the 'newer' effect
// doesn't always work the first time;
gulp.task('yuidoc', function() {
  return gulp.src( mapPath(srcDir, fileNames))
      .pipe(newer(yuidocDestDir + 'data.json'))
      .pipe(concat('foo')) // eat the stream but yield one to trigger yuidoc to run once
      
      /* Clever alternative
      .pipe(through(function(file) {
        // pass first file through (don't care what it is; it's just a trigger)
        this.queue(file);
        // then end this stream by passing null to queue, ignoring all additional files
        this.queue(null);
      }))  
      */
      .pipe(shell(['yuidoc --themedir ' + yuidocThemeDir + ' --outdir ' + yuidocDestDir + ' ' + srcDir]));
});

gulp.task('default', ['minify', 'minify.base', 'copyBreezeExtns', 'copyForTests', 'yuidoc'], function() {

});


function buildMinify(extn, fileNames, destName) {
  var destName = 'breeze' + extn + '.debug.js'
  var minName = 'breeze' + extn + '.min.js'
  gulp.task('minify' + extn, function() {
    gulp.src( mapPath(srcDir, fileNames))
      .pipe(newer(destDir + destName))
      .pipe(concat(destName,  {newLine: ';'}))
      .pipe(gulp.dest(destDir))
      .pipe(uglify())
      .pipe(rename(minName))
      .pipe(gulp.dest(destDir));
  });
}

function mapPath(dir, fileNames) {
  return fileNames.map(function(fileName) {
    return dir + fileName;
  });
};

