const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: ['./src/wallet.js', './src/wallet.scss'],
  output: {
    filename: 'wallet.min.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production' // use 'development' unless process.env.NODE_ENV is defined
    }),
    new ExtractTextPlugin("wallet.min.css", {
      allChunks: true
    })
  ],
  module: {
    rules: [{
      test: /\.m?js$/,
      exclude: /(node_modules)/,
      use: {
        loader: "babel-loader",
        options: {
            presets: ["@babel/preset-env"]
        }
      }
    }, {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader!sass-loader"
        })
    }]
  }
};
