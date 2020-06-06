var gulp = require('gulp'),
    svgSprite = require('gulp-svg-sprite'),
    stylus = require('gulp-stylus'),
    svgmin = require('gulp-svgmin'),
    gulpif = require('gulp-if'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    pxtorem = require('postcss-pxtorem'),
    browserSync = require('browser-sync').create(),
    path = require('path'),
    backstop = require('backstopjs'),
    url = require('url'),
    concat = require('gulp-concat'),
    path = require('path'),
    svgo = require('gulp-svgo')

var config = require('./skin')
var { rootValue, unitPrecision } = config.pxtorem
var { protocol, host, theme } = config

var processors = [
    autoprefixer({
        grid: true,
        cascade: false,
    }),
    pxtorem({
        rootValue: rootValue,
        unitPrecision: unitPrecision,
        propList: [
            'font',
            'font-size',
            'line-height',
            'letter-spacing',
            'width',
            'height',
            'margin',
            'margin*',
            'padding*',
            'top',
            'right',
            'bottom',
            'left',
        ],
        mediaQuery: false,
        minPixelValue: 0,
        replace: true,
    }),
]

function loadbrowserSync() {
    browserSync.init(
        {
            port: 8080,
            proxy: [protocol, host].join('://'),
            serveStatic: require('./server/static'),
            middleware: require('./server/routes'),
            open: true,
        },
        function () {
            console.log('Altere o arquivo css/theme/general.styl para testar')
        }
    )
}

gulp.task('svg-min', function () {
    gulp.src('svg/*.svg')
        .pipe(
            svgmin({
                plugins: [
                    { removeEmptyContainers: true },
                    { removeEmptyText: true },
                    { removeStyleElement: true },
                    { removeViewBox: false },
                    {
                        removeUselessStrokeAndFill: {
                            removeNone: true,
                        },
                    },
                    { removeEmptyAttrs: true },
                    { removeTitle: true },
                    {
                        removeAttrs: {
                            attrs: [
                                'xmlns',
                                'id',
                                'data-name',
                                'class',
                                'fill',
                                'defs',
                                'style',
                            ],
                        },
                    },
                ],
            })
        )
        .pipe(svgo())
        .pipe(gulp.dest('./svg'))
})

gulp.task('svg', function () {
    // More complex configuration example
    const config = {
        svg: {
            xmlDeclaration: false,
            doctypeDeclaration: false,
            rootAttributes: {
                class: 'svg-sprites',
                id: 'skin-sprite',
            },
        },
        mode: {
            symbol: {
                symbol: true,
                inline: false,
            },
        },
    }

    gulp.src('svg/*.svg').pipe(svgSprite(config)).pipe(gulp.dest('templates'))
})

gulp.task('prod', function () {
    gulp.src([
        'css/main/*.styl',
        './css/theme/components/**/*.styl',
        './css/theme/pages/**/*.styl',
    ])
        .pipe(
            stylus({
                'include css': true,
                import: [
                    path.resolve(__dirname, './css/vars/prod.styl'),
                    path.resolve(__dirname, './css/theme/general.styl'),
                ],
                url: {
                    name: 'embedurl',
                    limit: false,
                },
            })
        )
        .pipe(postcss(processors))
        .pipe(concat('one.css'))
        .pipe(gulp.dest('./css'))
})

gulp.task('dev', function () {
    gulp.src([
        'css/main/*.styl',
        './css/theme/components/**/*.styl',
        './css/theme/pages/**/*.styl',
    ])
        .pipe(
            stylus({
                'include css': true,
                import: [
                    path.resolve(__dirname, './css/vars/dev.styl'),
                    path.resolve(__dirname, './css/theme/general.styl'),
                ],
                url: {
                    name: 'embedurl',
                    limit: false,
                },
            })
        )
        .on('error', (err) => {
            console.error(err.message)
            this.emit('end')
        })
        .pipe(postcss(processors))
        .pipe(concat('one.css'))
        .pipe(gulp.dest('./css'))
        .pipe(browserSync.stream())
})

gulp.task('copy-css', function () {
    gulp.src('./css/one.css').pipe(gulp.dest('./dist'))
})

gulp.task('watch', function () {
    var stylus = gulp.watch('**/*.styl', ['dev'])
    loadbrowserSync()

    stylus.on('change', function (event) {
        console.log(
            'File ' + event.path + ' was ' + event.type + ', running tasks...'
        )
    })
    var stylus = gulp.watch('./css/*.styl', ['dev'])
})


// Optimize Images 
var cache = require('gulp-cache');
var imagemin = require('gulp-imagemin');
var imageminPngquant = require('imagemin-pngquant');
var imageminZopfli = require('imagemin-zopfli');
var imageminMozjpeg = require('imagemin-mozjpeg'); //need to run 'brew install libpng'
var imageminGiflossy = require('imagemin-giflossy');
//compress all images
gulp.task('imagemin', function() {
    return gulp.src(['img/**/*.{gif,png,jpg}'])
        .pipe(cache(imagemin([
            //png
            imageminPngquant({
                speed: 1,
                quality: [0.95, 1] //lossy settings
            }),
            imageminZopfli({
                more: true
                // iterations: 50 // very slow but more effective
            }),

            imageminGiflossy({
                optimizationLevel: 3,
                optimize: 3, //keep-empty: Preserve empty transparent frames
                lossy: 2
            }),
            //svg
            imagemin.svgo({
                plugins: [{
                    removeViewBox: false
                }]
            }),
            //jpg lossless
            // imagemin.jpegtran({
            //     progressive: true
            // }),
            //jpg very light lossy, use vs jpegtran
            imageminMozjpeg({
                quality: 90
            })
        ])))
        .pipe(gulp.dest('optimize'));
});