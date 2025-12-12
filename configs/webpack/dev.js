// development config
const merge = require('webpack-merge');
const webpack = require('webpack');
const commonConfig = require('./common');
const {resolve} = require('path');

module.exports = merge(commonConfig, {
  mode: 'development',
  entry: [
    // 'react-hot-loader/patch', // activate HMR for React
    // 'webpack-dev-server/client?http://localhost:8080',// bundle the client for webpack-dev-server and connect to the provided endpoint
    // 'webpack/hot/only-dev-server', // bundle the client for hot reloading, only- means to only hot reload for successful updates
    './index.tsx' // the entry point of our app
  ],
  output: {
    filename: 'js/bundle.[hash].min.js',
    path: resolve(__dirname, '../../dist'),
    publicPath: '/vitality2study/',
  },
  devServer: {
    port: 8080,
    historyApiFallback: {
      index: '/vitality2study/',
      rewrites: [
        { from: /^\/vitality2study/, to: '/vitality2study/index.html' }
      ]
    },
    hot: false, // enable HMR on the server
    devMiddleware: {
      publicPath: '/vitality2study/',
    },
  },
  devtool: 'eval-cheap-module-source-map',
  // plugins: [
  //   new webpack.HotModuleReplacementPlugin(), // enable HMR globally
  // ],
});