const Bundler = require('requireg')('parcel-bundler');
const Path = require('path');

var argv = require('minimist')(process.argv.slice(2));

let isWatching;
if(argv.b)
    isWatching = false;
else if(argv.w)
    isWatching = true;
else
    throw new Error("One of -b -or -w must be provided.");

// Bundler options
const options = {
  outDir: './docs', // The out directory to put the build files in, defaults to dist
  outFile: 'index.html', // The name of the outputFile
  publicUrl: !isWatching ? '.' : '/', // The url to serve on, defaults to '/'
  watch: isWatching, // Whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
  minify: !isWatching, // Minify files, enabled if process.env.NODE_ENV === 'production'
  scopeHoist: false, // Turn on experimental scope hoisting/tree shaking flag, for smaller production bundles
  target: 'browser', // Browser/node/electron, defaults to browser
  hmr: true, // Enable or disable HMR while watching
  hmrPort: 0, // The port the HMR socket runs on, defaults to a random free port (0 in node.js resolves to a random free port)
  sourceMaps: false, // Enable or disable sourcemaps, defaults to enabled (minified builds currently always create sourcemaps)
  hmrHostname: '', // A hostname for hot module reload, default to ''
  detailedReport: true, // Prints a detailed report of the bundles, assets, filesizes and times, defaults to false, reports are only printed if watch is disabled
  autoInstall: false, // Enable or disable auto install of missing dependencies found during bundling
};

(async function() {
  // Initializes a bundler using the entrypoint location and options provided
  const bundler = new Bundler('index.html', options);

  // Run the bundler, this returns the main bundle
  // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
  const bundle = await bundler.serve(8080);
})();