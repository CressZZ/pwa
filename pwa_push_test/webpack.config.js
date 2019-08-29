const path = require('path');


var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  module:{
      rules:[
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
             loader: "babel-loader"
            }
          }
      ]
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [new HtmlWebpackPlugin({
    template: 'src/index.html'
  })],
  
};