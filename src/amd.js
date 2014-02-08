(function ( root, factory ) {
    if ( typeof exports === 'object' ) {

        var underscore = require( 'underscore' );
        var backbone = require( 'backbone' );
        var picky = require( 'backbone.picky' );

        module.exports = factory( underscore, backbone );

    } else if ( typeof define === 'function' && define.amd ) {

        define( ['underscore', 'backbone', 'backbone.picky'], factory );

    }
}( this, function ( _, Backbone ) {
    "option strict";

    // @include backbone.cycle.js
    return Backbone.Cycle;

} ));

