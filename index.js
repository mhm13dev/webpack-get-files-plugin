const fs = require('fs');

class GetFiles {
  getFileExtension(filename) {
    const filenameSplitArr = filename.split('.');
    const ext = filenameSplitArr[filenameSplitArr.length - 1];
    return ext;
  }

  // Get Files Names From Module Indices Based on Extension
  getFilenames = (extensions, stats, entrypoint) => {
    /*
    extensions: Array of strings for extensions
    stats: an Object which is an argument to "hooks.done"
    entry: Name of the entrypoint
    */

    // Set this keyword to self to avoid confusions when reffering to this class
    const self = this;

    // 1. Create a RegExp to check if the extensions of the module files match the Regex pattern
    const extRegex = new RegExp(extensions.join('|'));

    // 2. Get The Iterator for Module Indices
    const moduleIndicesIterator = stats.compilation.entrypoints
      .get(entrypoint)
      ['_moduleIndices'].keys();

    // 3. Iterate over each Module of current entrypoint
    for (const module of moduleIndicesIterator) {
      // 4. If Module has a Resource Property Then go on
      if (module.resource) {
        // 5. Get The File Extension For The Resource
        // const ext = module.resource.match(/[^.]+$/)[0];
        const ext = self.getFileExtension(module.resource);

        // 6. If the ext matches the extensions of the RegExp, then go on
        if (extRegex.test(ext)) {
          /*
          7. Return
          entrypoint: The name of the entrypoint so that the filename can be pushed in right place
          files: An array of files names
          */
          return {
            entrypoint,
            files: Object.keys(module.buildInfo.assets),
          };
        }
      }
    }
  };

  apply(compiler) {
    // Set this keyword to self to avoid confusions when reffering to this class
    const self = this;

    // Compiler Hook "hooks.done"
    compiler.hooks.done.tap('Done', (stats) => {
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
        const images = self.getFilenames(
          ['jpg', 'jpeg', 'gif', 'png', 'svg'],
          stats,
          entrypoint
        );

        // Get Text Files For The Current Entrypoint
        const text = self.getFilenames(['txt'], stats, entrypoint);

        // If There are image files
        if (images) {
          // Push the images.files to [entrypoint].filenames Array
          filesDetails.files[entrypoint].filenames.push(...images.files);
          // }
        }

        // If There are text files
        if (text) {
          // if (entrypoint === text.entry) {
          // Push the images.files to [entrypoint].filenames Array
          filesDetails.files[entrypoint].filenames.push(...text.files);
          // }
        }

        // Create a [entrypoint].assets object which contains fields for every file extension
        filesDetails.files[entrypoint].assets = {};

        filesDetails.files[entrypoint].filenames.forEach((filename) => {
          const ext = self.getFileExtension(filename);
          // Push filename in [entrypoint].filenames to respective fields inside [entrypoint].assets object based on file extension

          if (ext === 'txt') {
            if (filesDetails.files[entrypoint].assets['text']) {
              filesDetails.files[entrypoint].assets['text'].push(filename);
            } else {
              filesDetails.files[entrypoint].assets['text'] = [];
              filesDetails.files[entrypoint].assets['text'].push(filename);
            }
          } else if (/svg|jpg|jpeg|png|gif/.test(ext)) {
            if (filesDetails.files[entrypoint].assets['images']) {
              filesDetails.files[entrypoint].assets['images'].push(filename);
            } else {
              filesDetails.files[entrypoint].assets['images'] = [];
              filesDetails.files[entrypoint].assets['images'].push(filename);
            }
          } else if (ext === 'js') {
            if (filesDetails.files[entrypoint].assets['js']) {
              filesDetails.files[entrypoint].assets['js'].push(filename);
            } else {
              filesDetails.files[entrypoint].assets['js'] = [];
              filesDetails.files[entrypoint].assets['js'].push(filename);
            }
          } else if ('css') {
            if (filesDetails.files[entrypoint].assets['css']) {
              filesDetails.files[entrypoint].assets['css'].push(filename);
            } else {
              filesDetails.files[entrypoint].assets['css'] = [];
              filesDetails.files[entrypoint].assets['css'].push(filename);
            }
          } else {
            if (filesDetails.files[entrypoint].assets['others']) {
              filesDetails.files[entrypoint].assets['others'].push(filename);
            } else {
              filesDetails.files[entrypoint].assets['others'] = [];
              filesDetails.files[entrypoint].assets['others'].push(filename);
            }
          }
        });
      }

      // Write The final filesDetails Object as JSON to a File
      fs.writeFile(
        'GetFiles.json',
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
