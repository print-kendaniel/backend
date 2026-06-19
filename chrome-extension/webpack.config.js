const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

// Set API_BASE_URL when building for production, e.g.:
//   API_BASE_URL=https://your-backend.onrender.com npm run build
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

module.exports = {
  mode: "production",
  entry: {
    popup: "./src/popup.ts",
    background: "./src/background.ts",
    content: "./src/content.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.API_BASE_URL": JSON.stringify(API_BASE_URL),
    }),
    new CopyPlugin({
      patterns: [
        { from: "public", to: "." },
      ],
    }),
  ],
  optimization: {
    minimize: true,
  },
};
