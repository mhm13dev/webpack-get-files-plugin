const fs = require('fs');

class GetFiles {
  // Get Images Files From Module Indices
  getImagesFilenames = (stats, entry) => {
    /*
    stats: an Object which is an argument to "hooks.done"
    entry: Name of the entrypoint
    */

    // 1. Get The Iterator for Module Indices
    const moduleIndicesIterator = stats.compilation.entrypoints
      .get(entry)
      ['_moduleIndices'].keys();

    // 2. Iterate over each Module
    for (const module of moduleIndicesIterator) {
      // 3. If Module has a Resource Property Then go on
      if (module.resource) {
        // 4. Get The File Extension For The Resource
        const ext = module.resource.match(/[^.]+$/)[0];

        // 5. Create a regex to check if the extension matches the regex pattern
        const regex = /svg|jpeg|jpg|gif|png/;
        // 6. If extension is an Images File extension then go on
        if (regex.test(ext)) {
          /*
          7. Return
          entry: The name of the entrypoint so that the filename can be pushed in right place
          files: An array of files names
          */
          return {
            entry,
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
        entries: [],
      };

      // An Iterator for Entrypoints with "keys" as "Entrypoint Names" and "values" as "Entry Modules"
      const entriesIterator = stats.compilation.entrypoints.entries();

      // Iterate over All Entrypoints
      for (const [entryName, entry] of entriesIterator) {
        // Push Entrypoint Names to fileDetails.entries object
        filesDetails.entries.push(entryName);

        // Create an Array for Every Entrypoint in fileDetails
        filesDetails[entryName] = [];

        // Loop over all the chunks in the Entry Modules
        entry.chunks.forEach((chunk) => {
          // Create a Chunk Object for every chunk
          const details = {};

          // Put name of the of the chunk to Chunk.name
          details.name = chunk.name;

          // Put all the files for the chunk to Chunk.filenames
          details.filenames = [...chunk.files]; // Also Do Not Mutate The Original Array

          // Put The Chunk Object to fileDetails[entryName]
          filesDetails[entryName].push(details);
        });

        // Get Images For The Current Entrypoint
        const images = self.getImagesFilenames(stats, entryName);

        // Loop over fileDetails[entryName] For Current Entrypoint to put the images files in right place
        filesDetails[entryName].forEach((detail) => {
          if (images) {
            // Check if the Chunk.name === images.entry
            if (detail.name === images.entry) {
              // Push the images.files to Chunk.filenames Array
              detail.filenames.push(...images.files);
            }
          }
        });
      }

      /* Create a Chunk.files Object Which Contains Fields For Every File Extension */
      // Loop Over filesDetails.entries (Entrypoint Names Array)
      filesDetails.entries.forEach((entry) => {
        // Then Loop over Each Entrypoint Name Array in filesDetails
        filesDetails[entry].forEach((details) => {
          // details == Chunk Object

          // Create a Chunk.files Object
          details.files = {};

          // Loop over Chunk.filenames
          details.filenames.forEach((filename) => {
            // For each filename get the extension
            const ext = filename.match(/[^.]+$/)[0];

            // If extension match an Image File extension then Chunk.files.images field would be created
            if (ext === ('svg' || 'png' || 'jpg' || 'jpeg' || 'gif')) {
              details.files['images'] = [];
              details.files['images'].push(filename);
            } else {
              // Otherwise Chunk.files[ext] would be created for Evry other File Extension
              details.files[ext] = [];
              details.files[ext].push(filename);
            }
          });
        });
      });

      // Write The final filesDetails Object as JSON to a File
      fs.writeFile(
        'GetFiles.json',
        JSON.stringify(filesDetails),
        'utf-8',
        () => {
          console.log('GetFiles.json Written!');
        },
      );
    });
  }
}

module.exports = GetFiles;
