const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env) => {

  return {
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'bundle.js',
      publicPath: (env.myenv === 'prod') ? '/home' : '/',
    },
    resolve: {
      modules: [path.join(__dirname, 'src'), 'node_modules'],
      alias: {
        react: path.join(__dirname, 'node_modules', 'react'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              plugins: ['@babel/plugin-transform-runtime']
            }
          },
        },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
      },
      ],
    },
    devServer: {
      historyApiFallback: true,
    },
    devtool: 'source-map',
    plugins: [
      new HtmlWebPackPlugin({
        template: './src/index.html',
      }),
      new Dotenv({
        path: (env.myenv === 'prod') ? '.env.prod' : '.env',
      })
    ],
  };
}
