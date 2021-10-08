const path = require('path')
const { src, watch, dest, parallel } = require('gulp'),
    stylus = require('gulp-stylus'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    pxtorem = require('postcss-pxtorem'),
    concat = require('gulp-concat')
const browserSync = require('browser-sync')
const svgSprite = require('gulp-svg-sprite')
const svgmin = require('gulp-svgmin'),
    svgo = require('gulp-svgo')
const config = require('./skin')
const { rootValue, unitPrecision } = config.pxtorem
var { protocol, host } = config

const processors = [
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

function loadBrowserSync() {
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

function svgMin(cb) {
    src('svg/*.svg')
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
        .pipe(dest('./svg/optimize'))
    cb()
}

function svg(cb) {
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

    src('svg/optimize/*.svg').pipe(svgSprite(config)).pipe(dest('./templates'))

    cb()
}

function deploy(cb) {
    src([
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
        .pipe(dest('./public/css'))
    cb()
}

function build(cb) {
    src([
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
        .pipe(postcss(processors))
        .pipe(concat('one.css'))
        .pipe(dest('./public/css'))
        .pipe(browserSync.stream())
    cb()
}

function javascript(cb) {
    src('js/**/*.js').pipe(dest('./public/js')).pipe(browserSync.reload)
    cb()
}

async function buildWatch(cb) {
    await loadBrowserSync()
    watch(['**/*.styl', 'js/**/*.js'], parallel(build, javascript))
    cb()
}

// Optimize Images
const cache = require('gulp-cache'),
    imagemin = require('gulp-imagemin'),
    imageminPngquant = require('imagemin-pngquant'),
    imageminZopfli = require('imagemin-zopfli'),
    imageminMozjpeg = require('imagemin-mozjpeg'),
    imageminGiflossy = require('imagemin-giflossy')

function images(cb) {
    src('img/**/*.{gif,png,jpg}')
        .pipe(
            cache(
                imagemin([
                    imageminPngquant({
                        speed: 1,
                        quality: [0.95, 1],
                    }),
                    imageminZopfli({
                        more: true,
                    }),

                    imageminGiflossy({
                        optimizationLevel: 3,
                        optimize: 3,
                        lossy: 2,
                    }),
                    imagemin.svgo({
                        plugins: [
                            {
                                removeViewBox: false,
                            },
                        ],
                    }),
                    imageminMozjpeg({
                        quality: 90,
                    }),
                ])
            )
        )
        .pipe(dest('optimize'))
    cb()
}

exports.javascript = javascript
exports.deploy = deploy
exports.build = build
exports.svgMin = svgMin
exports.svg = svg
exports.imagemin = images
exports.default = buildWatch
