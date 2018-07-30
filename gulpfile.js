// Sass configuration
var gulp = require('gulp'),
    php = require('gulp-connect-php'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    vinyl = require('vinyl-source-stream'),
    babelify = require('babelify'),
    watchify = require('watchify'),
    exorcist = require('exorcist'),
    browserify = require('browserify'),
    cache = require('gulp-cache'),
    imagemin = require('gulp-imagemin'),
    imageminPngquant = require('imagemin-pngquant'),
    imageminZopfli = require('imagemin-zopfli'),
    imageminMozjpeg = require('imagemin-mozjpeg'),
    imageminGiflossy = require('imagemin-giflossy');

var paths = {
    php: [
        'public/**/*.php',
        'src/**/*.php',
    ],
    buildFolder: 'public/assets',
    sass: 'assets/scss/**/*.scss',
    js: 'assets/js/app.js',
    images: 'assets/images/**/*.{gif,png,jpg,svg}',
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
    // gulp.watch(paths.images, ['imagemin']).on('change', browserSync.reload);
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

// Image stuff still working on
gulp.task('imagemin', function () {
    return gulp.src([paths.images])
        .pipe(cache(imagemin([
            imageminPngquant({
                speed: 1,
                quality: 98
            }),
            imageminZopfli({
                more: true
            }),
            imageminGiflossy({
                optimizationLevel: 3,
                optimize: 3,
                lossy: 2
            }),
            //svg
            imagemin.svgo({
                plugins: [{
                    removeViewBox: false
                }]
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imageminMozjpeg({
                quality: 90
            })
        ])))
        .pipe(gulp.dest(paths.buildFolder + '/images'));
});

// Default launch server, compile sass and js, and watch for changes
gulp.task('default', ['serve', 'imagemin', 'sass', 'bundle', 'watch']);