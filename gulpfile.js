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
    path = require('path')

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
        },
        function() {
            console.log('Altere o arquivo css/theme/general.styl para testar')
        }
    )
}

gulp.task('svg-min', function() {
    gulp.src('svg/*.svg')
        .pipe(
            svgmin({
                plugins: [{ removeStyleElement: true }],
            })
        )
        .pipe(gulp.dest('./svg'))
})

gulp.task('svg', function() {
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

    gulp.src('svg/*.svg')
        .pipe(svgSprite(config))
        .pipe(gulp.dest('templates'))
})

gulp.task('prod', function() {
    gulp.src(['css/main/*.styl', './css/theme/components/**/*.styl'])
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

gulp.task('dev', function() {
    gulp.src(['css/main/*.styl', './css/theme/components/**/*.styl'])
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

gulp.task('copy-css', function() {
    gulp.src('./css/one.css').pipe(gulp.dest('./dist'))
})

gulp.task('watch', function() {
    var stylus = gulp.watch('**/*.styl', ['dev'])
    loadbrowserSync()

    stylus.on('change', function(event) {
        console.log(
            'File ' + event.path + ' was ' + event.type + ', running tasks...'
        )
    })
    var stylus = gulp.watch('./css/*.styl', ['dev'])
})
