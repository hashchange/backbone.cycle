requirejs.config( {

    // Base URL: project root
    baseUrl: "../../",

    paths: {
        "jquery": "demo/bower_demo_components/jquery/dist/jquery",
        "underscore": "bower_components/underscore/underscore",
        "backbone": "bower_components/backbone/backbone",
        "backbone.select": "bower_components/backbone.select/dist/amd/backbone.select",
        "backbone.cycle": "dist/amd/backbone.cycle",

        "local.main": "demo/amd/main"
    },

    shim: {
        "jquery": {
            exports: "jQuery"
        }
    }

} );
