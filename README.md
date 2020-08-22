# webpack-get-files-plugin

#### Webpack plugin for extracting output assets filenames into a separate JSON file according to the Entrypoints specified in the webpack configuration.

### Installation

    npm install webpack-get-files-plugin --save-dev

### Usage

The Webpack Configuartion:

    const  path  =  require('path');

    // Requiring webpack-get-files-plugin
    const  GetFilesPlugin  =  require('webpack-get-files-plugin');

    const  MiniCssExtractPlugin  =  require('mini-css-extract-plugin');
    const { CleanWebpackPlugin } =  require('clean-webpack-plugin');

    module.exports  = {
    	mode:  'production',
    	entry: {
    		home:  path.join(__dirname, 'src', 'home.js')
    	},
    	output: {
    		path:  path.join(__dirname, 'dist'),
    		filename:  'js/[name].[contentHash].js',
    	},
    	plugins: [
        	// Using the Plugin
    		new  GetFilesPlugin(),

    		new  CleanWebpackPlugin(),
    		new  MiniCssExtractPlugin({
    			filename:  'css/[name].[contentHash].css',
    		}),
    	],
    	module: {
    		rules: [
       			{
    	   			test:  /\.css$/,
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

After running the webpack build process, this plugin will emit a file named `GetFiles.json` in the root directory of your project.

### Structure of GetFiles.json

    {

        "entrypoints": ["home"],

        "files": {

    	    "home": {

    		    "filenames": [
    			    "css/home.c43adcd817b4eaa62b97.css",
    			    "js/home.5e994fb65e62d205d1c5.js",
    			    "{\"name\": \"webpack-logo.png\"}??gffm??images/webpack-logo.3b7bf087cbac835e6f7d4b7dc9711e72.png"
    			    ],
    			"assets": {
    				"css": ["css/home.c43adcd817b4eaa62b97.css"],
    				"js": ["js/home.5e994fb65e62d205d1c5.js"],
    				"images": {
    					"webpack-logo.png":  "images/webpack-logo.3b7bf087cbac835e6f7d4b7dc9711e72.png"
    				}
    			}
    		}
    	}
    }

I have created a demo project in `demo-webpack-get-files-plugin` directory to help you better understand how this plugin works.

### To check how this plugin works in action:

Clone this repo:

    git clone https://github.com/mhm13dev/webpack-get-files-plugin.git

Change into repo's directory

    cd webpack-get-files-plugin

Change into demo project directory

    cd demo-webpack-get-files-plugin

Install the dependencies

    npm install

Run the webpack build process

    npm run webpack

Then have a look at the `dist` directory and `GetFiles.json` file inside `demo-webpack-get-files-plugin` directory.
