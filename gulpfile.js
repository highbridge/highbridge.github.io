var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var concat = require('gulp-concat');
var bundler = watchify(browserify('./scripts/main.js', {debug: true}));

//
// Define Gulp tasks
////////////////////////////////////////

gulp.task('default', ['deps', 'scripts', 'scss']);
gulp.task('deps', deps);
gulp.task('scripts', scripts);
gulp.task('scss', scss);


//
// Gulp task functions
////////////////////////////////////////

// Concatenate dependencies that can't be loaded through browserify
function deps()
{
    var dependencies =
    [
        './scripts/deps/jquery.min.js', // Ensure jQuery is always loaded first
        './scripts/deps/*.js',          // Load everything else
    ];
    
    gulp.src(dependencies)
    .pipe(concat('deps.min.js'))
    .pipe(gulp.dest('./scripts'));
}

// Bundle all scripts that can be loaded through browserify
function scripts()
{
    bundler.bundle()
    // Log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('main.min.js'))
    // Optional, remove if you don't want sourcemaps
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./scripts'));
}

// Compile SCSS into CSS
function scss()
{
    console.log("Compile scss!");
}

//
// Handle other events
////////////////////////////////////////

// Run scripts task again whenever a file update occurs
bundler.on('update', scripts);

// Output build logs
bundler.on('log', gutil.log);
