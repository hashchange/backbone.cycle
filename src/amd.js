;( function ( root, factory ) {
    if ( typeof exports === 'object' ) {

        var underscore = require( 'underscore' );
        var backbone = require( 'backbone' );
        var select = require( 'backbone.select' );

        module.exports = factory( underscore, backbone, select );

    } else if ( typeof define === 'function' && define.amd ) {

        define( ['underscore', 'backbone', 'backbone.select'], factory );

    }
}( this, function ( _, Backbone ) {
    "option strict";

    // @include backbone.cycle.js
    return Backbone.Cycle;

} ));

