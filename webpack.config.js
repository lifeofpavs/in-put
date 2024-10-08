const path = require('node:path');

module.exports = {
  entry: {
    background: './background.ts',
    content: './content.ts',
    options: './options.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, ''),
  },
  mode: 'production',
};
