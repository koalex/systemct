module.exports = {
    plugins: [
        require('autoprefixer')({ browsers: ['last 3 version', 'ie >= 9'] }),
        require('css-mqpacker')({ sort: true })
    ]
};