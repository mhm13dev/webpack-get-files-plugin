const path = require('path');
const GetFilesPlugin = require('webpack-get-files-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: {
		home: path.join(__dirname, 'src', 'entry', 'home.js'),
		other: path.join(__dirname, 'src', 'entry', 'other.js'),
	},

	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'js/[name].[contentHash].js',
	},

	plugins: [
		new CleanWebpackPlugin(),
		new GetFilesPlugin(),
		new MiniCssExtractPlugin({
			filename: 'css/[name].[contentHash].css',
		}),
	],

	module: {
		rules: [
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
			{
				test: /\.(png|jpg|svg|gif|jpeg)/,
				use: {
					loader: 'file-loader',
					options: {
						name: 'images/[name].[contentHash].[ext]',
					},
				},
			},
		],
	},
};
