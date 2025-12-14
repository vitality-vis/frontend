// development config for STANDALONE mode (no logging)
const merge = require('webpack-merge');
const webpack = require('webpack');
const commonConfig = require('./common');
const {resolve} = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(commonConfig, {
  mode: 'development',
  entry: [
    './index-standalone.tsx' // Standalone entry point
  ],
  output: {
    filename: 'js/bundle.[hash].min.js',
    path: resolve(__dirname, '../../dist-standalone'),
    publicPath: '/vitality2/',
  },
  devServer: {
    port: 8081, // Different port to avoid conflict with study mode
    historyApiFallback: {
      index: '/vitality2/',
      rewrites: [
        { from: /^\/vitality2/, to: '/vitality2/index.html' }
      ]
    },
    hot: false,
    devMiddleware: {
      publicPath: '/vitality2/',
    },
  },
  devtool: 'eval-cheap-module-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index-standalone.html.ejs',
    }),
  ],
});
