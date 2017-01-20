module.exports = {
  devServer: {
    contentBase: "./",
    port: 3000,
  },
  devtool: "source-map",
  entry: "./src/index.tsx",
  output: {
    path: "./target/",
    filename: "bundle.js",
  },
  resolve: {
    extensions: ["", ".ts", ".tsx", ".js"],
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
    ],
  },
};
