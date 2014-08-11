;( function ( root, factory ) {
    "use strict";

    if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( 'underscore' ),
            require( 'backbone' ),
            require( 'backbone.select' )
        );

    } else if ( typeof define === 'function' && define.amd ) {

        define( [
            'underscore',
            'backbone',
            'backbone.select'
        ], factory );

    }
}( this, function ( _, Backbone ) {
    "use strict";

    // @include backbone.cycle.js
    return Backbone.Cycle;

} ));

