// Sass configuration
var gulp = require('gulp'),
    php = require('gulp-connect-php'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    streamqueue = require('streamqueue'),
    vinyl = require('vinyl-source-stream'),
    babelify = require('babelify'),
    watchify = require('watchify'),
    exorcist = require('exorcist'),
    browserify = require('browserify');

var paths = {
    php: [
        'public/**/*.php',
        'src/php/**/*.php',
    ],
    buildFolder: 'public/app',
    sass: 'src/scss/**/*.scss',
    js: 'src/js/app.js',
    twig: 'templates/**/*.twig'
};

// Watchify args contains necessary cache options to achieve fast incremental bundles.
// See watchify readme for details. Adding debug true for source-map generation.
watchify.args.debug = true;
// Input file.
var bundler = watchify(browserify(paths.js, watchify.args));

// Babel transform
bundler.transform(babelify.configure({
    sourceMapRelative: paths.buildFolder + '/js'
}));

// On updates recompile
bundler.on('update', bundle);

function bundle() {


    return bundler.bundle()
        .on('error', function (err) {
            browserSync.notify("Browserify Error!");
            this.emit("end");
        })
        .pipe(exorcist(paths.buildFolder + '/js/app.js.map'))
        .pipe(vinyl('app.js'))
        .pipe(gulp.dest(paths.buildFolder + '/js'))
        .pipe(browserSync.stream({ once: true }));
}


// Init Server
gulp.task('serve', function () {
    php.server({
        port: 8383,
        base: "./public/"
    }, function () {
        browserSync({
            proxy: '127.0.0.1:8383'
        })
    })
});

// Setup Watcher
gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']).on('change', browserSync.stream);
    //gulp.watch(paths.js, ['js']).on('change', browserSync.reload);
    gulp.watch(paths.php).on('change', browserSync.reload);
    gulp.watch(paths.twig).on('change', browserSync.reload);
});

// Browserify bundler
gulp.task('bundle', function () {
    return bundle();
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function () {
    return gulp.src(paths.sass)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write())
        .pipe(autoprefixer())
        .pipe(gulp.dest(paths.buildFolder + '/css/'));
});

// Default launch server, compile sass and js, and watch for changes
gulp.task('default', ['serve', 'sass', 'bundle', 'watch']);