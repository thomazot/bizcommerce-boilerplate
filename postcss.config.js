const tailwindcss = require('tailwindcss')
const autoprefixer = require('autoprefixer')
const pxtorem = require('postcss-pxtorem')

const config = require('./skin')
const { rootValue, unitPrecision } = config.pxtorem

module.exports = {
    plugins: [
        tailwindcss(),
        autoprefixer({
            grid: 'autoplace',
            // grid: true,
            // cascade: false,
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
    ],
}
