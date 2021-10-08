const { theme } = require('./config')
module.exports = [
    {
        route: '/media/interface/0/' + theme + '/css',
        dir: './public/css',
    },
    {
        route: '/media/interface/0/' + theme + '/js',
        dir: './public/js',
    },
    {
        route: '/backstop',
        dir: './backstop_data',
    },
    {
        route: '/media/files',
        dir: ['./components/src', './components/dist', './img', './svg'],
    },
]
