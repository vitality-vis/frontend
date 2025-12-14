// production config for STANDALONE mode (no logging)
const merge = require('webpack-merge');
const {resolve} = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const commonConfig = require('./common');

module.exports = merge(commonConfig, {
  mode: 'production',
  entry: './index-standalone.tsx',
  output: {
    filename: 'js/bundle.[hash].min.js',
    path: resolve(__dirname, '../../dist-standalone'),
    publicPath: '/vitality2/',
  },
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index-standalone.html.ejs',
    }),
  ],
});
