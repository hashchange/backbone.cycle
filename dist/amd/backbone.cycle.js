// Backbone.Cycle, v2.0.2
// Copyright (c)2015 Michael Heim, Zeilenwechsel.de
// Distributed under MIT license
// http://github.com/hashchange/backbone.cycle

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

    ;( function( Backbone, _ ) {
        "use strict";
    
        var CycleMixins = {
    
            /**
             * Base component: Backbone.Cycle.Model.
             */
            Model: {
    
                ahead: function ( n, collectionContext ) {
                    var collection = collectionContext || this.collection,
                        index = collection.indexOf( this );
    
                    if ( index === -1 ) throw new Error( "Model " + this.cid + "doesn't exist in the collection." );
                    return at_looped( index + n, collection );
                },
                behind: function ( n, collectionContext ) {
                    return this.ahead( -n, collectionContext );
                },
                next: function ( collectionContext ) {
                    return this.ahead( 1, collectionContext );
                },
                prev: function ( collectionContext ) {
                    return this.behind( 1, collectionContext );
                },
                aheadNoLoop: function ( n, collectionContext ) {
                    var collection = collectionContext || this.collection,
                        index = collection.indexOf( this );
    
                    if ( index === -1 ) throw new Error( "Model " + this.cid + "doesn't exist in the collection." );
                    return at_noLoop( index + n, collection );
                },
                behindNoLoop: function ( n, collectionContext ) {
                    return this.aheadNoLoop( -n, collectionContext );
                },
                nextNoLoop: function ( collectionContext ) {
                    return this.aheadNoLoop( 1, collectionContext );
                },
                prevNoLoop: function ( collectionContext ) {
                    return this.behindNoLoop( 1, collectionContext );
                },
    
                _cycleType: "Backbone.Cycle.Model"
    
            },
    
            /**
             * Backbone.Cycle.SelectableCollection
             *
             * Also includes Backbone.Select.One, no need to apply it separately.
             */
            SelectableCollection: {
    
                selectAt: function ( index ) {
                    // Convenience method, unrelated to the cycle functionality
                    var model = at_noLoop( index, this );
                    if ( model ) {
                        model.select();
                    } else {
                        throw new Error( "Model with index " + index + " doesn't exist in the collection and can't be selected." );
                    }
                },
    
                selectNext: function () {
                    this.next().select();
                    return this;
                },
                selectPrev: function () {
                    this.prev().select();
                    return this;
                },
                selectNextNoLoop: function () {
                    var next = this.nextNoLoop();
                    if ( next ) next.select();
                    return this;
                },
                selectPrevNoLoop: function () {
                    var prev = this.prevNoLoop();
                    if ( prev ) prev.select();
                    return this;
                },
                ahead: function ( n ) {
                    if ( !this.selected ) throw new Error( "Illegal call of SelectableCollection navigation method. No model had been selected to begin with." );
                    return at_looped( this.indexOf( this.selected ) + n, this );
                },
                behind: function ( n ) {
                    return this.ahead( -n );
                },
                next: function () {
                    return this.ahead( 1 );
                },
                prev: function () {
                    return this.behind( 1 );
                },
                aheadNoLoop: function ( n ) {
                    if ( !this.selected ) throw new Error( "Illegal call of SelectableCollection navigation method. No model had been selected to begin with." );
                    return at_noLoop( this.indexOf( this.selected ) + n, this );
                },
                behindNoLoop: function ( n ) {
                    return this.aheadNoLoop( -n );
                },
                nextNoLoop: function () {
                    return this.aheadNoLoop( 1 );
                },
                prevNoLoop: function () {
                    return this.behindNoLoop( 1 );
                },
    
                selectInitial: function () {
                    // A model gets passed in as first argument during an add event, but not during a reset, thus distinguishing
                    // the two.
                    var isReset = arguments.length && !( arguments[0] instanceof Backbone.Model ),
                        autoSelectAt;
    
                    if ( this.length && ! this.selected && ! this._cycle_skipSelectInitial && this.autoSelect !== "none" ) {
                        autoSelectAt = getAutoSelectIndex( this.autoSelect, this.models );
    
                        if ( !isReset ) {
    
                            // Check if there is a selected model elsewhere in the collection - meaning that a batch of models
                            // has been added and one of them had already been selected beforehand. The add events are now fired
                            // one by one, and Backbone.Select will update the collection when the turn of the selected model
                            // has come. Don't do an auto selection here, then. (And set a flag for the remaining add events, so
                            // the expensive search for the selected model does not get repeated.)
    
                            if ( this.find( function ( model ) { return model.selected; } ) ) this._cycle_skipSelectInitial = true;
                        }
    
                        if ( at_noLoop( autoSelectAt, this ) && !this._cycle_skipSelectInitial ) this.selectAt( autoSelectAt );
                    }
    
                    // Delete the skip flag if necessary, once Backbone.Select has updated the selection
                    if ( this.selected && this._cycle_skipSelectInitial ) delete this._cycle_skipSelectInitial;
                },
    
                selectOnRemove: function ( model, collection, options ) {
                    var selectIndex, modelIndex;
    
                    options || ( options = {} );
                    if ( options._externalEvent !== "remove" ) return;
                    if ( this.selectIfRemoved && this.selectIfRemoved === "none" || !this.length ) return;
    
                    modelIndex = options.index;
    
                    // NB The model is already deselected and removed from the collection (and collection.length is already
                    // adjusted).
                    selectIndex = this.selectIfRemoved.indexOf( "next" ) !== -1 ? modelIndex : modelIndex - 1;
                    if ( this.selectIfRemoved.indexOf( "NoLoop" ) !== -1 ) {
                        selectIndex = Math.max( Math.min( selectIndex, this.length - 1 ), 0 );
                    }
    
                    at_looped( selectIndex, this ).select();
                },
    
                _cycleType: "Backbone.Cycle.SelectableCollection"
    
            }
    
        };
    
        /**
         * Public setup methods for the mixins
         */
        Backbone.Cycle = {
    
            Model: {
    
                /**
                 * Model mixin
                 * -----------
                 *
                 * @param {Object} hostObject
                 */
                applyTo: function ( hostObject ) {
                    _.extend( hostObject, CycleMixins.Model );
                }
    
            },
    
            SelectableModel: {
    
                /**
                 * SelectableModel mixin
                 * ---------------------
                 *
                 * The SelectableModel mixin provides the same methods as the Model mixin. (It isn't even represented by an
                 * object of its own in CycleMixins.)
                 *
                 * In addition to the Model mixin methods, it includes Backbone.Select.Me, making the host object selectable
                 * (as the mixin name suggests). There is no need to apply Backbone.Select.Me separately.
                 *
                 * @param {Object} hostObject
                 */
                applyTo: function ( hostObject ) {
                    // Apply the Backbone.Select.Me mixin
                    Backbone.Select.Me.applyTo( hostObject );
    
                    // Apply the Cycle.Model mixin and an identifier for Cycle.SelectableModel
                    _.extend( hostObject, CycleMixins.Model, { _cycleType: "Backbone.Cycle.SelectableModel" } );
                }
    
            },
    
            SelectableCollection: {
    
                /**
                 * SelectableCollection mixin
                 * --------------------------
                 *
                 * Backbone.Cycle.SelectableCollection requires Backbone.Select. Therefore, the setup extends the host object with
                 * Backbone.Select.One in the process (no need to apply Select.One separately).
                 *
                 * Backbone.Select.Many is not supported yet.
                 *
                 * @param {Object}        hostObject
                 * @param {Backbone.Cycle.SelectableModel[]} models           models passed to the collection constructor
                 * @param {Object}        [options]
                 * @param {string|number} [options.autoSelect="none"]         which item to select when the collection is reset:
                 *                                                            "first", "last", "none", item index
                 * @param {string}        [options.selectIfRemoved="none"]    which item to select when the currently selected item
                 *                                                            is removed: "prev", "next", "prevNoLoop", "nextNoLoop",
                 *                                                            "none"
                 * @param {boolean}       [options.enableModelSharing=false]  enables model-sharing mode (see Backbone.Select)
                 */
                applyTo: function ( hostObject, models, options ) {
    
                    var enableInitialSelection, enableSelectIfRemoved, enableModelSharing, autoSelectIndex;
    
                    // Enforcing the presence of the models argument. (The rest of the arg validation is handled by
                    // Backbone.Select.One.)
                    if ( arguments.length < 2 ) throw new Error( "The `models` parameter has not been passed to Backbone.Cycle.SelectableCollection.applyTo. Its value can be undefined if no models are passed in during instantiation, but even so, it must be provided." );
    
                    options || ( options = {} );
    
                    // Transfer the options to the host object
                    // (NB initialSelection is an alias of autoSelect, but deprecated.)
                    hostObject.autoSelect = options.autoSelect || options.initialSelection || "none";
                    hostObject.selectIfRemoved  = options.selectIfRemoved || "none";
    
                    // Validate the option values
                    if ( ! _.contains( [ "first", "last", "none" ], hostObject.autoSelect ) && ! is_integer( hostObject.autoSelect ) ) throw new Error( 'Invalid autoSelect value "' + hostObject.autoSelect + '"' );
                    if ( ! _.contains( [ "prev", "next", "prevNoLoop", "nextNoLoop", "none" ], hostObject.selectIfRemoved ) ) throw new Error( 'Invalid selectIfRemoved value "' + hostObject.selectIfRemoved + '"' );
    
                    enableInitialSelection = hostObject.autoSelect !== "none";
                    enableSelectIfRemoved = hostObject.selectIfRemoved !== "none";
                    enableModelSharing = options.enableModelSharing || enableInitialSelection || enableSelectIfRemoved;
    
                    // Apply the Backbone.Select.One mixin
                    Backbone.Select.One.applyTo( hostObject, models, { enableModelSharing: enableModelSharing } );
    
                    // Apply the Cycle.SelectableCollection mixin
                    _.extend( hostObject, CycleMixins.SelectableCollection );
    
                    // Make the options effective by setting up the corresponding event handlers, and the initial selection state
                    if ( enableSelectIfRemoved ) hostObject.listenTo( hostObject, "deselect:one", hostObject.selectOnRemove );
    
                    if ( enableInitialSelection ) {
    
                        if ( !hostObject.selected && models && models.length ) {
    
                            autoSelectIndex = getAutoSelectIndex( hostObject.autoSelect, models );
                            if ( models[autoSelectIndex] ) {
                                hostObject.selected = models[autoSelectIndex];
                                models[autoSelectIndex].select();
                            }
    
                        }
    
                        hostObject.listenTo( hostObject, "add", hostObject.selectInitial );
                        hostObject.listenTo( hostObject, "reset", hostObject.selectInitial );
                    }
    
                }
    
            }
    
        };
    
    
        // Helper function
        function at_looped ( index, collection ) {
            var inRange = index % collection.length;
            if ( inRange < 0 ) inRange = collection.length + inRange;  // in fact subtracting from length because inRange < 0
            return collection.at( inRange );
        }
    
        function at_noLoop ( index, collection ) {
            var isInRange = index >= 0 && index < collection.length;
            return isInRange ? collection.at( index ) : undefined;
        }
    
        // Also accepts integers as a string, e.g. "42". Rejects empty strings etc. See http://stackoverflow.com/a/14794066/508355
        // and related fiddle.
        function is_integer ( value ) {
            return !isNaN( value ) && parseInt( Number( value ), 10 ) == value && !isNaN( parseInt( value, 10 ) ); // jshint ignore:line
        }
    
        function getAutoSelectIndex ( autoSelectValue, models ) {
            return autoSelectValue === "first" ? 0 : ( autoSelectValue === "last" ? models.length - 1 : parseInt( autoSelectValue, 10 ) );
        }
    
    }( Backbone, _ ));
    return Backbone.Cycle;

} ));

