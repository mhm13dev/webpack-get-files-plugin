// Its important to require the assets you want to use in your views e.g. pug views or ejs views

// Suppose we have an home.pug view then here we will have to require all the assets used in that view

// CSS Files - These file will get merged into 1 file because of the way mini-css-extract-plugin works
require('../css/starter.css');
require('../css/other.css');

// Images Files - needs file-loader
require('../images/webpack-logo.png');
require('../images/git.svg');
require('../images/nodejs.svg');
require('../images/javascript.svg');
require('../images/github.svg');

// JS Files - These file will get merged into 1 file because of the way webpack works with JS Files
import lib1 from '../js/lib-1';
import lib2 from '../js/lib-2';

console.log('Hello webpack-get-files-plugin');
