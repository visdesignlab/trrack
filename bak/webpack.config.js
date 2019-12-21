/* jshint esversion: 6 */

const path = require("path");
const webpack = require("webpack");
const WebpackMd5Hash = require("webpack-md5-hash");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const PATHS = {
  entryPoint: path.resolve(__dirname, "src/index.ts"),
  cssEntryPoint: path.resolve(__dirname, "src/styles.scss"),
  bundles: path.resolve(__dirname, "_bundles")
};

const libraryName = "ProvenanceLibrary";

const config = {
  entry: {
    app: [PATHS.entryPoint],
    style: [PATHS.cssEntryPoint]
  },
  output: {
    path: PATHS.bundles,
    filename: "[name].[chunkhash].js",
    library: libraryName,
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".css", ".html"]
  },
  devtool: "source-map",
  plugins: [
    new WebpackMd5Hash(),
    new HtmlWebpackPlugin({
      template: "./src/_index.html",
      filename: "../index.html"
    }),
    new webpack.ProvidePlugin({
      d3: "d3",
      $: "jquery",
      "window.$": "jquery"
    }),
    new MiniCssExtractPlugin({
      filename: "style.[contenthash].css"
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader",
        exclude: /node_modules/,
        query: {
          declaration: false
        }
      },
      {
        test: /\.(scss)$/,
        use: [
          "style-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: function() {
                return [require("precss"), require("autoprefixer")];
              }
            }
          },
          "sass-loader"
        ]
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          },
          {
            loader: "less-loader"
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  }
};

module.exports = config;
