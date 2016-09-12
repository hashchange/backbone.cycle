({
    mainConfigFile: "../../../require-config.js",
    optimize: "none",
    name: "local.main",
    exclude: [
        "jquery",
        "underscore",
        "backbone",
        "backbone.select",
        "backbone.cycle"
    ],
    out: "../../output/parts/app.js"
})