# webpack-get-files-plugin

#### Webpack plugin for extracting output assets filenames into a separate JSON file according to the Entrypoints specified in the webpack configuration.

The main purpose of writing this plugin is that I had a project structure where I was working with NodeJS, Express, Pug (view engine) and webpack. So basically, webpack was building my assets with names having random content hashes like `index.d53b3te33yi3y.js` and it was difficult for me to inject those assets into my views e.g. `index.pug`.
That's why I came up with `webpack-get-files-plugin` that extracts the filenames of the output assets into a `GetFiles.json` file and I can easily inject them into my views.

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
    		home:  path.join(__dirname, 'src', 'home.js'),
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
    					"webpack-logo.png":  "images/webpack-logo.3b7bf087cbac835e6f7d4b7dc9711e72.png",
    					"github.svg":  "images/github.16a9304e38fd8167989291ab92544e14.svg"
    				}
    			}
    		}
    	}
    }

### Demo Project

I have created a demo project in `demo-webpack-get-files-plugin` directory to help you better understand how this plugin works. This demo project does not contain example of working with NodeJS, Express and Pug.

For that I have a separate boilerplate project where I have used this plugin.
[@mhm13dev/node-express-webpack-pug](https://github.com/mhm13dev/node-express-webpack-pug)

### To See How This Plugin Works in Action:

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
