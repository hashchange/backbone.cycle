// Backbone.Cycle, v1.0.0
// Copyright (c)2014 Michael Heim, Zeilenwechsel.de
// Distributed under MIT license
// http://github.com/hashchange/backbone.cycle

( function( Backbone, _ ) {
    "use strict";

    /**
     * Backbone.Cycle:
     *
     * Backbone.Cycle.Collection                 (plain object)
     * Backbone.Cycle.Model                      (plain object)
     *
     * Backbone.Cycle.SelectableCollection       (constructor)
     * Backbone.Cycle.SelectableModel            (constructor)
     *
     * Plain object mixins
     * -------------------
     *
     * The base mixins, which don't have the ability to select items, are plain objects. A target object can be
     * augmented simply by calling `extend`, e.g.
     *
     *     MyModelType = Backbone.Model.extend( Backbone.Cycle.Model ).extend( ... );
     *
     * Constructor-based mixins
     * ------------------------
     *
     * The "selectable" mixins, however, are constructors functions. To augment an object with Cycle.SelectableCollection,
     * call `Cycle.SelectableCollection.applyTo` - a class method, not an instance method. The same procedure applies to
     * Cycle.SelectableModel. Example:
     *
     *     var MyCollection = Backbone.Collection.extend( {
     *
     *         initialize: function () {
     *             Backbone.Cycle.SelectableCollection.applyTo( this, { ... options here } );
     *         }
     *
     *     } );
     *
     * NB See Cycle.SelectableCollection.applyTo for the available options.
     */

    /**
     * Base mixins: Backbone.Cycle.Model, Backbone.Cycle.Collection
     *
     * These are plain objects. Apply them to the host object with `extend`.
     */
    Backbone.Cycle = {

        Collection: {

            _at_looped: function ( index ) {
                var inRange = index % this.length;
                if ( inRange < 0 ) inRange = this.length + inRange;  // in fact subtracting from length because inRange < 0
                return this.at( inRange );
            }

        },

        Model: {

            ahead: function ( n, collectionContext ) {
                var collection = collectionContext || this.collection,
                    index = collection.indexOf( this );

                if ( index === -1 ) throw new Error( "Model " + this.cid + "doesn't exist in the collection." );
                return collection._at_looped( index + n );
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
                return collection.at( index + n );
            },
            behindNoLoop: function ( n, collectionContext ) {
                return this.aheadNoLoop( -n, collectionContext );
            },
            nextNoLoop: function ( collectionContext ) {
                return this.aheadNoLoop( 1, collectionContext );
            },
            prevNoLoop: function ( collectionContext ) {
                return this.behindNoLoop( 1, collectionContext );
            }

        }

    };


    /**
     * Backbone.Cycle.SelectableModel
     *
     * A constructor-based mixin. Also includes Backbone.Picky.Selectable, no need to apply it separately. For setup,
     * apply the mixin to a host object with `Backbone.Cycle.SelectableModel.applyTo( hostObject );`.
     *
     * @class   {Backbone.Cycle.SelectableModel}
     * @extends {Backbone.Cycle.Model}
     * @extends {Backbone.Picky.Selectable}
     * @extends {Backbone.Model}
     */
    Backbone.Cycle.SelectableModel = function () {};

    _.extend( Backbone.Cycle.SelectableModel.prototype, Backbone.Cycle.Model );

    /**
     * Class method setting up a host object with the SelectableModel mixin.
     *
     * Backbone.Cycle.SelectableModel requires Backbone.Picky. Therefore, it extends the host object with
     * Picky.Selectable in the process (no need to apply Picky.Selectable separately).
     *
     * @param {Object} hostObject
     */
    Backbone.Cycle.SelectableModel.applyTo = function ( hostObject ) {
        // Apply the Backbone.Picky.Selectable mixin
        Backbone.Picky.Selectable.applyTo( hostObject );

        // Apply the Cycle.SelectableModel mixin
        _.extend( hostObject, new Backbone.Cycle.SelectableModel() );
    };


    /**
     * Backbone.Cycle.SelectableCollection
     *
     * A constructor-based mixin. Also includes Backbone.Picky.SingleSelect, no need to apply it separately. For setup,
     * apply the mixin to a host object with `Backbone.Cycle.SelectableCollection.applyTo( hostObject );`.
     *
     * @class   {Backbone.Cycle.SelectableCollection}
     * @extends {Backbone.Cycle.Collection}
     * @extends {Backbone.Picky.SingleSelect}
     * @extends {Backbone.Collection}
     */
    Backbone.Cycle.SelectableCollection = function () {};

    _.extend( Backbone.Cycle.SelectableCollection.prototype, Backbone.Cycle.Collection, /** @lends {Backbone.Cycle.SelectableCollection.prototype} */ {

        selectAt: function ( index ) {
            // Convenience method, unrelated to the cycle functionality
            var model = this.at( index );
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
            return this._at_looped( this.indexOf( this.selected ) + n );
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
            return this.at( this.indexOf( this.selected ) + n );
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
            if ( this.length && ! this.selected ) {
                if ( this.initialSelection === "first" ) this.first().select();
            }
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

            this._at_looped( selectIndex ).select();
        }

    } );

    /**
     * Class method setting up a host object with the SelectableCollection mixin.
     *
     * Backbone.Cycle.SelectableCollection requires Backbone.Picky. Therefore, it extends the host object with
     * Picky.SingleSelect in the process (no need to apply Picky.SingleSelect separately).
     *
     * Picky.MultiSelect is not supported yet.
     *
     * @param {Object} hostObject
     * @param {Backbone.Cycle.SelectableModel[]} models    models passed to the collection constructor
     * @param {Object} [options]
     * @param {string} [options.initialSelection="none"]   which item to select when the collection is reset: "first",
     *                                                     "none"
     * @param {string} [options.selectIfRemoved="none"]    which item to select when the currently selected item is
     *                                                     removed: "prev", "next", "prevNoLoop", "nextNoLoop", "none"
     * @param {string} [options.enableModelSharing=false]  enables model-sharing mode (see Backbone.Picky)
     */
    Backbone.Cycle.SelectableCollection.applyTo = function ( hostObject, models, options ) {

        var enableInitialSelection, enableSelectIfRemoved, enableModelSharing;

        options || ( options = {} );

        // Transfer the options to the host object
        hostObject.initialSelection = options.initialSelection || "none";
        hostObject.selectIfRemoved  = options.selectIfRemoved || "none";

        // Validate the option values
        if ( ! _.contains( [ "first", "none" ], hostObject.initialSelection ) ) throw new Error( 'Invalid initialSelection value "' + hostObject.initialSelection + '"' );
        if ( ! _.contains( [ "prev", "next", "prevNoLoop", "nextNoLoop", "none" ], hostObject.selectIfRemoved ) ) throw new Error( 'Invalid selectIfRemoved value "' + hostObject.selectIfRemoved + '"' );

        enableInitialSelection = hostObject.initialSelection !== "none";
        enableSelectIfRemoved = hostObject.selectIfRemoved !== "none";
        enableModelSharing = options.enableModelSharing || enableInitialSelection || enableSelectIfRemoved;

        // Apply the Backbone.Picky.Selectable mixin
        if ( enableModelSharing ) {
            // model-sharing mode
            Backbone.Picky.SingleSelect.applyTo( hostObject, models );
        } else {
            Backbone.Picky.SingleSelect.applyTo( hostObject );
        }

        // Apply the Cycle.SelectableCollection mixin
        _.extend( hostObject, new Backbone.Cycle.SelectableCollection() );

        // Make the options effective by setting up the corresponding event handlers, and the initial selection state
        if ( enableSelectIfRemoved ) hostObject.listenTo( hostObject, "deselect:one", hostObject.selectOnRemove );

        if ( enableInitialSelection ) {

            if ( !hostObject.selected && models && models.length ) {
                hostObject.selected = models[0];
                models[0].select();
            }

            hostObject.listenTo( hostObject, "add", hostObject.selectInitial );
            hostObject.listenTo( hostObject, "reset", hostObject.selectInitial );
        }

    };

}( Backbone, _ ));