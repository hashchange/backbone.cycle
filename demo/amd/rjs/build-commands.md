# Generating r.js builds

## Using a Grunt task

Instead of individual r.js calls, the following command will create all builds:

```
grunt requirejs
```

The grunt task simply reads the build profiles described below, and feeds them to r.js.


## Split builds with two build files, for JS Bin demos

The demo HTML files for JS Bin reference two concatenated build files:

- `vendor.js` for the third-party dependencies. It includes Backbone.Cycle.
- `app.js` for the demo code, consisting of local modules.

The code is not rolled up into a single file because that file would be massive, making it unnecessarily difficult to examine the demo code. The purpose of the demo is to see how Backbone.Cycle is used, so it makes sense to keep the client code separate.

### Adjustments

Care must be taken to avoid duplication. A module pulled into `vendor.js` must not be part of `app.js`, and vice versa. Update the module exclusions in **all** build config files when new modules are added to a demo.

### r.js calls

Open a command prompt in the **project root** directory.

```
# For vendor.js:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/jsbin-parts/vendor-config.js

# For app.js:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/jsbin-parts/app-config.js
```

### Output files

The output is written to the directory `demo/amd/rjs/output/parts`.


## Single-file builds, for local demos

Builds for local demos are created to test that the setup continues to work after optimization with r.js. All modules of a demo end up in a single file. For easier examination, the file is not minified.

For more info, see the comments in `index.html`.

### r.js calls

For building the output file, open a command prompt in the **project root** directory, and run this command:

```
node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/unified/build-config.js
```

### Output files

The output is written to the directory `demo/amd/rjs/output/unified`.