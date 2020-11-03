const path = require('path');
// const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const webpackMerge = require('webpack-merge');

const modeConfig = env => require(`./webpack.${env}`)(env);

module.exports = ({ mode, presets } = { mode: 'production', presets: [] }) => {
  return webpackMerge(
    {
      entry: './src/index.ts',
      mode,
      devtool: 'source-map',
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
          },
          {
            test: /\.html$/i,
            exclude: /node_modules/,
            loader: 'html-loader',
          },
          {
            test: /\.css$/i,
            exclude: /node_modules/,
            use: ['style-loader', 'css-loader'],
          },
          {
            test: /\.(png|jpg|bmp)$/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  emitFile: true,
                },
              },
            ],
          },
        ],
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.js'],
      },
      output: {
        filename: '[name].js',
        sourceMapFilename: '[file].map',
        path: path.resolve(__dirname, '../dist'),
        // publicPath: '/assets/',
      },
      optimization: {
        minimize: false,
        usedExports: true,
        splitChunks: {
          chunks: 'all',
        },
      },
      node: {
        __dirname: true,
        __filename: true,
      },
      plugins: [
        new CleanWebpackPlugin({}),
        new CopyWebpackPlugin({
          patterns: [{ from: 'assets', to: 'assets' }],
        }),
        new HtmlWebPackPlugin({ template: 'index.html' }),
      ],
    },
    modeConfig(mode),
  );
};
