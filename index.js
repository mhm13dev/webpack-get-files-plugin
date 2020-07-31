const fs = require('fs');
const path = require('path');

const pluginName = 'GetFilesPlugin';

class GetFiles {
  // Regular Expression for images extensions
  imagesRegExp = /png|svg|jpg|jpeg|gif/;

  // Function for getting file name information i.e name and ext
  getFileNameInfo(filename) {
    // Split the filename by / or \ into an array
    const filenameArr = filename.split(/[\\/]/);

    // Extract the name part including extension
    const nameArr = filenameArr[filenameArr.length - 1].split('.');

    // Extract the name from nameArr
    const name = nameArr[0];

    //  Extract the ext form nameArr
    const ext = nameArr[nameArr.length - 1];

    // Return Name and Extension
    return { name, ext };
  }

  // Get Files Names From Module Indices Based on Extension
  getFilesFromModule = (extensions, stats, entrypoint) => {
    /*
    extensions: Array of strings for extensions
    stats: an Object which is an argument to "hooks.done"
    entry: Name of the entrypoint
    */

    // Set this keyword to self to avoid confusions when reffering to this class
    const self = this;

    // 1. Create a RegExp to check if the extension of the module.resource match the Regex pattern
    const extRegex = new RegExp(extensions.join('|'));

    // 2. Get The Iterator for Module Indices for current entrypoint
    const moduleIndicesIterator = stats.compilation.entrypoints
      .get(entrypoint)
      ['_moduleIndices'].keys();

    // 3. Iterate over each Module of current entrypoint
    for (const module of moduleIndicesIterator) {
      // 4. If Module has a Resource Property Then go on
      if (module.resource) {
        // 5. Get The filename info For The module.resource
        const fileNameInfo = self.getFileNameInfo(module.resource); // {name, ext}

        // 6. If the ext matches the extensions of the RegExp, then go on
        if (extRegex.test(fileNameInfo.ext)) {
          // Get the Hashed Filename from module.buildInfo.assets
          let [file] = [...Object.keys(module.buildInfo.assets)];

          // check if the extensions matches the imagesRegExp
          if (self.imagesRegExp.test(fileNameInfo.ext)) {
            // If yes, then modify the Hashed Filename to include a JSON object about the original name of the image
            file = `{"name": "${
              fileNameInfo.name
            }${fileNameInfo.ext.toUpperCase()}"}??gffm??${file}`; // gffm => getFilesFromModule
          }

          /*
          7. Return
          entrypoint: The name of the entrypoint so that the filename can be pushed in right place
          file: Hashed Filename of the file
          */
          return {
            entrypoint,
            file,
          };
        }
      }
    }
  };

  apply(compiler) {
    // Set this keyword to self to avoid confusions when reffering to this class
    const self = this;

    // Compiler Hook "hooks.done"
    compiler.hooks.done.tap(pluginName, (stats) => {
      // The output object
      const filesDetails = {
        // Array of Entrypoint Names
        entrypoints: [],
        // A Files object which contains all the files data
        files: {},
      };

      // An Iterator for Entrypoints with "keys" as "Entrypoint Names" and "values" as "Entry Modules"
      const entrypointsIterator = stats.compilation.entrypoints.entries();

      // Iterate over All Entrypoints
      for (const [entrypoint, entrypointData] of entrypointsIterator) {
        // Push Entrypoint Names to fileDetails.entrypoints array
        filesDetails.entrypoints.push(entrypoint);

        // Create an Array for Every Entrypoint in fileDetails.files
        filesDetails.files[entrypoint] = {};

        // Create a [entrypoint].filenames array which contains all filenames for current entrypoint
        filesDetails.files[entrypoint].filenames = [];

        // Loop over all the chunks in the entrypointData
        entrypointData.chunks.forEach((chunk) => {
          // Push chunk.files to [entrypoint].filenames
          filesDetails.files[entrypoint].filenames.push(...chunk.files);
        });

        // Get Image Files For The Current Entrypoint
        const images = self.getFilesFromModule(
          ['jpg', 'jpeg', 'gif', 'png', 'svg'],
          stats,
          entrypoint
        );

        // Get Text Files For The Current Entrypoint
        const text = self.getFilesFromModule(['txt'], stats, entrypoint);

        // If There are image files
        if (images) {
          // Push the images.files to [entrypoint].filenames Array
          filesDetails.files[entrypoint].filenames.push(images.file);
        }

        // If There are text files
        if (text) {
          // Push the images.files to [entrypoint].filenames Array
          filesDetails.files[entrypoint].filenames.push(text.file);
        }

        // Create a [entrypoint].assets object which contains fields for every file extension
        filesDetails.files[entrypoint].assets = {};

        // Loop over each filename in [entrypoint].filenames
        filesDetails.files[entrypoint].filenames.forEach((filename) => {
          const { ext } = self.getFileNameInfo(filename);
          // Push filename in [entrypoint].filenames to respective fields inside [entrypoint].assets object based on file extension

          // For JS Files
          if (ext === 'js') {
            if (filesDetails.files[entrypoint].assets['js']) {
              filesDetails.files[entrypoint].assets['js'].push(filename);
            } else {
              filesDetails.files[entrypoint].assets['js'] = [];
              filesDetails.files[entrypoint].assets['js'].push(filename);
            }
          }
          // For CSS Files
          else if (ext === 'css') {
            if (filesDetails.files[entrypoint].assets['css']) {
              filesDetails.files[entrypoint].assets['css'].push(filename);
            } else {
              filesDetails.files[entrypoint].assets['css'] = [];
              filesDetails.files[entrypoint].assets['css'].push(filename);
            }
          }
          // For Text Files
          else if (ext === 'txt') {
            if (filesDetails.files[entrypoint].assets['text']) {
              filesDetails.files[entrypoint].assets['text'].push(filename);
            } else {
              filesDetails.files[entrypoint].assets['text'] = [];
              filesDetails.files[entrypoint].assets['text'].push(filename);
            }
          }
          // For Images Files
          else if (self.imagesRegExp.test(ext)) {
            // Split filename by "??gffm??", a filename from "getFilesFromModule" function for the images
            const filenameArr = filename.split('??gffm??');

            // Extract the fileInfo Object
            const fileInfo = JSON.parse(filenameArr[0]);

            // Get The Filename
            const file = filenameArr[1];

            if (filesDetails.files[entrypoint].assets['images']) {
              filesDetails.files[entrypoint].assets['images'][
                fileInfo.name
              ] = file;
            } else {
              // In case of Images, its an object with key as original filename and value as hashed filename
              filesDetails.files[entrypoint].assets['images'] = {};
              filesDetails.files[entrypoint].assets['images'][
                fileInfo.name
              ] = file;
            }
          }
          // For All Other Files that are not supported yet
          else {
            if (filesDetails.files[entrypoint].assets['others']) {
              filesDetails.files[entrypoint].assets['others'].push(filename);
            } else {
              filesDetails.files[entrypoint].assets['others'] = [];
              filesDetails.files[entrypoint].assets['others'].push(filename);
            }
          }
        });
      }

      // Get The Output Directory
      const outputDir = stats.compilation.outputOptions.path;

      // Write The final filesDetails Object as JSON to a File
      fs.writeFile(
        path.resolve(outputDir, 'GetFiles.json'),
        JSON.stringify(filesDetails),
        'utf-8',
        () => {
          console.log('GetFiles.json Written!');
        }
      );
    });
  }
}

module.exports = GetFiles;
