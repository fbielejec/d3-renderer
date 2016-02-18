/**
 * @author fbielejec
 */

var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

//var ROOT_PATH = path.resolve(__dirname);
//var APP_PATH = path.resolve(ROOT_PATH, 'src');
//var BUILD_PATH = path.resolve(ROOT_PATH, 'dist');

module.exports = {

    entry: "./src/main.js", // APP_PATH

    output: {
        filename: 'main.js',
        path: path.resolve('./dist') // BUILD_PATH  
    },

//	devServer : {
//		historyApiFallback : true,
//		hot : true,
//		inline : true,
//		progress : true,
//		port : 8080
//	},
    
    module: {
        loaders: [
            
                  { test: /\.css$/, loader: 'style-loader!css-loader' },
                  { test: /\.png$/, loader: 'url-loader?limit=10000' },
                  { test: /\.json$/, loader: 'json-loader' },
//                  { test: /kodama/, loader: 'exports?kodama!imports?d3.kodama' }
        ]
    },

    resolve: {
        modulesDirectories: ['node_modules']
    },

    plugins: [
        new HtmlWebpackPlugin({title : "SpreaD3"}),
        new webpack.ProvidePlugin({
            'Promise': 'es6-promise'//, // Thanks Aaron (https://gist.github.com/Couto/b29676dd1ab8714a818f#gistcomment-1584602)
//            'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
        
    ]

};
