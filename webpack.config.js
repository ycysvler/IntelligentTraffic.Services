/**
 * Created by yanggang on 2017/3/6.
 */
var path = require("path");
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');

const env = process.env.NODE_ENV || 'development';

module.exports = {
    target: 'electron',
    context: path.join(__dirname, "app"),
    entry: "./index.js",
    output: {
        path: path.join(__dirname, "public/dist"),
        filename: "bundle.js",
        library: "EntryPoint"
    },
    externals: {
        'config': function () {
            return JSON.stringify(require('./app/config/' + env + '.json'));
        }()
    },
    plugins: function () {
        var options = [
            new HtmlWebpackPlugin({
                title: '云图',
                hash: true,
                inject: false,
                filename: 'index.html',
                template: 'index.html'
            }),
            new ExtractTextPlugin({filename: "bundle.css", disable: false, allChunks: true}),
            new webpack.DefinePlugin({'process.env': {NODE_ENV: JSON.stringify(env)}}),
        ];
        if (env === 'production') {
            options.push(new webpack.optimize.UglifyJsPlugin());
            options.push(new webpack.LoaderOptionsPlugin({minimize: true}));
        }
        options.push(new webpack.ProvidePlugin({
            $: 'jquery'
        }));
        return options;
    }(),
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'react', 'stage-0'],
                        plugins: [["import", {
                            "libraryName": "antd",
                            "style": true
                        }]]
                    }
                }
            }, {
                test: /.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [
                        "css-loader"
                    ],
                    publicPath: "/dist"
                })
            }, {
                test: /.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [
                        "css-loader",
                        "less-loader"
                    ],
                    publicPath: "/dist"
                }),
            },
            {test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/, loader: 'url-loader?limit=50000&name=[path][name].[ext]'},
            {
                test: require.resolve('jquery'),
                loader: "imports-loader?$=jquery"
            }
        ]
    },
};