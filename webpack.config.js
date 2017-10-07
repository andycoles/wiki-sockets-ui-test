const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, 'src'),
    devtool: 'inline-sourcemap',
    entry: {
        "wikipedia-projects": "./js/index.js"
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'js/[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /(\.js)|(\.jsx)$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    presets: ["babel-preset-env", "babel-preset-react"],
                    plugins: [["jsx-control-statements"]]
                }
            },
            {
                test: /(\.scss)$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader']
                })
            },
        ]
    },
    plugins: [
        new ExtractTextPlugin('css/style.css')
    ]
}
